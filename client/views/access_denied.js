Template.accessDenied.helpers({
  isUser() {
    return Meteor.userId() !== null;
  },
  isVerified() {
  	return isVerified(Meteor.user());
  }
});
