Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function () {
    return Meteor.subscribe('lottos');
  }
});

Router.route('/', {name: 'lottoList'});
Router.route('/lotto/:_id', {
  name: 'lottoPage',
  data: function () {
    return Lottos.findOne(this.params._id);
  },
  waitOn: function () {
    return Meteor.subscribe('users');
  }
});

var requireLogin = function () {
  var user = Meteor.user();
  if (!user) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    if(!user.profile.verified) {
      this.render('accessDenied');
    } else {
      this.next();
    }
  }
}

Router.onBeforeAction('dataNotFound', {only: 'lottoPage'});
Router.onBeforeAction(requireLogin);