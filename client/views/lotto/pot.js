Template.pot.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    'showEntries': false,
  })
});

Template.pot.helpers({
  potEntries(entries, winner) {
    let rangeStart = 1;
    let rangeEnd = 0;
    return _.map(entries, function (v, k) {
      let _rangeStart = rangeStart;
      rangeEnd = _rangeStart + v - 1;
      rangeStart = rangeEnd + 1;
      return {
        gwuserId: k,
        amount: v,
        rangeStart: _rangeStart,
        rangeEnd: rangeEnd,
        winner: k === winner
      };
    });
  },
  half(total) {
    return total / 2;
  },
  hasWinner() {
    return !!this.winner;
  },
  hasEntries() {
    return !_.isEmpty(this.entries);
  },
  isLottoOpen() {
    return !this.lotto.closed;
  },
  winnerName() {
    return GWUsers.findOne(this.winner).alts[0];
  },
  attributes(entry) {
    if (!!entry.winner) {
      return { class: "winner" };
    }
    return {};
  },
  showEntries() {
    const instance = Template.instance();
    return instance.state.get('showEntries');
  },
});

Template.pot.events({
  'click .roll'(e) {
    e.preventDefault();
    const pot = this.name === 'smallPot'? 'small': 'large';
    Meteor.call('rollForPot', this.lotto._id, pot, function(error, result){
      if (error) {
        return throwError(error.reason);
      }
    });
  },
  'click .unroll'(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to undo the roll?")) {
      const pot = this.name === 'smallPot'? 'small': 'large';
      Meteor.call('unrollForPot', this.lotto._id, pot, function(error, result){
        if (error) {
          return throwError(error.reason);
        }
      });
    }
  },
  'click .togglePot'(e, instance) {
    e.preventDefault();
    instance.state.set('showEntries', !instance.state.get('showEntries'));
  }
});
