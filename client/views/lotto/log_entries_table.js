Template.logEntriesTable.helpers({
  reverse(entries) {
    return Array.prototype.slice.call(entries).reverse();
  },
  hasEntries() {
    return this.entries && this.entries.length > 0;
  },
  isLottoOpen() {
    return !this.lotto.closed;
  },
  attributes(entry) {
    if (this.showWinner === true && !!entry.winner) {
      return { class: "winner" };
    }
    return {};
  },
});

Template.logEntriesTable.events({
  'click .entry-remove'(e) {
    e.preventDefault();
    Meteor.call('entryRemove', this.entry._id, this.lotto._id, function (error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  }
});
