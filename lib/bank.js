'use strict';

const RestPromise = require('rest-promise');
const guildId = '1717E59C-A998-4F11-B33E-6DBF992282B2';
const baseUrl = 'https://api.guildwars2.com/v2';

function Bank(apiKey) {
  this.apiKey = apiKey;
  this.token = `access_token=${this.apiKey}`;
}

Bank.prototype.getItems = function getItems(stashName) {
  const request = new RestPromise(`${baseUrl}/guild/${guildId}/stash?${this.token}`);
  const lowerStash = stashName.toLowerCase();
  return request
    .get()
    .then((result) => {
      const stash = result.filter((r) => r.note.toLowerCase() === lowerStash);
      const ids = stash.inventory.map((inv) => inv.id);
      const idsRequest = new RestPromise(`${baseUrl}/items?id=${ids.join(',')}`);
      return idsRequest.get();
    });
};

Bank.prototype.getMoneyLog = function getMoneyLog() {
  const request = new RestPromise(`${baseUrl}/guild/${guildId}/log?${this.token}`);
  return request
    .get()
    .then((result) => {
      const withdrawals = result.filter((r) => r.operation === 'withdraw');
      const deposits = result.filter((r) => r.operation === 'deposit');
      return Promise.resolve({deposits, withdrawals});
    });
};

module.exports = Bank;