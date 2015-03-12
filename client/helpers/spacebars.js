Template.registerHelper('range', function (start, stop, step) {
  return _.map(_.range(start, stop, step), function (x) {
    return {value: x};
  })
});

Template.registerHelper('inSession', function(name, value){
  return Session.equals(name, value);
});

Template.registerHelper('isVerified', isVerified);
Template.registerHelper('isAdmin', isAdmin);