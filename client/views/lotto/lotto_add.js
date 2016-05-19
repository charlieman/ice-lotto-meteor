Template.lottoAdd.created = function() {
  Session.set('lottoAddErrors', {});
};
Template.lottoAdd.rendered = function() {
  var nextSaturday = moment().startOf('day').day(6).utcOffset(0);
  this.find('#date').value = nextSaturday.format('YYYY-MM-DD');
  this.find('#date').valueAsDate = nextSaturday.toDate();
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
      date: moment(e.target.date.value).toDate()
    };

    if (!lotto.date) {
      var errors = {};
      errors.date = "Please select a date";
      return Session.set('lottoAddErrors', errors);
    }

    //var autofill = e.target.autofill.checked;

    Meteor.call('lottoInsert', lotto, false, function(error, result) {
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
