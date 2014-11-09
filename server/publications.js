Meteor.publish('lottos', function() {
    return Lottos.find();
});

Meteor.publish('usernames', function(){
   return Meteor.users.find({}, {fields: {username: 1}});
});