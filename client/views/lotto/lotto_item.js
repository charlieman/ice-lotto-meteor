Template.lottoItem.helpers({
  prettyDate: function(){
    return moment(this.date).format('MMM Do, YYYY');
  }
});

Template.lottoItem.events({
  'click .delete': function(e) {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this lotto?")) return;

    Meteor.call('deleteLotto', this._id, function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });

  }
});
