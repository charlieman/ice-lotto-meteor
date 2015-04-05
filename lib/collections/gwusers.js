GWUsers = new Mongo.Collection('gwusers');

Meteor.methods({
  addGWUser: function(name) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(name, String);
    
    var gwuser = {alts: [name]};
    var gwuserId = GWUsers.insert(gwuser);

    return { _id: gwuserId };
  },
  addGWAlt: function (gwuserId, altName) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(gwuserId, String);
    check(altName, String);

    var updated = GWUsers.update(gwuserId, {
      $addToSet: {'alts': altName}
    });
    return {updated: updated};
  },
  removeGWAlt: function (gwuserId, altName) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(gwuserId, String);
    check(altName, String);

    //Todo: check if it's the only name and either deny deleting it or delete the whole object

    var updated = GWUsers.update(gwuserId, {
      $pull: {'alts': altName}
    });
    return {updated: updated};
  }
});