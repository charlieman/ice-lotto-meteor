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
  Accounts.createUser({
    username: 'borg',
    password: 'borg',
    profile: {verified: false, alts: []}
  });
  var nerium = Meteor.users.findOne({username: 'nerium'});
  var foobar = Meteor.users.findOne({username: 'foobar'});
  var baz = Meteor.users.findOne({username: 'baz'});
  var borg = Meteor.users.findOne({username: 'borg'});

  var tiers = [];
  for (var i = 0; i < 20; i++) {
    var prizes = [];
    for (var j = 0; j < 10; j++) {
      if (Math.random() > 0.3) {
        prizes.push({_id: Random.id(), pos: j + 1, prize: 'prize ' + i + '-' + j});
      }
    }
    tiers.push({_id: Random.id(), tier: i + 1, prizes: prizes});
  }
  var entries = [];

  // for the small pot
  for (i = 0; i < 5; i++) {
    if (Math.random() > 0.6) {
      entries.push({_id: Random.id(), userId: borg._id, username: borg.username, amount: i});
    }
  }
  for (i = 0; i < 20; i++) {
    _.each([nerium, foobar, baz], function (user) {
      if (Math.random() > 0.5) {
        entries.push({_id: Random.id(), userId: user._id, username: user.username, amount: i});
      }
    });
  }

  var pots = updatePots(entries);

  Lottos.insert({
    userId: nerium._id,
    date: new Date(2014, 10, 1), // month is zero based
    tiers: tiers,
    smallpot: pots.smallpot_total,
    bigpot: pots.bigpot_total,
    smallpot_entries: pots.smallpot,
    bigpot_entries: pots.bigpot,
    entries: entries,
    winners: [],
    smallpot_winner: undefined,
    bigpot_winner: undefined,
    created: new Date()
  });
}
