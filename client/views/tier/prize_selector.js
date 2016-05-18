Template.prizeSelector.helpers({
  hasPrize: function() {
    return !!this.name || !!this.prize;
  }
});

var searchItems = function(e, t) {
  var text = e.target.value;
  if (text.length < 3) {
    return;
  }
  // Ajax search
  var option = document.createElement('option');
  option.value = 'Dawn ' + e.target.value.length;
  var items = t.find("#items");
  items.appendChild(option);
};

var debounceSearch = _.debounce(searchItems, 500);
Template.prizeSelector.events({
  'click .popover-wrapper': function(e) {
    // prevent propagation of click events to the prize cell
    e.stopPropagation();
  },
  'keypress': function(e) {
    if (e.keyCode === 27) {
      Session.set('SelectedPrize', null);
    }
  },
  'input #prizeName': debounceSearch,
  'click .close': function (e) {
    e.preventDefault();
    Session.set('SelectedPrize', null);
  },
  'click .remove': function(e) {
    e.preventDefault();
    var tierId = this.tierId;
    var pos = this.pos;
    Meteor.call('prizeRemove', tierId, pos, function(error, result){
      if (error) {
        return throwError(error);
      }
      Session.set('SelectedPrize', null);
    });
  },
  'submit .prize-change': function (e) {
    e.preventDefault();
    var tierId = this.tierId;
    var lottoId = Session.get('lottoId');
    var prize = e.target.prizeName.value;
    var amount = Math.floor(e.target.prizeAmount.value);
    var pos = this.pos;
    Meteor.call('prizeChange', prize, amount, tierId, pos, function(error, result){
      if (error) {
        return throwError(error);
      }
      e.target.prizeName.value = '';
      e.target.prizeAmount.value = '1';
      Session.set('SelectedPrize', null);
    });
  }
});

Template.prizeSelector.rendered = function(){
  var prize = this.find('#prizeName');
  prize.focus();
  prize.select();
  var prizeAmount = this.find('#prizeAmount');
  if (prizeAmount.value === "") {
    prizeAmount.value = 1;
  }
};