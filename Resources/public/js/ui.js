// -- UI
var UI;
UI = {
  topbar: null,
  currentRoute: 'splash',
  historyRoutes: [],
  badge_notification: '<span class="badge badge-important">%count%</span>',
  init: function() {
    this.topbar = $('#topbar');
  },
  load: function(route, view, args) {
    var self = this;
    var args = typeof args != 'undefined' ? args : {};
    console.log('UI.load', route, view, args);

    this.unload(this.currentRoute, function(){
      self.historyRoutes.push(self.currentRoute);
      self.currentRoute = route;
      switch (view) {
        case 'splash':
          $('.template').hide();
          $('.nav ul, .subnav ul').empty();
          $('#splash').fadeIn('slow');
          UI.focus($('#splash .icon:first-child'));
        break;
        case 'popin':
          url = API.config.popin + route + '?';
          for (var key in args) {
            url += key + '=' + args[key] + '&';
          }
          API.launchModal(url)
        break;
        case 'sliders':
          $('#topbar').show();
          Sliders.init(route, args);
        break;
        case 'list':
          $('#topbar').show();
          List.init(route);
        break;
        default:
          $('#topbar').show();
          if (route == 'playlist' && !Skhf.session.datas.email) {
            return API.quickLaunchModal('signin', function() {
              Couchmode.init({onglet: route});
            });
          }
          Couchmode.init({onglet: route});
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

    clearTimeout(Couchmode.timeout);
    $('.nav ul, .subnav ul', UI.topbar).empty();
    UI.topbar.show();

    if (typeof callback != 'undefined') {
      callback();
    }
  },
  loadUser: function() {
  },
  focus: function(elmt) {
    $('.tv-component-focused').removeClass('tv-component-focused');
    elmt.addClass('tv-component-focused');
    elmt.focus();
  },
  historyBack: function() {
    this.load(this.historyRoutes.slice(0,1));
  }
}