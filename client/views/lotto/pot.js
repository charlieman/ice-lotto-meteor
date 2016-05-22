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
  mainUsername: function (gwuserId) {
    return GWUsers.findOne(gwuserId).alts[0];
  },
  half: function(total) {
    return total / 2;
  },
  hasWinner: function() {
    return !!this.winner;
  },
  hasEntries: function() {
    return this.entries && this.entries.length > 0;
  },
  isLottoOpen: function() {
    return !Template.parentData().lotto.closed;
  },
  winnerName: function() {
    return "WinnerNameHere";
  },
  attributes: function() {
    if (!!this.winner) {
      return { class: "winner" };
    }
    return {};
  }
});

Template.pot.events({
  'click .roll': function(e) {
    e.preventDefault();
    var lottoId = Session.get('lottoId');
    var pot = this.toggle;
    Meteor.call('rollForPot', lottoId, pot, function(error, result){
      if (error) {
        return throwError(error.reason);
      }
      //console.log('result', result);
    });
  },
  'click .unroll': function(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to undo the roll?")) {
      var lottoId = Session.get('lottoId');
      var pot = this.toggle;
      Meteor.call('unrollForPot', lottoId, pot, function(error, result){
        if (error) {
          return throwError(error.reason);
        }
      });
    }
  },
  'click .togglePot': function(e) {
    Session.set(this.toggle, !Session.get(this.toggle));
  }
});
