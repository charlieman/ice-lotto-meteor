Template.entriesTable.helpers({
  hasItems: function() {
    return this.entries.length > 0;
  },
  isAdmin: function() {
    var user = Meteor.user();
    return user !== null && user.profile.admin === true;
  }
});

Template.entryAdd.helpers({
  usernames: function(){
    return Meteor.users.find({}, {fields: {username: 1}});
  }
});