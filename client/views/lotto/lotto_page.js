Template.lottoPage.helpers({
  currentTier: function() {
    var tier = Session.get('SelectedTier');
    return tier === this.tier;
  },
  showEntries: function (entries) {
    var tier = Session.get('SelectedTier');
    return {entries: _.filter(entries, function(x) {return x.amount === tier})};
  },
  midTier: function() {
    return this.tier === 10;
  }
});

Template.tierRow.helpers({
  prizeLoop: function (prizes) {
    var prizeList = [];
    for (var i = 0; i < 10; i++) {
      prizeList.push({prize: prizes[i + 1]});
    }
    return prizeList;
  }
});

Template.tierRow.events({
  'click tr': function (e) {
    e.preventDefault();
    var tier = Session.get('SelectedTier');
    if (tier !== this.tier)
      Session.set('SelectedTier', this.tier);
    else
      Session.set('SelectedTier', null);
  }
});


