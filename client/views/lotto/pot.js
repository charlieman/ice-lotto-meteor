Template.pot.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    'showEntries': false,
  })
});

Template.pot.helpers({
  potEntries: function(entries, winner) {
    var rangeStart = 1;
    var rangeEnd = 0;
    return _.map(entries, function (v, k) {
      var _rangeStart = rangeStart;
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
  half: function(total) {
    return total / 2;
  },
  hasWinner: function() {
    return !!this.winner;
  },
  hasEntries: function() {
    return !_.isEmpty(this.entries);
  },
  isLottoOpen: function() {
    return !this.lotto.closed;
  },
  winnerName: function() {
    return GWUsers.findOne(this.winner).alts[0];
  },
  attributes: function(entry) {
    if (!!entry.winner) {
      return { class: "winner" };
    }
    return {};
  },
  showEntries: function() {
    const instance = Template.instance();
    return instance.state.get('showEntries');
  },
});

Template.pot.events({
  'click .roll': function(e) {
    e.preventDefault();
    var pot = this.name === 'smallPot'? 'small': 'large';
    Meteor.call('rollForPot', this.lotto._id, pot, function(error, result){
      if (error) {
        return throwError(error.reason);
      }
    });
  },
  'click .unroll': function(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to undo the roll?")) {
      var pot = this.name === 'smallPot'? 'small': 'large';
      Meteor.call('unrollForPot', this.lotto._id, pot, function(error, result){
        if (error) {
          return throwError(error.reason);
        }
      });
    }
  },
  'click .togglePot': function(e, instance) {
    e.preventDefault();
    instance.state.set('showEntries', !instance.state.get('showEntries'));
  }
});
