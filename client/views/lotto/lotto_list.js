Template.lottoList.helpers({
  lottos: function() {
    return Lottos.find({}, {sort: {date: -1}});
  }
});
