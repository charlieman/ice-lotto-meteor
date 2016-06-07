Template.logModal.onCreated(function() {
  this.lastMonday = moment().startOf('day').day(1);
});

Template.logModal.helpers({
  logs() {
    return LocalLog.find();
  },
  attributes(entry) {
    if (entry.operation === 'withdraw')
      return {class: 'ignore'};
    return {};
  },
  splitCoins(coin) {
    const copper = coin % 100;
    const rest = Math.floor(coin / 100);
    const silver = rest % 100;
    const gold = Math.floor(rest / 100);
    return {
      gold,
      silver,
      copper
    };
  },
  timeAgo(date) {
    return moment(date).fromNow();
  },
  checkboxAttributes(entry, coins) {
    const instance = Template.instance();
    let attribs = {
      'data-id': entry.id,
    };
    if (entry.operation === 'withdraw')
      attribs['disabled'] = 'disabled';
    if (entry.operation === 'deposit' &&
        moment(entry.time).isAfter(instance.lastMonday) &&
        coins.copper === 0 &&
        coins.silver === 0 &&
        coins.gold % 2 === 0 &&
        coins.gold <= 20 &&
        coins.gold > 0)
      attribs['checked'] = 'checked';
    return attribs;
  }
});

Template.logModal.events({
  'change input[type=checkbox]'(e) {
    const tr = e.target.parentElement.parentElement;
    checkRow(tr, e.target.checked);
  },
  'click tr'(e) {
    if (e.target.type === 'checkbox') return;
    e.preventDefault();
    
    const checkbox = e.currentTarget.querySelector('input[type=checkbox]');
    if (checkbox.disabled) return;
    
    checkbox.checked = !checkbox.checked;
    checkRow(e.currentTarget, checkbox.checked);
  },
  'submit .add-entries'(e) {
    e.preventDefault();
    const checkboxes = Array.from(e.target.logEntry);
    const checked = new Set(checkboxes.filter((c) => c.checked).map((c) => parseInt(c.dataset.id)));
    const logs = LocalLog.find().fetch();
    
    const entries = logs.filter((l) => checked.has(l.id))
                        .map((l) => ({ gwuserId: l.user, amount: Math.floor(l.coins/10000) }));

    Meteor.call('entriesAdd', this.lotto._id, entries, function(error, result) {
      if(error) {
        return throwError(error.reason);
      }
      $('#logModal').modal('hide');
    });
  },
});

let checkRow = function(tr, checked) {
  if (checked) {
    tr.classList.add('checked');
  } else {
    tr.classList.remove('checked');
  }
}
