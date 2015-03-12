Template.lottoPage.helpers({
  showEntries: function (entries) {
    var tier = Session.get('SelectedTier');
    return {
      entries: _.filter(entries, function (x) {
        return x.amount === tier
      })
    };
  },
  midTier: function () {
    return this.tier === 10;
  }
});

Template.lottoPage.events({
  'change .togglePublic': function(e){
    e.preventDefault();
    Meteor.call('lottoPublicToggle', this.lotto._id, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  },
});