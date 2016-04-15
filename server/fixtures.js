if (Meteor.users.find().count() === 0) {
  //accounts
  Accounts.createUser({
    username: 'nerium',
    password: 'nerium',
    profile: {verified: true, admin: true, superadmin: true, sapowers: false}
  });

  var nerium = Meteor.users.findOne({username: 'nerium'});

  // gwusers
  GWUsers.insert({alts: ['atuq', 'Nerium', 'Erchamion', 'Charr Mingus']});
  GWUsers.insert({alts: ['Semaj']});
  GWUsers.insert({alts: ['Mia Wynd']});
  GWUsers.insert({alts: ['stonedragon', 'Robyn Wynd', 'Asunder Wynd']});

  gwusers = GWUsers.find().fetch();

  //lotto
  smallpot_users = gwusers.slice(0, 2);
  bigpot_users = gwusers.slice(2);

  var entries = [];
  // for the small pot
  for (i = 1; i <= 5; i++) {
    if (Math.random() > 0.6) {
      entries.push({_id: Random.id(), gwuserId: Random.choice(smallpot_users)._id, amount: i});
    }
  }

  for (i = 1; i <= 20; i++) {
    _.each(bigpot_users, function(gwuser) {
      if (Math.random() > 0.5) {
        entries.push({_id: Random.id(), gwuserId: gwuser._id, amount: i});
      }
    });
  }
  
  var pots = updatePots(entries);

  var lottoId = Lottos.insert({
    userId: nerium._id,
    date: new Date(2015, 3, 4), // month is zero based
    smallpot: pots.smallpot_total,
    bigpot: pots.bigpot_total,
    smallpot_entries: pots.smallpot_entries,
    bigpot_entries: pots.bigpot_entries,
    entries: entries,
    smallpot_winner: undefined,
    bigpot_winner: undefined,
    created: new Date()
  });

  // lotto tiers
  for (var i = 0; i < 20; i++) {
    var prizes = [];
    for (var j = 0; j < 10; j++) {
      if (Math.random() > 0.3) {
        prizes.push({_id: Random.id(), pos: j + 1, prize: 'prize ' + i + '-' + j});
      }
    }
    Tiers.insert({tier: i + 1, lottoId: lottoId, prizes: prizes});
  }
}
