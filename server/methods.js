Meteor.methods({
  createTiers: function (lottoId) {
    for (var i = 0; i < 20; i++) {
      Tiers.insert({tier: i + 1, lottoId: lottoId, prizes: []});
    }
  }
});