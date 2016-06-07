import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Bank } from '../imports/lib/bank';

Meteor.methods({
  createTiers(lottoId) {
    for (let i = 2; i <= 20; i+=2) {
      Tiers.insert({tier: i, lottoId: lottoId, prizes: []});
    }
  },
  duplicateTiers(lottoId, lastLottoId) {
    const omitPrize = function omitPrize(x) { return _.omit(x, 'winner');};
    const tiersToDuplicate = Tiers.find({lottoId: lastLottoId});
    tiersToDuplicate.forEach(function(tier) {
      const prizes = _.map(tier.prizes, omitPrize);
      const newTier = {
        lottoId: lottoId,
        tier: tier.tier,
        prizes: prizes
      }
      Tiers.insert(newTier);
    });
  },
  getItemsFromAPI() {
    const apiKey = Meteor.settings.apiKey;
    const guildId = Meteor.settings.guildId;

    const bank = new Bank(apiKey, guildId);
    return bank.getItems(Meteor.settings.inventory);
  },
  getLogFromAPI() {
    const apiKey = Meteor.settings.apiKey;
    const guildId = Meteor.settings.guildId;

    const bank = new Bank(apiKey, guildId);
    return bank.getMoneyLog();
  },
});
