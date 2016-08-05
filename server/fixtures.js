if (Meteor.users.find().count() === 0) {
  //accounts
  const adminId = Accounts.createUser({
    username: 'admin',
    password: 'admin',
    profile: {verified: true, admin: true, superadmin: true, sapowers: false}
  });

  // gwusers
  let gwusers = [];
  gwusers.push(GWUsers.insert({account: 'foo@1234', alts: ['Foo']}));
  gwusers.push(GWUsers.insert({account: 'bar@2345', alts: ['Bar']}));
  gwusers.push(GWUsers.insert({account: 'baz@3456', alts: ['Baz']}));
  gwusers.push(GWUsers.insert({account: 'qux@1234', alts: ['Qux']}));

  //lotto
  smallpot_users = gwusers.slice(0, 2);
  bigpot_users = gwusers.slice(2);

  let entries = [];
  // for the small pot
  for (i = 1; i <= 5; i++) {
    if (Math.random() > 0.6) {
      entries.push({_id: Random.id(), gwuserId: Random.choice(smallpot_users), amount: i});
    }
  }

  for (i = 1; i <= 20; i++) {
    _.each(bigpot_users, function(gwuser) {
      if (Math.random() > 0.5) {
        entries.push({_id: Random.id(), gwuserId: gwuser, amount: i});
      }
    });
  }

  const pots = updatePots(entries, 'double');

  const lottoId = Lottos.insert({
    userId: adminId,
    date: new Date(2015, 3, 4), // month is zero based
    smallpot: pots.smallpot_total,
    bigpot: pots.bigpot_total,
    smallpot_entries: pots.smallpot_entries,
    bigpot_entries: pots.bigpot_entries,
    entries: entries,
    smallpot_winner: undefined,
    bigpot_winner: undefined,
    created: new Date(),
    type: 'double'
  });

  // lotto tiers
  for (let i = 0; i < 20; i++) {
    let prizes = [];
    for (let j = 0; j < 10; j++) {
      if (Math.random() > 0.3) {
        prizes.push({_id: Random.id(), pos: j + 1, prize: 'prize ' + i + '-' + j});
      }
    }
    Tiers.insert({tier: i + 1, lottoId: lottoId, prizes: prizes});
  }
}
