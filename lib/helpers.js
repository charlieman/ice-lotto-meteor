replaceDots = function(s) {
  return s && s.replace('.', '@');
}

restoreDots = function(s) {
  return s && s.replace('@', '.');
}
