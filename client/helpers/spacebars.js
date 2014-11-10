UI.registerHelper('range', function (start, stop, step) {
  return _.map(_.range(start, stop, step), function (x) {
    return {value: x};
  })
});