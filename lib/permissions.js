isAdmin = function (user) {
  user = (typeof user === 'undefined') ? Meteor.user() : user;
  return !!user && !!user.profile && user.profile.admin === true;
};

isAdminById = function (userId) {
  const user = Meteor.users.findOne(userId);
  return isAdmin(user);
};

isVerified = function(user) {
  return !!user && !!user.profile && user.profile.verified === true;
};

isSuperAdmin = function(user) {
  user = (typeof user === 'undefined') ? Meteor.user() : user;
  return !!user && !!user.profile && user.profile.superadmin === true;
};

showSAPowers = function() {
  const user = Meteor.user();
  return !!user && !!user.profile && user.profile.superadmin === true &&
         user.profile.sapowers === true;
};
