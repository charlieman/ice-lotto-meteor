Template.gwuserItem.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    'edit': false,
    'changeAccountNameErrors': {},
    'addAltErrors': {},
  });
});

Template.gwuserItem.helpers({
  edit: function() {
    const instance = Template.instance();
    return instance.state.get('edit');
  },
  setAccountName: function(account) {
    if (!!account) return account;
    return "Set Account Name";
  },
});

Template.gwuserItem.events({
  'click .toggle-edit': function(e, instance) {
    e.preventDefault();
    instance.state.set('edit', true);
    Meteor.defer(() => instance.find('input').focus());
  },
  'click .cancel': function(e, instance) {
    e.preventDefault();
    instance.state.set('edit', false);
  },
  'submit .change-accountname': function(e, instance) {
    e.preventDefault();
    const accountName = e.target.accountName.value;

    if (!accountName) {
      var errors = {};
      errors.accountName = "Value can't be empty";
      instance.state.set('changeAccountNameErrors', errors);
      return;
    }

    Meteor.call('setAccountName', this.gwuser._id, accountName, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
      instance.state.set('edit', false);
    });
  },
  'submit .add-alt': function(e) {
    e.preventDefault();
    const altName = e.target.altName.value;

    if (!altName) {
      var errors = {};
      errors.altName = "Value can't be empty";
      instance.state.set('addAltErrors', errors);
      return;
    }

    Meteor.call('addGWAlt', this.gwuser._id, altName, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
      e.target.altName.value = '';
    });
  },
  'click .remove-alt': function(e, instance) {
    e.preventDefault();
    Meteor.call('removeGWAlt', this.gwuser._id, this.alt, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  }
});
