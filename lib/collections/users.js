Meteor.methods({
  userVerify: function (userId, verify) {
    check(userId, String);
    check(verify, Boolean);
    if (!isAdmin(Meteor.user())) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }

    var updated = Meteor.users.update(userId, {
      $set: {'profile.verified': verify}
    });
    return {updated: updated};
  },
  addAlt: function (userId, altName) {
    check(userId, String);
    check(altName, String);
    if (!isAdmin(Meteor.user())) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    var updated = Meteor.users.update(userId, {
      $addToSet: {'profile.alts': altName}
    });
    return {updated: updated};
  },
  removeAlt: function (userId, altName) {
    check(userId, String);
    check(altName, String);
    if (!isAdmin(Meteor.user())) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    var updated = Meteor.users.update(userId, {
      $pull: {'profile.alts': altName}
    });
    return {updated: updated};
  }
});