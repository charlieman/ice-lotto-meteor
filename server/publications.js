Meteor.publish('lottos', function() {
  if(!this.userId)
    return this.ready();
  return Lottos.find({}, {fields: {date: 1}, limit: 10});
});

Meteor.publish('singleLotto', function (id) {
  check(id, String);
  if(!this.userId)
    return this.ready();
  return [
    Lottos.find(id),
    Tiers.find({lottoId: id})
  ];
});

Meteor.publish('usernames', function(){
  //check(this.userId, String);
  if(!this.userId)
    return this.ready();
  return Meteor.users.find({}, {fields: {username: 1}});
});
