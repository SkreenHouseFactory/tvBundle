// -- UI
var UI;
UI = {
  topbar: null,
  userblock: null,
  currentRoute: 'splash',
  historyRoutes: [],
  badge_notification: '<span class="badge badge-important">%count%</span>',
  init: function() {
    this.topbar = $('#topbar');
    this.userblock = $('#user');
  },
  load: function(route, view, args) {
    var self = this;
    var args = typeof args != 'undefined' ? args : {};
    console.log('UI.load', route, view, args);

    this.unload(this.currentRoute, args, function(){
      self.historyRoutes.push(self.currentRoute);
      self.currentRoute = route;
      switch (view) {
        case 'splash':
          $('.nav ul, .subnav ul').empty();
          $('.template').hide();
          $('#splash').fadeIn('slow');
          UI.focus($('#splash .icon:first'));
          console.log('UI.load', 'splash', this.topbar);
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
            self.load('splash', 'splash');
            return API.quickLaunchModal('signin', function() {
              Couchmode.init({onglet: route, session_uid: Skhf.session.uid});
            });
          }
          Couchmode.init({onglet: route, session_uid: Skhf.session.uid});
        break;
      }
    });
  },
  unload: function(route, args, callback) {
    //hide current view
    switch (route) {
      default:
        $('#' + route).fadeOut();
      break;
    }

    //couchmode
    clearTimeout(Couchmode.timeout);
    Couchmode.active_slider = null;
    
    //topbar
    if (typeof args.keep_nav == 'undefined') {
      //$('.nav ul, .subnav ul', UI.topbar).empty();
      $('.nav, .subnav', UI.topbar).hide().find('ul').empty();
      UI.topbar.show();
    }

    //callback
    if (typeof callback != 'undefined') {
      callback();
    }
  },
  loadUser: function() {
    if (Skhf.session.datas.email) {
      this.userblock.html(Skhf.session.datas.email + ' | <a class="tv-component signout" href="#">Déconnexion</a>');
    } else {
      this.userblock.empty();
    }
  },
  focus: function(elmt) {
    $('.tv-component-focused').removeClass('tv-component-focused');
    elmt.addClass('tv-component-focused');
    if (elmt.attr('type') != 'radio') {
      elmt.focus();
    }
  },
  historyBack: function() {
    this.load(this.historyRoutes.slice(0,1));
  },
  togglePlaylistProgram: function(trigger){
    var value = trigger.parent().data('id');
    var remove = trigger.hasClass('btn-primary') || trigger.hasClass('btn-danger') ? true : false;
    if (Skhf.session.datas.email) {
      API.togglePreference('like', value, trigger, function(value){
        console.log('UI.togglePlaylistProgram', 'callback', value, trigger, 'remove:'+remove);
        if (remove) { //pas pour le slider social
          trigger.removeClass('btn-primary').html('<i class="icon-add-sign"></i> Suivre / voir plus tard');
        } else {
          trigger.removeClass('btn-danger').addClass('btn-primary').html('<i class="icon-ok-sign icon-white"></i> Dans vos playlists');
        }
      });
    } else {
      API.quickLaunchModal('signin', function(){
        Skhf.session.sync();
      });
    }
  }
}