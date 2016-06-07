LocalLog = new Mongo.Collection(null); // Local collection

Template.lottoPage.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    'showLog': false,
  });
});

Template.lottoPage.onRendered(function() {
   $("[data-toggle='tooltip']").tooltip();
});

Template.lottoPage.helpers({
  filterEntries(entries, tier) {
    return _.filter(this.lotto.entries, function (x) {
      return x.amount === tier;
    });
  },
  midTier() {
    return this.tier === 10;
  },
  showTier(type, tier) {
    if (type !== 'double') return true;
    return (tier % 2 === 0);
  },
  isLottoOpen() {
    return !this.lotto.closed;
  },
  showLog() {
    const instance = Template.instance();
    return instance.state.get('showLog');
  },
});

Template.lottoPage.events({
  'click .populateLog'(e) {
    e.preventDefault();
    $('#logModal').modal('show');
    Session.set('loadingLog', true);
    LocalLog = new Mongo.Collection(null); // Reset local collection
    
    Meteor.call('getLogFromAPI', function(error, result) {
      Session.set('loadingLog', false);
      if (error) {
        return throwError(error.reason);
      }
      for(let operation of result) {
        LocalLog.insert(operation);
      }
    });
  },
  'click .populateItems'(e) {
    e.preventDefault();
    Meteor.call('populateItems', this.lotto._id, function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  },
  'click .entry-remove'(e) {
    e.preventDefault();
    Meteor.call('entryRemove', this.entry._id, this.lotto._id, function (error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  },
  'click .toggleLog'(e, instance) {
    e.preventDefault();
    instance.state.set('showLog', !instance.state.get('showLog'));
  },
  'click .togglePublic'(e){
    e.preventDefault();
    Meteor.call('lottoPublicToggle', this.lotto._id, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  },
  'click .closeLotto'(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to close/reopen the lotto?")) {
      Meteor.call('lottoToggleClose', this.lotto._id, function(error, result){
        if(error) {
          return throwError(error.reason);
        }
      });
    }
  },
  'submit .entry-add-direct' (e) {
    e.preventDefault();

    const button = e.target.querySelector('button[type=submit]');
    button.disabled = 'disabled';
    button.innerHTML = 'Adding...';

    const tier = Math.floor(e.target.entryAmount.value);
    const lottoId = this.lotto._id;
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
      return;
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
