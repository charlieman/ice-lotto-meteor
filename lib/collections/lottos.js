Lottos = new Mongo.Collection('lottos');
Lottos.allow({
  insert: function (userId, doc) {
    var user = Lottos.findOne(userId);
    return user["master"] === true;
  }
});

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
      tiers: createTiers(),
      smallpot: 0,
      bigpot: 0,
      entries: [],
      winners: {},
      smallpot_winner: null,
      bigpot_winner: null,
      created: new Date()
    });

    var lottoId = Lottos.insert(lotto);
    return {
      _id: lottoId
    }
  }
});

var createTiers = function () {
  var tiers = [];
  for (var i = 0; i < 20; i++) {
    tiers.push({tier: i + 1, prizes: {}});
  }
  return tiers;
};