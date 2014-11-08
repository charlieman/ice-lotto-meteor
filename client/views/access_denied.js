Template.accessDenied.helpers({
  isUser: function() {
    return Meteor.userId() !== null;
  }
});