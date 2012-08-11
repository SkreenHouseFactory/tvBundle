// -- Couchmode
var Couchmode;
Couchmode = {
  nav: [],
  sliders: [],
  player: null,
  start: function(args) {
    console.log('Couchmode.start', args);
    var self = this;
    API.query('GET',
              'couchmode.json',
              args,
              function(json){
                self.init(json);
              }, 
              true, 
              2);
  },
  init: function(datas) {
    console.log('Couchmode.init', datas);
    this.loadNav(datas.menu);
    this.loadSliders(datas.sliders);
    this.play();
  },
  loadNav: function(nav) {
    this.nav = $('#couchmode-nav').html(nav.onglet).show();
  },
  loadSliders: function(sliders) {
  },
  play: function() {
  }
}