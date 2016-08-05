Template.tierRow.onRendered(function() {
   $("[data-toggle='tooltip']").tooltip();
});

Template.tierRow.helpers({
  prizeLoop(prizes) {
    let prizeList = [];
    let i = 1;
    const sortedPrizes = _.sortBy(prizes, (p) => p.pos);

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
  isLottoOpen() {
    return !this.lotto.closed;
  },
  attributes(prize) {
    if (!!prize && !!prize.winner) {
      return { class: "winner" };
    }
    return {};
  },
  hasNoWinner() {
    return !_.any(this.tier.prizes, (p) => !!p.winner);
  },
  entriesLength() {
    return this.entries.length;
  },
  hasEntries() {
    return _.any(this.entries);
  },
  hasOne() {
    return this.entries.length === 1;
  },
  winnerData() {
    let winnerEntry;
    const winnerPrize = this.tier.prizes.find((p) => !!p.winner);
    if (winnerPrize) {
      winnerEntry = this.entries.find((e) => e.amount === this.tier.tier && !!e.winner);
    }
    return Object.assign({}, winnerPrize, winnerEntry);
  },
});

Template.tierRow.events({
  'click .tier-number'(e) {
    e.preventDefault();
    if (Session.equals('SelectedTier', this.tier.tier)) {
      Session.set('SelectedTier', null);
    }
    else {
      Session.set('SelectedTier', this.tier.tier);
    }
  },
  'click .roll'(e) {
    e.preventDefault();
    Meteor.call('rollForTier', this.lotto._id, this.tier.tier, function(error, result){
      if (error) {
        return throwError(error.reason);
      }
    });
  },
  'click .unroll'(e) {
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
