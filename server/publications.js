Meteor.publish('lottos', function () {
  if (!this.userId) {
    this.ready();
    return;
  }
  return Lottos.find({}, {fields: {date: 1}, limit: 10, sort: {date: -1}});
});

Meteor.publish('singleLotto', function (id) {
  check(id, String);
  
  if (!this.userId) {
    var lotto = Lottos.findOne({_id: id, public: true});
    if (!lotto) {
      this.ready();
      return;
    }
  }

  return [
    Lottos.find(id),
    Tiers.find({lottoId: id}, {sort: {tier: 1}}),
    Meteor.users.find({'profile.verified': true}, {fields: {username: 1, 'profile.alts': 1, 'profile.verified': 1}}),
    GWUsers.find({}, {fields: {alts: 1}})
  ];
});

Meteor.publish('userManagement', function() {
  if (!!this.userId && !isAdminById(this.userId)) {
    this.ready();
    return;
  }
  return Meteor.users.find({}, {fields: {username: 1, profile: 1}});
});

Meteor.publish('gwuserManagement', function() {
  if (!!this.userId && !isAdminById(this.userId)) {
    this.ready();
    return;
  }
  return GWUsers.find({}, {fields: {alts: 1}});
});
