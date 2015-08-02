Lottos = new Mongo.Collection('lottos');

Meteor.methods({
  lottoInsert: function (data, autofill) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(data, {
      date: Date
    });
    check(autofill, Boolean);

    var lottoWithSameDate = Lottos.findOne({date: data.date});
    if (lottoWithSameDate) {
      return {
        lottoExists: true,
        _id: lottoWithSameDate._id
      };
    }

    var user = Meteor.user();
    var lotto = _.extend(data, {
      userId: user._id,
      smallpot: 0,
      bigpot: 0,
      entries: [],
      winners: {},
      smallpot_winner: null,
      bigpot_winner: null,
      created: new Date()
    });

    var lastLotto;
    if (autofill) {
      lastLotto = Lottos.findOne({}, {fields: {_id: 1}, sort: {date: -1}});
    }

    var lottoId = Lottos.insert(lotto);

    if (lastLotto && lastLotto._id) {
      Meteor.call('duplicateTiers', lottoId, lastLotto._id);
    } else {
      Meteor.call('createTiers', lottoId);
    }

    return { _id: lottoId };
  },
  lottoPublicToggle:function(lottoId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    
    //TODO: maybe find a way to make these 2 operations atomic
    //MongoDB has xor (https://jira.mongodb.org/browse/SERVER-4362)
    //but minimongo doesn't support it (https://github.com/meteor/meteor/blob/master/packages/minimongo/modify.js#L410)
    var lotto = Lottos.findOne(lottoId);
    var updated = Lottos.update(lottoId, {
      $set: { public: !lotto.public}
    });
    return {updated: updated};
  },
  lottoToggleClose: function(lottoId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    
    var lotto = Lottos.findOne(lottoId);
    var updated = Lottos.update(lottoId, {
      $set: { closed: !lotto.closed}
    });
    return {updated: updated};
  },
  entryAdd: function (entryAttributes, lottoId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(entryAttributes, {
      gwuserId: String,
      amount: Number
    });

    var errors = validateEntry(entryAttributes);
    if (errors.gwuserId || errors.amount) {
      throw new Meteor.Error('invalid-entry', 'You must select a user');
    }

    var gwuser = GWUsers.findOne(entryAttributes.gwuserId);
    if (!gwuser) {
      throw new Meteor.Error('invalid-entry', 'User not found');
    }

    var lotto = Lottos.findOne(lottoId);
    if (lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is closed');
    }

    var entry = _.extend(entryAttributes, {
      _id: Random.id()
    });

    var entries = _.union(lotto.entries, entry);
    var pots = updatePots(entries);

    Lottos.update(lottoId, {
      $set: {
        smallpot: pots.smallpot_total,
        bigpot: pots.bigpot_total,
        smallpot_entries: pots.smallpot_entries,
        bigpot_entries: pots.bigpot_entries
      },
      $addToSet: {entries: entry}
    });

    return {_id: entry._id};
  },
  entryRemove: function (entryId, lottoId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(entryId, String);

    var lotto = Lottos.findOne(lottoId);
    if (lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is closed');
    }

    var entries = _.filter(lotto.entries, function(e) { return e._id !== entryId;});
    var pots = updatePots(entries);

    Lottos.update(lottoId, {
      $set: {
        smallpot: pots.smallpot_total,
        bigpot: pots.bigpot_total,
        smallpot_entries: pots.smallpot_entries,
        bigpot_entries: pots.bigpot_entries
      },
      $pull: {entries: {_id: entryId}}
    });

    return {};
  },
  entryRoll: function(lottoId, tier) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(tier, Number);

    var lotto = Lottos.findOne(lottoId);
    if (!lotto || !lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is not closed');
    }
    if (_.any(lotto.winners, function(winner) {
      return winner.tier === tier;
    })) {
      throw new Meteor.Error('invalid-entry', 'Tier has a winner');
    }

    if (Meteor.isClient) {
      return {};
    }

    var entries = _.filter(lotto.entries, function (x) {
      return x.amount === tier;
    });
    var winnerId = null;
    var gamblerFactory = Meteor.npmRequire('gambler');
    if (entries.length === 0) {
      return {};
    } else if (entries.length === 1) {
      winnerId = entries[0].userId;
    } else {
      var gambler = gamblerFactory(entries);
      var winner = gambler.drawCard();
      winnerId = winner._id;
      console.log('winner: ' + winner._id);
    }

    // Roll for prize
    var tierObj = Tiers.findOne({lottoId: lottoId, tier: tier});

    var prizeGambler = gamblerFactory(tierObj.prizes);
    var prize = prizeGambler.drawCard();
    
    Lottos.update(lottoId, {
      $addToSet: {winners: {
        tier: tier,
        entryId: winnerId,
        prize: prize.pos
      }}
    });

    return {winnerId: winnerId, prize: prize.pos};
  }
});

validateEntry = function (entry) {
  var errors = {};
  if (!entry.gwuserId) {
    errors.gwuserId = 'Please select a user';
  }
  if (!entry.amount) {
    errors.amount = 'Please select an amount';
  }
  if (entry.amount < 1 || entry.amount > 20) {
    errors.amount = 'Wrong amount'; 
  }
  return errors;
};

// Returns two lists of players belonging to each pot and their totals
updatePots = function (entries) {
  var smallpot = {};
  var bigpot = {};

  // an entry with more than 10g goes to the bigpot
  // a total of 20g or more to the bigpot
  _.each(entries, function (entry) {
    var total = (smallpot[entry.gwuserId] || 0) + (bigpot[entry.gwuserId] || 0) + entry.amount;
    if (entry.amount > 10 || total >= 20) {
      delete smallpot[entry.gwuserId];
      bigpot[entry.gwuserId] = total;
    } else {
      smallpot[entry.gwuserId] = total;
    }
  });
  var sum = function(m, e) {return m + e;};
  return {
    smallpot_entries: smallpot,
    smallpot_total: _.reduce(smallpot, sum, 0),
    bigpot_entries: bigpot,
    bigpot_total: _.reduce(bigpot, sum, 0)
  };
};
