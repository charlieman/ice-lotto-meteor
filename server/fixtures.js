if (Lottos.find().count() === 0) {

  var neriumId = Meteor.users.insert({
    profile: { name: 'Nerium', verified: true, admin: true }
  });
  var nerium = Meteor.users.findOne(neriumId);

  Lottos.insert({
    userId: nerium._id,
    date: new Date(2014, 11, 1),
    tiers: [
      {tier: 1, prices: {1: 'foo', 2: 'bar', 3: 'baz', 5: 'yoo'}},
      {tier: 2, prices: {1: 'foo', 2: 'bar', 4: 'baz', 5: 'yoo'}},
      {tier: 3, prices: {1: 'foo', 2: 'bar', 3: 'baz', 4: 'yoo'}},
      {tier: 4, prices: {1: 'foo', 2: 'bar', 3: 'baz', 4: 'yoo', 5: 'dawg'}},
      {tier: 5, prices: {1: 'foo', 2: 'bar', 3: 'baz', 4: 'yoo', 5: 'dawg', 6: 'foo', 7: 'bar', 8: 'baz', 9: 'yoo', 10: 'dawg'}}
    ],
    smallpot: 20,
    bigpot: 180,
    entries: [
      {userid: 111, amount: 1},
      {userid: 111, amount: 2},
      {userid: 111, amount: 3},
      {userid: 222, amount: 2},
      {userid: 333, amount: 4},
      {userid: 444, amount: 4},
      {userid: 444, amount: 4}
    ],
    winners: {},
    smallpot_winner: null,
    bigpot_winner: null,
    created: new Date()
  });
}
