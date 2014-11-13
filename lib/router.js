Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});

Router.route('/', {
  name: 'lottoList',
  data: function () {
    return {
        lottos: Lottos.find({}, {sort: {date: -1}, limit: 10})
    }
  },
  waitOn: function () {
    return Meteor.subscribe('lottos');
  }
});

Router.route('/lotto/:_id', {
  name: 'lottoPage',
  data: function () {
    return {
      lotto: Lottos.findOne(this.params._id),
      tiers: Tiers.find({lottoId: this.params._id})
    };
  },
  waitOn: function () {
    return [
      Meteor.subscribe('singleLotto', this.params._id),
      Meteor.subscribe('usernames')
    ];
  },
  onBeforeAction: function(){
    Session.set('lottoId', this.params._id);
    this.next();
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
    if (!user.profile.verified) {
      this.render('accessDenied');
    } else {
      this.next();
    }
  }
};

Router.onBeforeAction('dataNotFound', {only: 'lottoPage'});
Router.onBeforeAction(requireLogin);