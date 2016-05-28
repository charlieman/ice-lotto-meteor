"use strict";
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
    };
  },
  waitOn: function () {
    return Meteor.subscribe('lottos');
  }
});

Router.route('/lotto/:_id', {
  name: 'lottoPage',
  data: function () {
    var lotto = Lottos.findOne(this.params._id);
    if (!lotto) {
      return null;
    }

    return {
      lotto: lotto,
      tiers: Tiers.find({lottoId: this.params._id}),
      gwusers: GWUsers.find({}, {sort: {'alts.0': 1}})
    };
  },
  waitOn: function () {
    return Meteor.subscribe('singleLotto', this.params._id);
  },
  onBeforeAction: function () {
    Session.set('lottoId', this.params._id);
    this.next();
  }
});

Router.route('/users', {
  name: 'userList',
  data: function () {
    return {
      users: Meteor.users.find({}, {sort: {username: 1}})
    };
  },
  waitOn: function () {
    return Meteor.subscribe('userManagement');
  }
});

Router.route('/gwusers', {
  name: 'gwuserList',
  data: function () {
    return {
      gwusers: GWUsers.find({}, {sort: {'alts.0': 1}})
    };
  },
  waitOn: function () {
    return Meteor.subscribe('gwuserManagement');
  }
});

Router.route('/rules');

var checkAccess = function () {
  var user = Meteor.user();
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
  var user = Meteor.user();
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
