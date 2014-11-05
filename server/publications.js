Meteor.publish('lottos', function() {
    return Lottos.find();
});