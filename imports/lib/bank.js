'use strict';

import { HTTP } from 'meteor/http';
import { _ } from 'underscore';

const baseUrl = 'https://api.guildwars2.com/v2';

function Bank(apiKey, guildId) {
  this.apiKey = apiKey;
  this.token = `access_token=${this.apiKey}`;
  this.guildId = guildId;
}

Bank.prototype.getItems = function getItems(stashName) {
  const request = HTTP.get(`${baseUrl}/guild/${this.guildId}/stash?${this.token}`);
  const lowerStash = stashName.toLowerCase();

  const stash = request.data.find((r) => r.note.toLowerCase() === lowerStash);
  const ids = stash.inventory.filter((inv) => !!inv).map((inv) => inv.id);
  
  const idsRequest = HTTP.get(`${baseUrl}/items?ids=${ids.join(',')}`);
  const itemsByid = _.indexBy(idsRequest.data, 'id');

  const items = stash.inventory.map((inv) => inv === null? null : _.extend({}, inv, itemsByid[inv.id]));

  return items;
};

Bank.prototype.getMoneyLog = function getMoneyLog() {
  const request = HTTP.get(`${baseUrl}/guild/${guildId}/log?${this.token}`);

  const withdrawals = request.data.filter((r) => r.operation === 'withdraw')
  const deposits = request.data.filter((r) => r.operation === 'deposit');

  return {deposits, withdrawals};
};

exports.Bank = Bank;