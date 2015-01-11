Lottos = new Mongo.Collection('lottos');

Meteor.methods({
  lottoInsert: function (data) {
    check(Meteor.userId(), String);
    check(data, {
      date: Date
    });

    var lottoWithSameDate = Lottos.findOne({date: data.date});
    if (lottoWithSameDate) {
      return {
        lottoExists: true,
        _id: lottoWithSameDate._id
      }
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

    var lottoId = Lottos.insert(lotto);
    Meteor.call('createTiers', lottoId);

    return {
      _id: lottoId
    }
  },
  entryAdd: function (entryAttributes, lottoId) {
    check(Meteor.userId(), String);
    check(lottoId, String);
    check(entryAttributes, {
      userId: String,
      amount: Number
    });

    var errors = validateEntry(entryAttributes);
    if (errors.userId || errors.amount)
      throw new Meteor.Error('invalid-entry', 'You must select a user');

    var user = Meteor.users.findOne(entryAttributes.userId);
    if (!user)
      throw new Meteor.Error('invalid-entry', 'User not found');

    var entry = _.extend(entryAttributes, {
      _id: Random.id(),
      username: user.username
    });

    var lotto = Lottos.findOne(lottoId);
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

    return {
      _id: entry._id
    };
  },
  entryRemove: function (entryId, lottoId) {
    check(Meteor.userId(), String);
    check(lottoId, String);
    check(entryId, String);

    var lotto = Lottos.findOne(lottoId);
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
  }
});

validateEntry = function (entry) {
  var errors = {};
  if (!entry.userId)
    errors.userId = 'Please select a user';
  if (!entry.amount)
    errors.amount = 'Please select an amount';
  return errors;
};

// Returns two lists of players belonging to each pot and their totals
updatePots = function (entries) {
  var smallpot = {};
  var bigpot = {};

  // an entry with more than 10g goes to the bigpot
  // a total of more than 20g goes to the bigpot
  _.each(entries, function (entry) {
    var total = (smallpot[entry.userId] || 0) + (bigpot[entry.userId] || 0) + entry.amount;
    if (entry.amount > 10 || total > 20) {
      delete smallpot[entry.userId];
      bigpot[entry.userId] = total;
    } else {
      smallpot[entry.userId] = total;
    }
  });
  var sum = function(m, e) {return m + e;};
  return {
    smallpot_entries: smallpot,
    smallpot_total: _.reduce(smallpot, sum, 0),
    bigpot_entries: bigpot,
    bigpot_total: _.reduce(bigpot, sum, 0)
  }
};