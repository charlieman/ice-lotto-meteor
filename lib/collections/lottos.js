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
      winners: [],
      smallpot_winner: null,
      bigpot_winner: null,
      created: new Date(),
      type: 'double'
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

    var entry = {
      gwuserId: replaceDots(entryAttributes.gwuserId),
      amount: entryAttributes.amount,
      _id: Random.id(),
    };

    var allEntries = _.union(lotto.entries, entry);
    var pots = updatePots(allEntries, lotto.type);

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
    var pots = updatePots(entries, lotto.type);

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
  entriesAdd: function(lottoId, newEntries) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(newEntries, [{
      gwuserId: String,
      amount: Number
    }]);

    const lotto = Lottos.findOne(lottoId);
    if (lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is closed');
    }

    const entries = newEntries.map((e) => ({
      amount: e.amount,
      gwuserId: replaceDots(e.gwuserId),
      _id: Random.id(),
    }));

    const allEntries = _.union(lotto.entries, entries);
    const pots = updatePots(allEntries, lotto.type);

    const updated = Lottos.update(lottoId, {
      $set: {
        smallpot: pots.smallpot_total,
        bigpot: pots.bigpot_total,
        smallpot_entries: pots.smallpot_entries,
        bigpot_entries: pots.bigpot_entries
      },
      $addToSet: {entries: {$each: entries}}
    });

    return {updated: updated};
  },
  rollForTier: function(lottoId, tier) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(tier, Number);

    var lotto = Lottos.findOne(lottoId);
    if (!lotto || !lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is not closed');
    }
    var entries = _.filter(lotto.entries, function (x) {
      return x.amount === tier;
    });

    if (_.any(entries, function(entry) {return !!entry.winner;})) {
      throw new Meteor.Error('invalid-entry', 'Tier has a winner');
    }

    if (Meteor.isClient) {
      return {};
    }

    var gamblerFactory = require('gambler');

    // Roll for winner
    var winnerEntry = null;
    if (entries.length === 0) {
      return {};
    } else if (entries.length === 1) {
      winnerEntry = entries[0];
    } else {
      var gambler = gamblerFactory(entries);
      winnerEntry = gambler.drawCard();
    }

    // Roll for prize
    var prize = null;
    var tierObj = Tiers.findOne({lottoId: lottoId, tier: tier});
    if (tierObj.prizes.length === 0) {
      return {};
    } else if (tierObj.prizes.length === 1) {
      prize = tierObj.prizes[0];
    } else {
      var prizeGambler = gamblerFactory(tierObj.prizes);
      prize = prizeGambler.drawCard();
    }

    Tiers.update({_id: tierObj._id, prizes: prize}, {
      $set: {'prizes.$.winner': true}
    });

    Lottos.update({_id: lottoId, entries: winnerEntry}, {
      $set: {'entries.$.winner': true}
    });
    return {winnerId: winnerEntry._id, prize: prize.pos};
  },
  rollForPot: function(lottoId, pot) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(pot, String);
    
    var lotto = Lottos.findOne(lottoId);
    if (!lotto || !lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is not closed');
    }

    if (Meteor.isClient) {
      return {};
    }

    var entries = null;
    var field = null;
    if (pot === 'small') {
      entries = lotto.smallpot_entries;
      field = 'smallpot_winner';
    } else {
      entries = lotto.bigpot_entries;
      field = 'bigpot_winner';
    }

    if (!!lotto[field]) {
      throw new Meteor.Error('invalid-entry', 'Pot has a winner');
    }

    entries = _.flatten(_.map(_.keys(entries), function(e) {a=[];for(var i=0,l=entries[e];i<l;++i){a.push({id: e})}; return a;}));

    var gamblerFactory = require('gambler');

    // Roll for pot winner
    var winner = null;
    if (entries.length === 0) {
      return {};
    } else if (entries.length === 1) {
      winner = entries[0];
    } else {
      var gambler = gamblerFactory(entries);
      winner = gambler.drawCard();
    }

    var update = {};
    update[field] = winner.id;
    Lottos.update(lottoId, {
      $set: update
    });

    return {id: winner.id};
  },
  unrollForPot: function(lottoId, pot) {
    if (!isSuperAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(pot, String);

    var field = null;
    if (pot === 'small') {
      field = 'smallpot_winner';
    } else {
      field = 'bigpot_winner';
    }

    var update = {};
    update[field] = null;
    
    Lottos.update(lottoId, {
      $set: update
    });
  },
  unrollForTier: function(lottoId, tier) {
    if (!isSuperAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(tier, Number);
    l = Lottos.findOne(lottoId);
    t = Tiers.findOne({lottoId: l._id, tier: tier});
    p = _.find(t.prizes, function(p) {return p.winner === true});
    e = _.find(l.entries, function(e) {return e.amount === tier && e.winner === true});
    
    Tiers.update({_id: t._id, prizes: p}, {$unset: {'prizes.$.winner': true}});
    Lottos.update({_id: l._id, entries: e}, {$unset: {'entries.$.winner': true}});
  },

  populateItems: function(lottoId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);

    var lotto = Lottos.findOne(lottoId);
    if (!lotto || lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is closed');
    }

    if (Meteor.isClient) {
      return {};
    }

    // Populate each tier prize with the items from the API
    Meteor.call('getItemsFromAPI', function(error, items) {
      if (error) {
        throw new Meteor.Error("error", error.reason);
      }

      var tiers = Tiers.find({lottoId: lottoId}).fetch();

      var n = 0;
      _.each(tiers, (tier) => {
        
        var prizes = [];
        var prizesByPos = _.indexBy(tier.prizes, 'pos');

        _.each(items.slice(n, n + 10), (item, i) => {

          if (item == null) return;

          var prize = prizesByPos[i+1];
          if (prize == null) {
            prize = {_id: Random.id(), pos: i+1};
          }
          
          prizes.push(_.extend({}, prize, _.pick(item, 'id', 'icon', 'name', 'rarity', 'count') ));
        });
        
        n += 10;
        Tiers.update({_id: tier._id}, {$set: {prizes: prizes}});
      });
    });
  },

  deleteLotto: function(lottoId) {
    if (!isSuperAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);

    var lotto = Lottos.findOne(lottoId);
    if (!lotto) {
      throw new Meteor.Error('invalid-entry', "Lotto doesn't exist");
    }

    Lottos.remove({_id: lottoId});
    Tiers.remove({lottoId: lottoId});
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
updatePots = function (entries, type) {
  var smallpot = {};
  var bigpot = {};

  // an entry with more than 10g goes to the bigpot
  // a total of 20g or more to the bigpot
  _.each(entries, function (entry) {
    var total = (smallpot[entry.gwuserId] || 0) + (bigpot[entry.gwuserId] || 0) + entry.amount;
    if ((type === 'double' && total >= 20) || (type !== 'double' && (entry.amount > 10 || total >= 20))) {
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
