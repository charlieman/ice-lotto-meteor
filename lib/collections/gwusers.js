GWUsers = new Mongo.Collection('gwusers');

Meteor.methods({
  addGWUser: function(name) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(name, String);
    
    var gwuser = {name: name, active: true, alts: []};
    var gwuserId = GWUsers.insert(gwuser);

    return { _id: gwuserId };
  },
  addGWAlt: function (userId, altName) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(userId, String);
    check(altName, String);

    var updated = GWUsers.update(userId, {
      $addToSet: {'alts': altName}
    });
    return {updated: updated};
  },
  removeGWAlt: function (userId, altName) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(userId, String);
    check(altName, String);

    var updated = GWUsers.update(userId, {
      $pull: {'alts': altName}
    });
    return {updated: updated};
  },
  toggleActive: function(userId) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(userId, String);
    
    //ToDo: do this in one action
    var gwuser = GWUsers.findOne(userId, {fields: {active: 1}});
    var updated = GWUsers.update(userId, {
      $set: {active: !gwuser.active}
    });
    return {updated: updated};
  }
});