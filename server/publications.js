Meteor.publish('lottos', function () {
  if (!this.userId)
    return this.ready();
  return Lottos.find({}, {fields: {date: 1}, limit: 10, sort: {date: -1}});
});

Meteor.publish('singleLotto', function (id) {
  check(id, String);
  if (!this.userId)
    return this.ready();
  return [
    Lottos.find(id),
    Tiers.find({lottoId: id}, {sort: {tier: 1}})
  ];
});

Meteor.publish('usernames', function () {
  //check(this.userId, String);
  if (!this.userId)
    return this.ready();
  return Meteor.users.find({}, {fields: {username: 1}});
});
