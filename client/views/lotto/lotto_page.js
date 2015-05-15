Template.lottoPage.helpers({
  showEntries: function (entries, closed) {
    var tier = Session.get('SelectedTier');
    return {
      entries: _.filter(entries, function (x) {
        return x.amount === tier;
      }),
      closed: closed
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
  }
});

Template.lottoPage.events({
  'click .toggleSmall': function(e) {
    Session.set('showSmall', !Session.get('showSmall'));
  },
  'click .toggleBig': function(e) {
    Session.set('showBig', !Session.get('showBig'));
  },
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
    if (confirm("Are you sure you want to close the lotto?\n(No more entries will be allowed after closing it)")) {
      Meteor.call('lottoClose', this.lotto._id, function(error, result){
        if(error) {
          return throwError(error.reason);
        }
      });
    }
  }
});