Template.layout.events({
  'click .showSAPowers': function(e) {
    e.preventDefault();
    Meteor.call('userToggleSuperAdminPowers', !showSAPowers(), function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  }
});
