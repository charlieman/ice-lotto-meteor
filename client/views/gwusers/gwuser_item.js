Template.gwuserItem.helpers({
  altLoop: function() {
    var userId = this._id;
    return _.map(this.profile.alts, function(i) { return {alt: i, userId: userId};});
  }
});

Template.gwuserItem.events({
  'submit .add-alt': function(e) {
    e.preventDefault();
    var altName = e.target.altName.value;

    if (!altName) {
      var errors = {};
      errors.altName = "Value can't be empty";
      return Session.set('addAltErrors', errors);
    }

    Meteor.call('addGWAlt', this._id, altName, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
      e.target.altName.value = '';
    });
  },
  'click .remove-alt': function(e, t) {
    e.preventDefault();
    var altName = '' + this;
    Meteor.call('removeGWAlt', t.data._id, altName, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  }
});
