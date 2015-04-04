Template.tierRow.helpers({
  prizeLoop: function (prizes) {
    var tierId = this._id;
    var prizeList = [];
    var i = 1;
    var sortedPrizes = _.sortBy(prizes, function(p) {return p.pos;});

    // fill unused spaces with empty prizes
    // TODO make better
    _.each(sortedPrizes, function (p) {
      while (p.pos > i) {
        prizeList.push({_id: Random.id(), pos: i, prize: null, tierId: tierId});
        i++;
      }
      prizeList.push(_.extend({}, p, {tierId: tierId}));
      i++;
    });
    while (i < 11) {
      prizeList.push({_id: Random.id(), pos: i, prize: null, tierId: tierId});
      i++;
    }
    return prizeList;
  }
});

Template.tierRow.events({
  'click .tier-number': function (e) {
    e.preventDefault();
    if (Session.equals('SelectedTier', this.tier)) {
      Session.set('SelectedTier', null);
    }
    else {
      Session.set('SelectedTier', this.tier);
    }
  },
  'click .prize-cell': function (e) {
    e.preventDefault();
    if (Session.equals('SelectedPrize', this._id)) {
      Session.set('SelectedPrize', null);
    }
    else {
      Session.set('SelectedPrize', this._id);
    }
  }
});
