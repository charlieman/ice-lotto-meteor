// Prevents users from modifying their profile
Meteor.users.deny({
  update: function() {
    return true;
  }
});

Meteor.methods({
  userVerify: function (userId, verify) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(userId, String);
    check(verify, Boolean);

    var updated = Meteor.users.update(userId, {
      $set: {'profile.verified': verify}
    });
    return {updated: updated};
  }
});
