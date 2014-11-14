Tiers = new Mongo.Collection('tiers');

Meteor.methods({
  prizeChange: function (prize, tierId, pos) {
    check(Meteor.userId(), String);
    check(prize, String);
    check(tierId, String);
    check(pos, Number);
    var newPrize = {_id: Random.id(), pos: pos, prize: prize};

    //TODO: make this atomic
    var tier = Tiers.findOne({ _id: tierId, 'prizes.pos': pos });
    if (!!tier) {
      Tiers.update(
        { _id: tierId, 'prizes.pos': pos },
        { $set: {'prizes.$': newPrize } }
      );
    } else {
      Tiers.update(
        { _id: tierId },
        { $addToSet: {prizes: newPrize } }
      );
    }
    return {
      _id: newPrize._id
    };
  }
});