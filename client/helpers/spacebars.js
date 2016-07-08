Template.registerHelper('_', function() { return _; });

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

Template.registerHelper('restoreDots', restoreDots);

Template.registerHelper('mainUsername', function(gwuserId) {
  let gwuser = GWUsers.findOne(gwuserId);
  if (gwuser === undefined) {
    gwuser = GWUsers.findOne({account: gwuserId});
  }
  return gwuser === undefined? restoreDots(gwuserId) : gwuser.alts[0];
});

Template.registerHelper('either', (x, y) => {
  if (!!x) return x;
  return y;
});
