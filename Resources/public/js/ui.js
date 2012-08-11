// -- UI
var UI;
UI = {
  currentRoute: 'splash',
  load: function(route, view) {
    console.log('UI.load', route, view);
    var self = this;
    this.unload(this.currentRoute, function(){
      self.currentRoute = route;
      switch (view) {
        case 'sliders':
          Sliders.load({onglet: route});
        break;
        case 'list':
          List.load({onglet: route});
        break;
        default:
          Couchmode.start({onglet: route});
        break;
      }
    });
  },
  unload: function(route, callback) {
    switch (route) {
      default:
        $('#' + route).fadeOut();
      break;
    }
    
    if (typeof callback != 'undefined') {
      callback();
    }
  }
}