Template.accessDenied.helpers({
  isUser: function() {
    return Meteor.userId() !== null;
  },
  isVerified: function() {
  	return isVerified(Meteor.user());
  }
});