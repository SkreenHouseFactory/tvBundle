// -- UI
var UI;
UI = {
  topbar: null,
  userblock: null,
  currentRoute: 'splash',
  currentView: 'splash',
  historyRoutes: [],
  badge_notification: '<span class="badge badge-important">%count%</span>',
  loader: '<div class="progress progress-striped active"><div class="bar" style="width:0%"></div></div>',
  init: function() {
    this.topbar = $('#topbar');
    this.userblock = $('#user');
    this.nav = $('.nav ul', this.topbar);
    this.subnav = $('.subnav ul', this.topbar);
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
    console.log('UI.loadView', 'callback', route, view, args);
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
        //UI.appendLoader($('.modal .modal-body'));
        API.launchModal(url, function() {}, function() {
          console.warn('callbackOnLoad', $('.tv-component-focused'), $('.tv-component-last-focused'));
          
          //$('.tv-component-focused').addClass('tv-component-last-focused');
          $('.modal input').addClass('tv-component tv-input');
          $('.modal input[type="text"], .modal input.text').attr('autocomplete', 'off');
          setTimeout(function(){
            self.focus($('.modal .tv-component:first'), '.modal');
          }, 1000);
        })
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
    console.log('UI.unloadView', route, view, args, 'modal hidden :' + $('.modal').hasClass('hide'));

    //keynav
    this.getFocusedElmt().removeClass('tv-component-focused').addClass('tv-component-unfocused');
    $.keynav.reset();

    //modal
    if ($('.modal').hasClass('in') == true) {
      $('.modal').modal('hide');
    }

    //couchmode
    if (this.currentView == 'couchmode') {
      Couchmode.unload();
    }
    
    //android
    Webview.postMessage(['fullscreen']);

    //topbar
    if (typeof args.keep_nav == 'undefined' && view != 'popin') {
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
    if (elmt.hasClass('tv-component-last-focused')) {
      elmt.removeClass('tv-component-last-focused');
    }
    console.log('UI.focus', elmt, frame + ' .tv-component:visible');
    frame = typeof frame != 'undefined' ? frame : 'body';
    $(frame + ' .tv-component:visible').keynav('tv-component-focused', 'tv-component-unfocused', 'tv-component-vertical');
    $.keynav.setActive(elmt.get(0));
    //elmt.removeClass('tv-component-unfocused').addClass('tv-component-focused');
  },
  getFocusedElmt: function() {
    return $($.keynav.getCurrent());
    //return $('.tv-component-focused:first');
  },
  slideV: function(slider, direction) {
    console.log('UI.slideV', direction, slider.next('.slider.slide-v'), slider.prev('.slider.slide-v'));
    $('.slider', slider.parent()).removeClass('down up current');
    if (direction == 'down' && slider.next('.slider.slide-v').length > 0) {
      //slider.parent().css({top: '-=240'});
      slider.parent().animate({top: '-=240'}, 200, 'linear', function(){
        slider.addClass('down');
        slider.prev('.slider.slide-v').addClass('current');
        slider.prev('.slider.slide-v').prev('.slider.slide-v').addClass('up');
      });
    } else if (direction == 'up' && slider.prev('.slider.slide-v').length > 0) {
      //slider.parent().css({top: '+=240'});
      slider.parent().animate({top: '+=240'}, 200, 'linear',function() {
        slider.addClass('up');
        slider.next('.slider.slide-v').addClass('current');
        slider.next('.slider.slide-v').next('.slider.slide-v').addClass('down');
      });
    }
  },
  slideH: function(slider, direction) {
    //console.log('Couchmode.slideH', slider, direction);
    if (direction == 'left') {
      //$('ul', slider).css({left: '+=155'});
      $('ul', slider).animate({left: '+=155'}, 200, 'crazy');
    } else if (direction == 'right') {
      //$('ul', slider).css({left: '-=155'});
      $('ul', slider).animate({left: '-=155'}, 200, 'linear');
    }
  },
  goLeft: function(){
    var elmt = UI.getFocusedElmt();
    var slider = elmt.parents('.slide-h:first');
    if (slider && elmt.data('position') > 3 && parseInt(elmt.parent().data('current-position')) > 0) {
      console.log('position', 'left', elmt.data('position'), parseInt(elmt.parent().data('current-position')));
      this.slideH(slider, 'left');
      elmt.parent().data('current-position', parseInt(elmt.parent().data('current-position'))-1);
    }
	  $.keynav.goLeft();
  },
  goRight: function(){
    var elmt = UI.getFocusedElmt();
    var slider = elmt.parents('.slide-h:first');
    if (slider && elmt.data('position') >= 3) {
      console.log('position', 'right', elmt.data('position'), parseInt(elmt.parent().data('current-position')));
      this.slideH(slider, 'right');
      elmt.parent().data('current-position', parseInt(elmt.parent().data('current-position'))+1);
    }
	  $.keynav.goRight();
  },
  goUp: function(){
    var elmt = UI.getFocusedElmt();
    //slider
    var slider = elmt.parents('.slide-v:first');
    if (slider.length > 0) {
      this.slideV(slider, 'up');
    }
    //data-slide-v
    if (elmt.data('slide-v-step')) {
      console.log('goUp', elmt, elmt.parents('.tv-container-vertical:first'));
      elmt.parents('.tv-container-vertical:first').animate({top: '+=' + elmt.data('slide-v-step')}, 200);
    }
	  $.keynav.goUp();
  },
  goDown: function(){
    var elmt = UI.getFocusedElmt();
    //slider
    var slider = elmt.parents('.slide-v:first');
    if (slider.length > 0) {
      this.slideV(slider, 'down');
    }
    //data-slide-v
    if (elmt.data('slide-v-step')) {
      console.log('goDown', elmt, elmt.parents('.tv-container-vertical:first'));
      elmt.parents('.tv-container-vertical:first').animate({top: '-=' + elmt.data('slide-v-step')}, 200);
    }
	  $.keynav.goDown();
  },
  goEnter: function(){
    this.getFocusedElmt().addClass('tv-component-last-focused');
    
    console.log('UI.goEnter', $('.tv-component-focused'), $('.tv-component-last-focused'));
	  $.keynav.activate();
	  //vertical selected
    var elmt = this.getFocusedElmt();
    console.log('script', 'keynav', 'activate', elmt);
    //btn
    if (elmt.hasClass('btn')) {
      console.log('keynav', 'btn', elmt.parent());
      elmt.parent().find('.btn-primary').removeClass('btn-primary');
      elmt.addClass('btn-primary');
    }
  },
  goReturn: function(){
    //btn
    if ($('.modal').hasClass('in')) {
      $('.modal').modal('hide');
    } else {
      this.load('splash', 'splash', {});
    }
  },
  // -- insert loader
  appendLoader: function(elmt) {
    $('.progress', elmt).remove();
    elmt.append(this.loader);
    $('.progress .bar', elmt).animate({'width': '100%'}, 5000);
  },
  // -- remove loader
  removeLoader: function(elmt) {
    elmt.find('.progress').remove();
  }
}