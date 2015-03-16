Template.userItem.helpers({
  isVerified: function(){
    return isVerified(this);
  },
  altLoop: function(){
    var userId = this._id;
    return _.map(this.profile.alts, function(i){ return {alt: i, userId: userId}})
  }
});

Template.userItem.events({
  'change .toggleVerify': function(e){
    e.preventDefault();
    Meteor.call('userVerify', this._id, !isVerified(this), function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  },
  'submit .add-alt': function(e) {
    e.preventDefault();
    var altName = e.target.altName.value;

    if (!altName) {
      var errors = {};
      errors.altName = "Value can't be empty";
      return Session.set('addAltErrors', errors);
    }

    Meteor.call('addAlt', this._id, altName, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
      e.target.altName.value = '';
    });
  },
  'click .remove-alt': function(e) {
    e.preventDefault();
    var altName = this.alt;
    Meteor.call('removeAlt', this.userId, altName, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  }
});
