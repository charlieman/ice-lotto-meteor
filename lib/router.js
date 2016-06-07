"use strict";
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});

Router.route('/', {
  name: 'lottoList',
  data() {
    return {
      lottos: Lottos.find({}, {sort: {date: -1}, limit: 10})
    };
  },
  waitOn() {
    return Meteor.subscribe('lottos');
  }
});

Router.route('/lotto/:_id', {
  name: 'lottoPage',
  data() {
    const lotto = Lottos.findOne(this.params._id);
    if (!lotto) {
      return null;
    }

    return {
      lotto: lotto,
      tiers: Tiers.find({lottoId: this.params._id}),
      gwusers: GWUsers.find({}, {sort: {'alts.0': 1}})
    };
  },
  waitOn() {
    return Meteor.subscribe('singleLotto', this.params._id);
  },
  onBeforeAction() {
    Session.set('lottoId', this.params._id);
    this.next();
  }
});

Router.route('/users', {
  name: 'userList',
  data() {
    return {
      users: Meteor.users.find({}, {sort: {username: 1}})
    };
  },
  waitOn() {
    return Meteor.subscribe('userManagement');
  }
});

Router.route('/gwusers', {
  name: 'gwuserList',
  data() {
    return {
      gwusers: GWUsers.find({}, {sort: {'account': 1, 'alts.0': 1}})
    };
  },
  waitOn() {
    return Meteor.subscribe('gwuserManagement');
  }
});

Router.route('/rules');

var checkAccess = function () {
  const user = Meteor.user();
  if (!user) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
      return;
    }
  } else {
    if (isVerified(user)) {
      this.next();
      return;
    }
  }
  this.render('accessDenied');
};

var checkVerified = function() {
  const user = Meteor.user();
  if (!!user && !isVerified(user)) {
    this.render('accessDenied');
    return;
  }
  this.next();
}

var requireAdmin = function () {
  if (!isAdmin(Meteor.user())) {
    this.render('accessDenied');
  } else {
    this.next();
  }
};

Router.plugin('dataNotFound', {only: 'lottoPage'});
Router.onBeforeAction(checkAccess, {except: ['lottoPage', 'rules']});
Router.onBeforeAction(checkVerified, {only: 'lottoPage'});
Router.onBeforeAction(requireAdmin, {only: ['userList', 'gwuserList']});
