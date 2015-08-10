Tiers = new Mongo.Collection('tiers');

Meteor.methods({
  prizeChange: function (prize, amount, tierId, pos) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(prize, String);
    check(amount, Number);
    check(tierId, String);
    check(pos, Number);
    var newPrize = {_id: Random.id(), pos: pos, prize: prize, amount: amount};

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
  },
  prizeRemove: function(tierId, pos) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(tierId, String);
    check(pos, Number);

    Tiers.update(tierId, {
      $pull: {prizes: {pos: pos}}
    });
    return {};
  }
});