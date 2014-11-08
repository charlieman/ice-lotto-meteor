Meteor.publish('lottos', function() {
    return Lottos.find();
});

Meteor.publish('users', function(){
   return Meteor.users.find({}, {fields: {username: 1}});
});