GWUsers = new Mongo.Collection('gwusers');

Meteor.methods({
  addGWUser(accountName, altName) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(accountName, String);
    check(altName, String);
    
    const gwuser = {account: replaceDots(accountName), alts: [altName]};
    const gwuserId = GWUsers.insert(gwuser);

    return { _id: gwuserId };
  },
  setAccountName(gwuserId, accountName) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(gwuserId, String);
    check(accountName, String);

    const updated = GWUsers.update(gwuserId, {
      $set: {'account': replaceDots(accountName)}
    });
    return {updated: updated};
  },
  addGWAlt(gwuserId, altName) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(gwuserId, String);
    check(altName, String);

    const updated = GWUsers.update(gwuserId, {
      $addToSet: {'alts': altName}
    });
    return {updated: updated};
  },
  removeGWAlt(gwuserId, altName) {
    if (!isAdmin()) {
      throw new Meteor.Error("unauthorized", "You don't have permissions to do this");
    }
    check(gwuserId, String);
    check(altName, String);

    //Todo: check if it's the only name and either deny deleting it or delete the whole object

    const updated = GWUsers.update(gwuserId, {
      $pull: {'alts': altName}
    });
    return {updated: updated};
  }
});
