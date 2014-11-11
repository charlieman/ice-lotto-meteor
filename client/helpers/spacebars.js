Template.registerHelper('range', function (start, stop, step) {
  return _.map(_.range(start, stop, step), function (x) {
    return {value: x};
  })
});

Template.registerHelper('inSession', function(name, value){
  var sessionValue = Session.get(name);
  return sessionValue === value;
});