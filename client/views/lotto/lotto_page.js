Template.lottoPage.helpers({
  showEntries: function (entries) {
    var tier = Session.get('SelectedTier');
    return {
      entries: _.filter(entries, function (x) {
        return x.amount === tier
      })
    };
  },
  midTier: function () {
    return this.tier === 10;
  }
});
