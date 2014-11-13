Tiers = new Mongo.Collection('tiers');

Meteor.methods({
  prizeChange: function (prize, tierId, pos) {
    check(Meteor.userId(), String);
    check(prize, String);
    check(tierId, String);
    check(pos, Number);
    var newPrize = {_id: Random.id(), pos: pos, prize: prize};
    //console.log(newPrize);
    //var lotto = Tiers.findOne(tierId);
    //var p = _.find(lotto.prizes, function (x) { return x.pos === pos; });
    //console.log(p);

    // TODO: still doesn't work
    Tiers.update({_id: tierId}, {
      $pull: {prizes: {pos: pos}},
      $push: {prizes: newPrize}
    });

    return {
      _id: newPrize._id
    };
  }
});