Meteor.methods({
  createTiers: function (lottoId) {
    for (var i = 0; i < 20; i++) {
      Tiers.insert({tier: i + 1, lottoId: lottoId, prizes: []});
    }
  },
  duplicateTiers: function(lottoId, lastLottoId) {
    tiersToDuplicate = Tiers.find({lottoId: lastLottoId});

    tiersToDuplicate.forEach(function(tier) {
      var newTier = _.omit(tier, '_id');
      newTier.lottoId = lottoId;
      Tiers.insert(newTier);
    });
  }
});