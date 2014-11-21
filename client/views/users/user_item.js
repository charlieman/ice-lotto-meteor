Template.userItem.helpers({
  altLoop: function(){
    var userId = this._id;
    return _.map(this.profile.alts, function(i){ return {alt: i, userId: userId}})
  }
});

Template.userItem.events({
  'submit .verify': function(e){
    e.preventDefault();
    Meteor.call('userVerify', this._id, true, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
      console.log(result);
    });
  },
  'click .unverify': function(e) {
    e.preventDefault();
    Meteor.call('userVerify', this._id, false, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
      console.log(result);
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
      console.log(result);
      e.target.altName.value = '';
    });
  },
  'click .remove-alt': function(e) {
    e.preventDefault();
    var altName = this.alt;
    console.log(this);
    Meteor.call('removeAlt', this.userId, altName, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
      console.log(result);
    });
  }
});