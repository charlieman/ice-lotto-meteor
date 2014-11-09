if (Lottos.find().count() === 0) {
  Accounts.createUser({
    username: 'nerium',
    password: 'nerium',
    profile: {verified: true, admin: true, alts: ['erchamion', 'char mingus']}
  });
  Accounts.createUser({
    username: 'foobar',
    password: 'foobar',
    profile: {verified: true, alts: ['foo', 'bar']}
  });
  Accounts.createUser({
    username: 'baz',
    password: 'baz',
    profile: {verified: false, alts: []}
  });
  var nerium = Meteor.users.findOne({username: 'nerium'});
  var foobar = Meteor.users.findOne({username: 'foobar'});
  var baz = Meteor.users.findOne({username: 'baz'});

  var tiers = [];
  for (var i = 0; i < 20; i++) {
    var prizes = {};
    for (var j = 0; j < 10; j++) {
      if (Math.random() > 0.3) {
        prizes[j + 1] = 'prize';
      }
    }
    tiers.push({tier: i + 1, prizes: prizes});
  }
  var entries = [];
  for (i = 0; i < 20; i++) {
    _.each([nerium, foobar, baz], function(user){
      if (Math.random() > 0.4) {
        entries.push({_id: Random.id(), userId: user._id, amount: i});
      }
    });
  }
  Lottos.insert({
    userId: nerium._id,
    date: new Date(2014, 11, 1),
    tiers: tiers,
    smallpot: 20,
    bigpot: 180,
    entries: entries,
    winners: {},
    smallpot_winner: undefined,
    bigpot_winner: undefined,
    created: new Date()
  });
}
