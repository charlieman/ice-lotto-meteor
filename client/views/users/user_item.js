Template.userItem.helpers({
  isVerified() {
    return isVerified(this);
  },
  isAdmin() {
    return isAdmin(this);
  }
});

Template.userItem.events({
  'change .toggleVerify'(e) {
    e.preventDefault();
    Meteor.call('userVerify', this._id, !isVerified(this), function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });

  },
  'change .toggleAdmin'(e) {
    e.preventDefault();
    Meteor.call('userToggleAdmin', this._id, !isAdmin(this), function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  },
  'click .deleteUser'(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this user?")) {
      Meteor.call('userDelete', this._id, function(error, result){
        if(error) {
          return throwError(error.reason);
        }
      });
    }
  },
});
