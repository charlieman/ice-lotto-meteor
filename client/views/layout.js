Template.layout.events({
  'click .showSAPowers'(e) {
    e.preventDefault();
    Meteor.call('userToggleSuperAdminPowers', !showSAPowers(), function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  }
});
