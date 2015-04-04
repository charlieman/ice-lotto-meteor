Template.lottoPage.helpers({
  showEntries: function (entries, closed) {
    var tier = Session.get('SelectedTier');
    return {
      entries: _.filter(entries, function (x) {
        return x.amount === tier;
      }),
      closed: closed
    };
  },
  midTier: function () {
    return this.tier === 10;
  }
});

Template.lottoPage.events({
  'click .togglePublic': function(e){
    e.preventDefault();
    Meteor.call('lottoPublicToggle', this.lotto._id, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  },
  'click .closeLotto': function(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to close the lotto?\n(No more entries will be allowed after closing it)")) {
      Meteor.call('lottoClose', this.lotto._id, function(error, result){
        if(error) {
          return throwError(error.reason);
        }
      });
    }
  }
});