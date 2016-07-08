Template.tierRow.rendered = function() {
   $("[data-toggle='tooltip']").tooltip();
};

Template.tierRow.helpers({
  prizeLoop: function (prizes) {
    var prizeList = [];
    var i = 1;
    var sortedPrizes = _.sortBy(prizes, function(p) {return p.pos;});

    _.each(sortedPrizes, function (p) {
      while (p.pos > i) {
        prizeList.push(null);
        i++;
      }
      prizeList.push(p);
      i++;
    });
    while (i < 11) {
      prizeList.push(null);
      i++;
    }
    return prizeList;
  },
  isLottoOpen: function() {
    return !this.lotto.closed;
  },
  attributes: function(prize) {
    if (!!prize && !!prize.winner) {
      return { class: "winner" };
    }
    return {};
  },
  hasNoWinner: function() {
    return !_.any(this.tier.prizes, function(p) { return !!p.winner; });
  },
  entriesLength: function() {
    return this.entries.length;
  },
  hasEntries: function() {
    return _.any(this.entries);
  },
  hasOne: function() {
    return this.entries.length === 1;
  },
  winnerData: function() {
    let winnerEntry;
    const winnerPrize = this.tier.prizes.find((p) => !!p.winner);
    if (winnerPrize) {
      winnerEntry = this.entries.find((e) => e.amount === this.tier.tier && !!e.winner);
    }
    return Object.assign({}, winnerPrize, winnerEntry);
  },
});

Template.tierRow.events({
  'click .tier-number': function (e) {
    e.preventDefault();
    if (Session.equals('SelectedTier', this.tier.tier)) {
      Session.set('SelectedTier', null);
    }
    else {
      Session.set('SelectedTier', this.tier.tier);
    }
  },
  'click .roll': function(e) {
    e.preventDefault();
    Meteor.call('rollForTier', this.lotto._id, this.tier.tier, function(error, result){
      if (error) {
        return throwError(error.reason);
      }
    });
  },
  'click .unroll': function(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to undo the roll?")) {
      Meteor.call('unrollForTier', this.lotto._id, this.tier.tier, function(error, result) {
        if (error) {
          return throwError(error.reason);
        }
      });
    }
  }
});
