Template.lottoAdd.created = function() {
  Session.set('lottoAddErrors', {});
};
Template.lottoAdd.rendered = function() {
  this.find('input[name=date]').valueAsDate = new Date();
};

Template.lottoAdd.helpers({
  errorMessage: function(field) {
    return Session.get('lottoAddErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('lottoAddErrors')[field] ? 'has-error' : '';
  }
});

Template.lottoAdd.events({
  'submit form': function(e) {
    e.preventDefault();

    var lotto = {
      date: e.target.date.valueAsDate
    };

    if (!lotto.date) {
      var errors = {};
      errors.date = "Please select a date";
      return Session.set('lottoAddErrors', errors);
    }

    Meteor.call('lottoInsert', lotto, function(error, result) {
      if(error) {
        return throwError(error.reason);
      }
      if(result.lottoExists) {
        throwError('Lotto for this date already exists');
      }
      Router.go('lottoPage', {_id: result._id});
    });
  }
});