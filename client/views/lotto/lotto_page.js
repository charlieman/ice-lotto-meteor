Template.lottoPage.helpers({
  range: function (to) {
    var range = [];
    for (var i = 0; i < to; i++) {
      range.push({value: i + 1});
    }
    return range;
  },
  currentTier: function() {
    var tier = Session.get('SelectedTier');
    return tier === this.tier;
  },
  showEntries: function (entries) {
    var tier = Session.get('SelectedTier');
    return {entries: _.filter(entries, function(x) {return x.amount === tier})};
  }
});

Template.tier.helpers({
  prizeLoop: function (prizes) {
    var prizeList = [];
    for (var i = 0; i < 10; i++) {
      prizeList.push({prize: prizes[i + 1]});
    }
    return prizeList;
  }
});

Template.tier.events({
  'click tr': function (e) {
    e.preventDefault();
    var tier = Session.get('SelectedTier');
    if (tier !== this.tier)
      Session.set('SelectedTier', this.tier);
    else
      Session.set('SelectedTier', null);
  }
});

Template.entries.helpers({
  hasItems: function() {
    return this.entries.length > 0;
  }
});
//Template.tier.rendered = function () {
//  console.log(this);
//  $(this.find('td')).popover({
//    title: 'Entries',
//    container: 'body',
//    content:'<p>test</p>',
//    html: true,
//    placement: 'bottom',
//    trigger: 'click'
//  });
//};

Template.entry.helpers({});