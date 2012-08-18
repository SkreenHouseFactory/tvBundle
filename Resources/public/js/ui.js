// -- UI
var UI;
UI = {
  topbar: null,
  userblock: null,
  currentRoute: 'splash',
  currentView: 'splash',
  historyRoutes: [],
  badge_notification: '<span class="badge badge-important">%count%</span>',
  init: function() {
    this.topbar = $('#topbar');
    this.userblock = $('#user');
  },
  load: function(route, view, args) {
    var self = this;
    var args = typeof args != 'undefined' ? args : {};

    if (typeof view == 'undefined') {
      var view = 'couchmode';
    }

    this.unloadView(this.currentRoute, view, args, 
                    function() {
                      self.loadView(route, view, args);
                    });
  },
  loadView: function(route, view, args){
    var self = this;
    this.historyRoutes.push(this.currentRoute);
    this.currentRoute = route;
    this.currentView = view;
    console.log('UI.load', 'callback', route, view, args);
    switch (view) {
      case 'splash':
        $('#sliders, #couchmode').hide();
        $('#splash').fadeIn('slow');
        self.focus($('#splash .icon:first'));
        self.topbar.hide();
        console.log('UI.load', 'splash', this.topbar);
      break;
      case 'popin':
        Webview.postMessage(['player', 'pause']);
        url = API.config.popin + route + '?';
        for (var key in args) {
          url += key + '=' + args[key] + '&';
        }
        API.launchModal(url)
      break;
      case 'sliders':
        $('#splash, #couchmode').hide();
        self.topbar.show();
        Sliders.init(route, args);
      break;
      default:
        $('#splash, #sliders').hide();
        self.topbar.show();
        if (route == 'playlist' && !Skhf.session.datas.email) {
          this.load('splash', 'splash');
          API.quickLaunchModal('signin', function() {
            self.loadUser();
            if (Skhf.session.datas.email) {
              self.loadView(route, view, $.extend(args, {nofocus: true}));
            }
          });
          return false;
        }
        Couchmode.init({onglet: route, session_uid: Skhf.session.uid, program_id: args.program_id, nav: args.nav});
      break;
    }
  },
  unloadView: function(route, view, args, callback) {
    console.log('UI.unload', route, view, args, 'modal:' + $('.modal').hasClass('hide'));

    //modal
    if ($('.modal').hasClass('in') == true) {
      $('.modal').modal('hide');
    }

    //couchmode
    clearTimeout(Couchmode.timeout);
    Couchmode.active_slider = null;
    Webview.postMessage(['player','stop']);
    Webview.postMessage(['fullscreen']);

    //topbar
    if (typeof args.keep_nav == 'undefined' && view != 'popin') {
      //$('.nav ul, .subnav ul', UI.topbar).empty();
      $('.nav, .subnav', this.topbar).hide().find('ul').empty();
    }

    //callback
    if (typeof callback != 'undefined') {
      callback();
    }
  },
  loadUser: function() {
    if (Skhf.session.datas.email) {
      $('.user', this.userblock).html(Skhf.session.datas.email);
      this.userblock.show();
    } else {
      $('.user', this.userblock).empty();
      this.userblock.hide();
    }
  },
  loadUserPrograms: function(ids, elmt) {
    var ids  = typeof ids  != 'undefined' ? ids  : Skhf.session.datas.queue;
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    console.log('UI.loadUserPrograms', ids, elmt);
    for (key in ids) {
      console.log('UI.loadUserPrograms', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)');
      $('.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)', elmt).html('<i class="icon-ok-sign icon-white"></i> Dans vos favoris')
                                                                            .addClass('btn-primary');
    }
  },
  unloadUserPrograms: function(ids, elmt) {
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    console.log('UI.unloadUserPrograms', ids, elmt);
    for (key in ids) {
      console.log('UI.loadUserPrograms', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)');
      $('.actions[data-id="' + ids[key] + '"] a.fav.btn-primary, .actions[data-id="' + ids[key] + '"] a.fav.btn-danger', elmt).html('<i class="icon-plus-sign"></i> Suivre / voir + tard')
                                                                      .removeClass('btn-primary');
    }
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
  },
  historyBack: function() {
    this.load(this.historyRoutes.slice(0,1));
  },
  focus: function(elmt, frame) {
    if (typeof elmt == 'undefined' || elmt.length == 0) {
      console.error('UI.focus', 'undefined');
      return false;
    }
    console.log('UI.focus', elmt, frame + ' .tv-component:visible');
    elmt.removeClass('tv-component-unfocused').addClass('tv-component-focused');
    $.keynav.reset();
    frame = typeof frame != 'undefined' ? frame : 'body';
    $(frame + ' .tv-component:visible').keynav('tv-component-focused', 'tv-component-unfocused', 'tv-component-vertical');
  },
  getFocusedElmt: function() {
    return $('.tv-component-focused:first');
  },
  slideV: function(slider, direction) {
    console.log('UI.slideV', direction, slider.next('.slider'), slider.prev('.slider'));
    $('.slider', slider.parent()).removeClass('down up current');
    if (direction == 'down' && slider.next('.slider').length > 0) {
      slider.parent().animate({top: '-=240'}, 1000, function(){
        slider.addClass('down');
        slider.prev('.slider').addClass('current');
        slider.prev('.slider').prev('.slider').addClass('up');
      });
    } else if (slider.prev('.slider').length > 0) {
      slider.parent().animate({top: '+=240'}, 1000, 'linear',function() {
        slider.addClass('up');
        slider.next('.slider').addClass('current');
        slider.next('.slider').next('.slider').addClass('down');
      });
    }
  },
  slideH: function(slider, direction) {
    console.log('Couchmode.slideH', slider, direction);
    if (direction == 'left') {
      $('ul', slider).animate({left: '+=155'}, 500, 'crazy');
    } else {
      $('ul', slider).animate({left: '-=155'}, 500, 'linear');
    }
  }
}