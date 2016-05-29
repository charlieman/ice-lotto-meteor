Meteor.startup(function() {
  // _ensureIndex is not documented and soon
  // to be replaced by _createIndex.
  // (https://github.com/meteor/meteor/pull/3926)
  // Look into Collection.rawCollection.createIndex
  // in the future instead
  Lottos._ensureIndex({date: 1});
  GWUsers._ensureIndex({account: 1});
  Tiers._ensureIndex({lottoId: 1});
});
