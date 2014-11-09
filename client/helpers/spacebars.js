UI.registerHelper('range', function (from, to, step) {
  if (to === undefined) {
    to = from;
    from = 0;
  }
  step = step || 1;
  var range = [];
  while (from < to) {
    range.push({value: from});
    from = from + step;
  }
  return range;
});