Template.userItem.helpers({
  isVerified: function() {
    return isVerified(this);
  }
});

Template.userItem.events({
  'change .toggleVerify': function(e) {
    e.preventDefault();
    Meteor.call('userVerify', this._id, !isVerified(this), function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  }
});
