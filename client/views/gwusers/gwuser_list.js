Template.gwuserList.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    'addUserErrors': {},
  });
});


Template.gwuserList.events({
  'submit .add-gwuser'(e, instance) {
  	e.preventDefault();
    const accountName = e.target.accountName.value;
    const altName = e.target.altName.value;

    let errors = {};
    if (!accountName) {
      errors.accountName = "Value can't be empty";
    }

    if (!altName) {
      errors.altName = "Value can't be empty";
    }

    if (_.any(errors)) {
      instance.state.set('addUserErrors', errors);
      return;
    }
    
    Meteor.call('addGWUser', accountName, altName, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
      e.target.reset();
    });
  }
});
