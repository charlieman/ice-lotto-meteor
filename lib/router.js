Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function () {
    return Meteor.subscribe('lottos');
  }
});

Router.onBeforeAction('dataNotFound', {only: 'lottoPage'});

Router.route('/', {name: 'lottoList'});
Router.route('/lotto/:_id', {
  name: 'lottoPage',
  data: function () {
    return Lottos.findOne(this.params._id);
  }
});