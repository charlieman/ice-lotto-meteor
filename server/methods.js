Meteor.methods({
  createTiers: function (lottoId) {
    for (var i = 0; i < 20; i++) {
      Tiers.insert({tier: i + 1, lottoId: lottoId, prizes: []});
    }
  },
  duplicateTiers: function(lottoId, lastLottoId) {
    var omitPrize = function omitPrize(x) { return _.omit(x, 'winner');};
    var tiersToDuplicate = Tiers.find({lottoId: lastLottoId});
    tiersToDuplicate.forEach(function(tier) {
      var prizes = _.map(tier.prizes, omitPrize);
      var newTier = {
        lottoId: lottoId,
        tier: tier.tier,
        prizes: prizes
      }
      Tiers.insert(newTier);
    });
  }
});