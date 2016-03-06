Template.userItem.helpers({
  isVerified: function() {
    return isVerified(this);
  },
  isAdmin: function() {
    return isAdmin(this);
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
  },
  'change .toggleAdmin': function(e) {
    e.preventDefault();
    Meteor.call('userToggleAdmin', this._id, !isAdmin(this), function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  }
});
