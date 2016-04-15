Template.registerHelper('_', function() { return lodash; });

Template.registerHelper('range', function (start, stop, step) {
  return _.map(_.range(start, stop, step), function (x) {
    return {value: x};
  });
});

Template.registerHelper('inSession', function(name, value) {
  return Session.equals(name, value);
});

Template.registerHelper('isVerified', function() {
	return isVerified(Meteor.user());
});
Template.registerHelper('isAdmin', isAdmin);

Template.registerHelper('isSuperAdmin', isSuperAdmin);

Template.registerHelper('showSAPowers', showSAPowers);
