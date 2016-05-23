import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Bank } from '../imports/lib/bank';

Meteor.methods({
  createTiers: function (lottoId) {
    for (var i = 2; i <= 20; i+=2) {
      Tiers.insert({tier: i, lottoId: lottoId, prizes: []});
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
  },
  getItemsFromAPI: function() {
    const apiKey = Meteor.settings.apiKey;
    const guildId = Meteor.settings.guildId;

    const bank = new Bank(apiKey, guildId);
    return bank.getItems(Meteor.settings.inventory);
  },
  getLogFromAPI: function() {
    const apiKey = Meteor.settings.apiKey;
    const guildId = Meteor.settings.guildId;

    const bank = new Bank(apiKey, guildId);
    return bank.getMoneyLog();
  }
});
