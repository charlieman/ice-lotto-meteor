Template.logEntriesTable.helpers({
  reverse: function(entries) {
    return Array.prototype.slice.call(entries).reverse();
  },
  hasEntries: function () {
    return this.entries && this.entries.length > 0;
  },
  isLottoOpen: function() {
    return !this.lotto.closed;
  },
  attributes: function(entry) {
    if (this.showWinner === true && !!entry.winner) {
      return { class: "winner" };
    }
    return {};
  },
});

Template.logEntriesTable.events({
  'click .entry-remove': function(e) {
    e.preventDefault();
    Meteor.call('entryRemove', this.entry._id, this.lotto._id, function (error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  }
});
