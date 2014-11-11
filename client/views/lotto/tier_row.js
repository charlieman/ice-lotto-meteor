Template.tierRow.helpers({
  prizeLoop: function (prizes) {
    var prizeList = [];
    var i = 1;
    var sortedPrizes = _.sortBy(prizes, function(p) {return p.pos});
    _.each(sortedPrizes, function (p) {
      while (p.pos > i) {
        prizeList.push({_id: Random.id(), pos: i, prize: null});
        i++;
      }
      prizeList.push(p);
      i++;
    });
    while (i < 11) {
      prizeList.push({_id: Random.id(), pos: i, prize: null});
      i++;
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
  'click .prize-cell': function (e) {
    if (e.target.tagName !== 'TD') return;
    console.log(e.target);
    e.preventDefault();
    var prize = Session.get('SelectedPrize');
    if (prize !== this._id)
      Session.set('SelectedPrize', this._id);
    else
      Session.set('SelectedPrize', null);
  }
});
