Template.lottoPage.rendered = function() {
   $("[data-toggle='tooltip']").tooltip();
};

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
  showTier: function(type) {
    if (type !== 'double') return true;
    return (this.tier % 2 === 0);
  },
  makePot: function(toggle, total, entries, label, winner) {
    return {
      toggle: toggle,
      total: total,
      entries: entries,
      label: label,
      winner: winner
    }
  },
  mainUsername: function (gwuserId) {
    return GWUsers.findOne(gwuserId).alts[0];
  },
  isLottoOpen: function() {
    return !this.lotto.closed;
  },
  reversedEntries: function() {
    return _.chain(this.lotto.entries).reverse().value();
  }
});

Template.lottoPage.events({
  'click .populateLog': function(e) {
    e.preventDefault();
    $('#logModal').modal('show');
  },
  'click .populateItems': function(e) {
    e.preventDefault();
    var lottoId = Session.get('lottoId');
    Meteor.call('populateItems', lottoId, function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  },
  'click .entry-remove': function(e) {
    e.preventDefault();
    Meteor.call('entryRemove', this.entryId, this.lottoId, function (error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  },
  'click .toggleLog': function(e) {
    e.preventDefault();
    Session.set(this.toggleLog, !Session.get(this.toggleLog));
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
    if (confirm("Are you sure you want to close/reopen the lotto?")) {
      Meteor.call('lottoToggleClose', this.lotto._id, function(error, result){
        if(error) {
          return throwError(error.reason);
        }
      });
    }
  },
  'submit .entry-add-direct' : function(e) {
    e.preventDefault();

    const button = e.target.querySelector('button[type=submit]');
    button.disabled = 'disabled';
    button.innerHTML = 'Adding...';

    const tier = Math.floor(e.target.entryAmount.value);
    const lottoId = Session.get('lottoId');
    const gwuserId = e.target.entryUserId.value;

    const entry = {
      gwuserId: gwuserId,
      amount: tier
    };

    const errors = validateEntry(entry);
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
      button.innerHTML = 'Add';
      button.disabled = '';
      e.target.entryAmount.focus();
      e.target.entryAmount.select();
      if (error) {
        return throwError(error.reason);
      }
    });
  }
});
