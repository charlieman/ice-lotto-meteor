"use strict";
Template.entriesTable.helpers({
  hasItems: function () {
    return this.entries.length > 0;
  },
  isLottoOpen: function() {
    return !this.closed;
  }
});

Template.entryRow.helpers({
  isLottoOpen: function() {
    return !Template.parentData().closed;
  }
});

Template.entryRow.events({
  'click .remove': function (e) {
    e.preventDefault();
    var lottoId = Session.get('lottoId');
    var entryId = this._id;
    Meteor.call('entryRemove', entryId, lottoId, function (error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  }
});

Template.entryAdd.helpers({
  usernames: function () {
    return Meteor.users.find({}, {fields: {username: 1}});
  }
});

Template.entryAdd.events({
  'submit .entry-add': function (e) {
    e.preventDefault();
    var tier = Session.get('SelectedTier');
    var lottoId = Session.get('lottoId');
    var userId = e.target.userId.value;
    var entry = {
      userId: userId,
      amount: tier
    };
    var errors = validateEntry(entry);
    if (errors.userId || errors.amount) {
      return Session.set('entryAddErrors', errors);
    }

    Meteor.call('entryAdd', entry, lottoId, function (error, result) {
      if (error) {
        return throwError(error.reason);
      }
      e.target.userId.value = '';
    });
  }
});
