Template.prizeSelector.events({
  'click .close': function (e) {
    e.preventDefault();
    console.log('close');
    Session.set('SelectedPrize', null);
  },
  'submit .prize-change': function (e, template) {
    console.log('submit');
    console.log('template', template);
    console.log('context', this);
    e.preventDefault();
    var tierId = Session.get('SelectedTier');
    var lottoId = Session.get('lottoId');
    var prizeId = this._id;
    var prize = e.target.prizeName.value;
    var pos = this.pos;
    console.log(prize, lottoId, tierId);
    console.log(prize);
    Meteor.call('prizeChange', prize, lottoId, tierId, prizeId, pos, function(error, result){
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