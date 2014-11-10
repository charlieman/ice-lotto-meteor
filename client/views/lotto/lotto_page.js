var currentTier = function () {
  var tier = Session.get('SelectedTier');
  return tier === this.tier;
};

Template.lottoPage.helpers({
  currentTier: currentTier,
  showEntries: function (entries) {
    var tier = Session.get('SelectedTier');
    return {entries: _.filter(entries, function(x) {return x.amount === tier})};
  },
  midTier: function () {
    return this.tier === 10;
  }
});

Template.tierRow.helpers({
  currentTier: currentTier,
  prizeLoop: function (prizes) {
    var prizeList = [];
    for (var i = 0; i < 10; i++) {
      prizeList.push({prize: prizes[i + 1]});
    }
    return prizeList;
  }
});

Template.tierRow.events({
  'click .tier-number': function (e) {
    e.preventDefault();
    var tier = Session.get('SelectedTier');
    if (tier !== this.tier)
      Session.set('SelectedTier', this.tier);
    else
      Session.set('SelectedTier', null);
  },
  'click .prize': function (e) {
    e.preventDefault();
    Session.set('PrizeSelector', this.prize);
  }
});
