Template.lottoAdd.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    lottoAddErrors: {},
  });
});
Template.lottoAdd.onRendered(function() {
  const nextSaturday = moment().startOf('day').day(6).utcOffset(0);
  this.find('#date').value = nextSaturday.format('YYYY-MM-DD');
  this.find('#date').valueAsDate = nextSaturday.toDate();
});

Template.lottoAdd.helpers({
  errorMessage(field) {
    const instance = Template.instance();
    return instance.state.get('lottoAddErrors')[field];
  },
  errorClass(field) {
    const instance = Template.instance();
    return !!instance.state.get('lottoAddErrors')[field] ? 'has-error' : '';
  }
});

Template.lottoAdd.events({
  'submit form'(e, instance) {
    e.preventDefault();

    let lotto = {
      date: moment(e.target.date.value).toDate()
    };

    if (!lotto.date) {
      let errors = {};
      errors.date = "Please select a date";
      return instance.state.set('lottoAddErrors', errors);
    }

    //const autofill = e.target.autofill.checked;

    Meteor.call('lottoInsert', lotto, false, function(error, result) {
      if(error) {
        return throwError(error.reason);
      }
      if(result.lottoExists) {
        return throwError('Lotto for this date already exists');
      }
      Router.go('lottoPage', {_id: result._id});
    });
  }
});
