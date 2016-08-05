Lottos = new Mongo.Collection('lottos');

Meteor.methods({
  lottoInsert(data, autofill) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(data, {
      date: Date
    });
    check(autofill, Boolean);

    const lottoWithSameDate = Lottos.findOne({date: data.date});
    if (lottoWithSameDate) {
      return {
        lottoExists: true,
        _id: lottoWithSameDate._id
      };
    }

    const user = Meteor.user();
    let lotto = _.extend(data, {
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

    let lastLotto;
    if (autofill) {
      lastLotto = Lottos.findOne({}, {fields: {_id: 1}, sort: {date: -1}});
    }

    const lottoId = Lottos.insert(lotto);

    if (autofill && lastLotto && lastLotto._id) {
      Meteor.call('duplicateTiers', lottoId, lastLotto._id);
    } else {
      Meteor.call('createTiers', lottoId);
    }

    return { _id: lottoId };
  },
  lottoPublicToggle(lottoId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);

    //TODO: maybe find a way to make these 2 operations atomic
    //MongoDB has xor (https://jira.mongodb.org/browse/SERVER-4362)
    //but minimongo doesn't support it (https://github.com/meteor/meteor/blob/master/packages/minimongo/modify.js#L410)
    const lotto = Lottos.findOne(lottoId);
    const updated = Lottos.update(lottoId, {
      $set: { public: !lotto.public}
    });
    return {updated: updated};
  },
  lottoToggleClose(lottoId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);

    const lotto = Lottos.findOne(lottoId);
    const updated = Lottos.update(lottoId, {
      $set: { closed: !lotto.closed}
    });
    return {updated: updated};
  },
  entryAdd(entryAttributes, lottoId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(entryAttributes, {
      gwuserId: String,
      amount: Number
    });

    const errors = validateEntry(entryAttributes);
    if (errors.gwuserId || errors.amount) {
      throw new Meteor.Error('invalid-entry', 'You must select a user');
    }

    const gwuser = GWUsers.findOne({ $or: [
      {_id: entryAttributes.gwuserId},
      {account: entryAttributes.gwuserId}
    ] });

    if (!gwuser) {
      throw new Meteor.Error('invalid-entry', 'User not found');
    }

    const lotto = Lottos.findOne(lottoId);
    if (lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is closed');
    }

    let entry = {
      gwuserId: replaceDots(entryAttributes.gwuserId),
      amount: entryAttributes.amount,
      _id: Random.id(),
    };

    const allEntries = _.union(lotto.entries, entry);
    const pots = updatePots(allEntries, lotto.type);

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
  entryRemove(entryId, lottoId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(entryId, String);

    const lotto = Lottos.findOne(lottoId);
    if (lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is closed');
    }

    const entries = _.filter(lotto.entries, (e) => e._id !== entryId);
    const pots = updatePots(entries, lotto.type);

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
  entriesAdd(lottoId, newEntries) {
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
  rollForTier(lottoId, tier) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(tier, Number);

    const lotto = Lottos.findOne(lottoId);
    if (!lotto || !lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is not closed');
    }
    const entries = _.filter(lotto.entries, (x) => x.amount === tier);

    if (_.any(entries, (entry) => !!entry.winner)) {
      throw new Meteor.Error('invalid-entry', 'Tier has a winner');
    }

    if (Meteor.isClient) {
      return {};
    }

    const gamblerFactory = require('gambler');

    // Roll for winner
    let winnerEntry = null;
    if (entries.length === 0) {
      return {};
    } else if (entries.length === 1) {
      winnerEntry = entries[0];
    } else {
      const gambler = gamblerFactory(entries);
      winnerEntry = gambler.drawCard();
    }

    // Roll for prize
    let prize = null;
    const tierObj = Tiers.findOne({lottoId: lottoId, tier: tier});
    if (tierObj.prizes.length === 0) {
      return {};
    } else if (tierObj.prizes.length === 1) {
      prize = tierObj.prizes[0];
    } else {
      const prizeGambler = gamblerFactory(tierObj.prizes);
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
  rollForPot(lottoId, pot) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(pot, String);

    const lotto = Lottos.findOne(lottoId);
    if (!lotto || !lotto.closed) {
      throw new Meteor.Error('invalid-entry', 'Lotto is not closed');
    }

    if (Meteor.isClient) {
      return {};
    }

    let entries = null;
    let field = null;
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

    entries = _.flatten(_.map(_.keys(entries), function(e) {
      a=[];
      for(let i=0, l=entries[e]; i < l; ++i){
        a.push({id: e})
      }
      return a;
    }));

    const gamblerFactory = require('gambler');

    // Roll for pot winner
    let winner = null;
    if (entries.length === 0) {
      return {};
    } else if (entries.length === 1) {
      winner = entries[0];
    } else {
      const gambler = gamblerFactory(entries);
      winner = gambler.drawCard();
    }

    const update = {
      [field]: winner.id,
    };

    Lottos.update(lottoId, {
      $set: update
    });

    return {id: winner.id};
  },
  unrollForPot(lottoId, pot) {
    if (!isSuperAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(pot, String);

    let field = null;
    if (pot === 'small') {
      field = 'smallpot_winner';
    } else {
      field = 'bigpot_winner';
    }

    const update = {
      [field]: null,
    };

    Lottos.update(lottoId, {
      $set: update
    });
  },
  unrollForTier(lottoId, tier) {
    if (!isSuperAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);
    check(tier, Number);

    const l = Lottos.findOne(lottoId);
    const t = Tiers.findOne({lottoId: l._id, tier: tier});

    const p = _.find(t.prizes, (p) => p.winner === true);
    const e = _.find(l.entries, (e) => (e.amount === tier && e.winner === true));

    Tiers.update({_id: t._id, prizes: p}, {$unset: {'prizes.$.winner': true}});
    Lottos.update({_id: l._id, entries: e}, {$unset: {'entries.$.winner': true}});
  },

  populateItems(lottoId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);

    const lotto = Lottos.findOne(lottoId);
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

      const tiers = Tiers.find({lottoId: lottoId}).fetch();

      let n = 0;
      _.each(tiers, (tier) => {

        let prizes = [];
        const prizesByPos = _.indexBy(tier.prizes, 'pos');

        _.each(items.slice(n, n + 10), (item, i) => {

          if (item == null) return;

          let prize = prizesByPos[i+1];
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

  deleteLotto(lottoId) {
    if (!isSuperAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(lottoId, String);

    const lotto = Lottos.findOne(lottoId);
    if (!lotto) {
      throw new Meteor.Error('invalid-entry', "Lotto doesn't exist");
    }

    Lottos.remove({_id: lottoId});
    Tiers.remove({lottoId: lottoId});
  }
});

validateEntry = function (entry) {
  let errors = {};
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
  let smallpot = {};
  let bigpot = {};

  // an entry with more than 10g goes to the bigpot
  // a total of 20g or more to the bigpot
  _.each(entries, function (entry) {
    const total = (smallpot[entry.gwuserId] || 0) + (bigpot[entry.gwuserId] || 0) + entry.amount;
    if ((type === 'double' && total >= 20) || (type !== 'double' && (entry.amount > 10 || total >= 20))) {
      delete smallpot[entry.gwuserId];
      bigpot[entry.gwuserId] = total;
    } else {
      smallpot[entry.gwuserId] = total;
    }
  });
  const sum = (m, e) => m + e;
  return {
    smallpot_entries: smallpot,
    smallpot_total: _.reduce(smallpot, sum, 0),
    bigpot_entries: bigpot,
    bigpot_total: _.reduce(bigpot, sum, 0)
  };
};
