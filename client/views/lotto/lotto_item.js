Template.lottoItem.helpers({
  prettyDate: function(){
    return moment(this.date).format('MMM Do, YYYY');
  }
});
