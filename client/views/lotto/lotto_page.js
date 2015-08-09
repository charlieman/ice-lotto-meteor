Template.lottoPage.helpers({
  showEntries: function (entries, closed, winners) {
    var tier = Session.get('SelectedTier');
    var lottoId = Session.get('lottoId');
    var winner = _.result(_.find(winners, function(w) {return w.tier === tier}), 'entryId');
    return {
      entries: _.filter(entries, function (x) {
        return x.amount === tier;
      }),
      closed: closed,
      tier: tier,
      winners: winners
    };
  },
  midTier: function () {
    return this.tier === 10;
  },
  makePot: function(toggle, total, entries, label) {
    return {
      toggle: toggle,
      total: total,
      entries: entries,
      label: label
    }
  },
  mainUsername: function (gwuserId) {
    return GWUsers.findOne(gwuserId).alts[0];
  },
  isLottoOpen: function() {
    return !this.lotto.closed;
  }
});

Template.pot.helpers({
  potEntries: function(entries) {
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
        rangeEnd: rangeEnd
      };
    });
  },
  mainUsername: function (gwuserId) {
    return GWUsers.findOne(gwuserId).alts[0];
  },
  half: function(total) {
    return total / 2;
  }
});

Template.lottoPage.events({
  'click .togglePot': function(e) {
    Session.set(this.toggle, !Session.get(this.toggle));
  },
  'click .togglePublic': function(e){
    e.preventDefault();
    Meteor.call('lottoPublicToggle', this.lotto._id, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  },
  'click .closeLotto': function(e) {
    e.preventDefault();
    if (this.lotto.closed || confirm("Are you sure you want to close the lotto?\n(No more entries will be allowed after closing it)")) {
      Meteor.call('lottoToggleClose', this.lotto._id, function(error, result){
        if(error) {
          return throwError(error.reason);
        }
      });
    }
  },
  'submit .entry-add-direct' : function(e) {
    e.preventDefault();
    var button = e.target.querySelector('button[type=submit]');
    window.b = button;
    button.disabled = 'disabled';
    button.innerHTML = 'Adding...';
    var tier = Math.floor(e.target.entryAmount.value);
    var lottoId = Session.get('lottoId');
    var gwuserId = e.target.entryUserId.value;
    var entry = {
      gwuserId: gwuserId,
      amount: tier
    };
    var errors = validateEntry(entry);
    if (errors.gwuserId || errors.amount) {
      button.innerHTML = 'Error';
      Meteor.setTimeout(function(){
        button.innerHTML = 'Add';
        button.disabled = '';
        if (errors.gwuserId) {
          e.target.entryUserId.focus();
        } else {
          e.target.entryAmount.focus();
        }
      }, 500);
      return Session.set('entryAddErrors', errors);
    }

    Meteor.call('entryAdd', entry, lottoId, function (error, result) {
      Meteor.setTimeout(function(){
        button.innerHTML = 'Add';
        button.disabled = '';
        e.target.entryAmount.focus();
        e.target.entryAmount.select();
      }, 500);
      if (error) {
        return throwError(error.reason);
      }
      //e.target.entryUserId.value = '';
    });
  }
});