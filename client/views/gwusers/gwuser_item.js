Template.gwuserItem.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    'edit': false,
    'changeAccountNameErrors': {},
    'addAltErrors': {},
  });
});

Template.gwuserItem.helpers({
  edit() {
    const instance = Template.instance();
    return instance.state.get('edit');
  },
  setAccountName(account) {
    if (!!account) return restoreDots(account);
    return "No Account Name";
  },
  restoreDots: restoreDots,
});

Template.gwuserItem.events({
  'click .toggle-edit'(e, instance) {
    e.preventDefault();
    instance.state.set('edit', true);
    Meteor.defer(() => instance.find('input').focus());
  },
  'click .cancel'(e, instance) {
    e.preventDefault();
    instance.state.set('edit', false);
  },
  'submit .change-accountname'(e, instance) {
    e.preventDefault();
    const accountName = e.target.accountName.value;

    if (!accountName) {
      let errors = {
        accountName: "Value can't be empty",
      };
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
  'submit .add-alt'(e, instance) {
    e.preventDefault();
    const altName = e.target.altName.value;

    if (!altName) {
      let errors = {
        altName: "Value can't be empty",
      };
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
  'click .remove-alt'(e, instance) {
    e.preventDefault();
    Meteor.call('removeGWAlt', this.gwuser._id, this.alt, function(error, result){
      if(error) {
        return throwError(error.reason);
      }
    });
  }
});
