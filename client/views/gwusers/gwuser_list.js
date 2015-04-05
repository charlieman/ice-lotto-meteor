Template.gwuserList.events({
  'submit .add-gwuser': function(e, t) {
  	e.preventDefault();
    var altName = e.target.altName.value;

    if (!altName) {
      var errors = {};
      errors.altName = "Value can't be empty";
      return Session.set('addAltErrors', errors);
    }
    
    Meteor.call('addGWUser', altName, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
      e.target.altName.value = '';
    });
  }
});