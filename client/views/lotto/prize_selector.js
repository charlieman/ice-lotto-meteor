Template.prizeSelector.events({
  'click .close': function (e) {
    e.preventDefault();
    console.log('close');
    Session.set('SelectedPrize', null);
  },
  'submit .prize-change': function (e) {
    e.preventDefault();
    var tierId = this.tierId;
    var lottoId = Session.get('lottoId');
    var prize = e.target.prizeName.value;
    var pos = this.pos;
    Meteor.call('prizeChange', prize, tierId, pos, function(error, result){
      if (error) {
        console.log(error);
        return;
      }
      console.log(result);
      e.target.prizeName.value = '';
      Session.set('SelectedPrize', null);
    });
  }
});

Template.prizeSelector.rendered = function(){
  this.find('#prizeName').focus();
};