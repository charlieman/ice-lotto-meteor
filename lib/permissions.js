isAdminById = function (userId) {
  var user = Meteor.users.findOne(userId);
  return isAdmin(user);
};

isAdmin = function (user) {
  user = (typeof user === 'undefined') ? Meteor.user() : user;
  return !!user && !!user.profile && user.profile.admin === true;
};

isVerified = function(user) {
  user = (typeof user === 'undefined') ? Meteor.user() : user;
  return !!user && !!user.profile && user.profile.verified === true;
};
