// -- UI
var UI;
UI = {
  topbar: null,
  userblock: null,
  currentRoute: 'splash',
  currentView: 'splash',
  historyRoutes: [],
  historyViews: [],
  touch: false,
  dpad: false,
  badge_notification: '<span class="badge badge-important">%count%</span>',
  loader: '<div class="progress progress-striped active"><div class="bar" style="width:0%"></div></div>',
  init: function() {
    console.log(['UI.init', 'modernizr', $('html').attr('class')]);

    //playbook
    if (navigator.userAgent.match(/playbook/gi)) {
      $('html').addClass('playbook');
      $('.modal').hide(); // hack
    //ios
    } else if (navigator.userAgent.match(/ip(hone|ad|od)/gi)) {
      $('html').addClass('ios');
      Player.type = 'html5';
    //android
    } else if (navigator.userAgent.match(/android/gi) || document.location.href.match(/android/gi)) {
      $('html').addClass('android');
      Player.type = 'android';
    }
    //touch
    if (document.location.href.match(/touch/gi) || Modernizr.touch) {
      console.log(['UI.init', 'touch']);
      this.touch = true;
    //dpad
    } else if (typeof Webview != 'undefined') {
      console.log(['UI.init', 'dpad']);
      this.dpad = true;
    }
    
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

    //android
    if (typeof Webview != 'undefined') {
      Webview.postMessage(['fullscreen']);
    }

    var self = this;
    this.historyRoutes.push(this.currentRoute);
    this.historyViews.push(this.currentView);
    this.currentRoute = route;
    this.currentView = view;
    //console.log(['UI.loadView', 'callback', route, view, args]);
 
    switch (view) {
      case 'splash':
        $('#sliders, #couchmode, #topbar').hide();
        $('#splash').fadeIn('slow');

        self.keynav();

        switch (this.historyRoutes.pop()) {
          case 'v3-vod':
            self.focus($('#splash .icon-vod'));
          break;
          case 'v3-cine':
            self.focus($('#splash .icon-cine'));
          break;
          case 'playlist':
            self.focus($('#splash .icon-playlist'));
          break;
          case 'tv-replay':
          default:
            self.focus($('#splash .icon:first'));
          break;
        }

        //console.log('UI.load', 'splash', this.topbar);
      break;
      case 'popin':
        url = API.config.popin + route + '?';
        for (var key in args) {
          url += key + '=' + args[key] + '&';
        }
        //UI.appendLoader($('.modal .modal-body'));
        API.launchModal(url, function() {}, function() {

          $('.modal input').addClass('tv-component tv-component-input');
          $('.modal input[type="text"], .modal input.text').attr('autocomplete', 'off');
          setTimeout(function(){
            
            self.keynav($('.modal'));
            self.focus($('.modal .tv-component:first'));
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
        Couchmode.init({onglet: route, 
                        session_uid: Skhf.session.uid, 
                        program_id: args.program_id, 
                        nav: args.nav});
      break;
    }
  },
  unloadView: function(route, view, args, callback) {
    //console.log(['UI.unloadView', route, view, 'keep_nav :' + args.keep_nav, 'modal hidden :' + $('.modal').hasClass('hide')]);

    //modal
    if ($('.modal').hasClass('in') == true) {
      $('.modal').modal('hide');
    }

    //couchmode
    if (this.currentView == 'couchmode' && view != 'popin') {
      console.warn(['UI.unloadView', 'Couchmode.unload()']);
      Couchmode.unload();
    }

    //sliders
    if (this.currentView == 'sliders' && view != 'popin') {
      console.warn(['UI.unloadView', 'Sliders.unload()']);
      Sliders.unload();
    }

    //player
    if (Player.state == 'playing') {
      console.warn(['UI.unloadView', 'Player.stop()']);
      Player.stop();
    }

    //topbar
    if (typeof args.keep_nav == 'undefined') {
      if (view != 'popin') {
        $('.nav ul, .subnav ul', this.topbar).empty();
        $('.nav, .subnav', this.topbar).hide();
      }
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
      //TO FINISH :
      if (typeof Skhf.session.datas.notifications['programs'] != 'undefined') {
        $('.notifications').addClass('with-badge').append($(this.badge_notification).html(Skhf.session.datas.notifications['programs']['new'].length));
      }
    } else {
      $('.user', this.userblock).empty();
      this.userblock.hide();
    }
  },
  loadUserPrograms: function(ids, elmt) {
    var ids  = typeof ids  != 'undefined' ? ids  : Skhf.session.datas.queue;
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    //console.log('UI.loadUserPrograms', ids, elmt);
    for (key in ids) {
      //console.log('UI.loadUserPrograms', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)');
      $('.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)', elmt).html('<i class="icon-ok-sign icon-white"></i> Dans vos favoris')
                                                                             .addClass('btn-primary');
    }
  },
  unloadUserPrograms: function(ids, elmt) {
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    //console.log('UI.unloadUserPrograms', ids, elmt);
    for (key in ids) {
      //console.log('UI.loadUserPrograms', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)');
      $('.actions[data-id="' + ids[key] + '"] a.fav.btn-primary, .actions[data-id="' + ids[key] + '"] a.fav.btn-danger', elmt).html('<i class="icon-plus-sign"></i> Suivre / voir + tard')
                                                                      .removeClass('btn-primary');
    }
  },
  togglePlaylistProgram: function(trigger){
    var value = trigger.parent().data('load-player');
    var remove = trigger.hasClass('btn-primary') || trigger.hasClass('btn-danger') ? true : false;
    if (Skhf.session.datas.email) {
      API.togglePreference('like', value, trigger, function(value){
        //console.log('UI.togglePlaylistProgram', 'callback', value, trigger, 'remove:'+remove);
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
  keynav: function(elmt) {
    //console.warn(['UI.keynav']);
    $.keynav.reset();
    var components = typeof elmt == 'undefined' ? $('.tv-component:visible, #topbar .tv-component-vertical') : $('.tv-component:visible', elmt);
    components.keynav('tv-component-focused', 'tv-component-unfocused', 'tv-component-vertical');
  },
  focus: function(elmt) {
    //console.warn(['UI.focus', elmt.attr('class')]);

    if (typeof elmt == 'undefined' || elmt.length == 0) {
      var elmt = $('.tv-component:first');
    }

    $.keynav.setActive(elmt.get(0));
  },
  getFocusedElmt: function() {
    //console.warn(['UI.getFocusedElmt', $($.keynav.getCurrent()).className]);
    return $($.keynav.getCurrent());
  },
  slideV: function(slider, direction) {
    //console.log('UI.slideV', direction, slider.next('.slider.slide-v'), slider.prev('.slider.slide-v'));
    $('.slider', slider.parent()).removeClass('down up current');
    if (direction == 'down' && slider.next('.slider.slide-v').length > 0) {
      //slider.parent().css({top: '-=240'});
      slider.parent().animate({top: '-=240'}, 400, 'linear', function(){
        slider.addClass('down');
        slider.prev('.slider.slide-v').addClass('current');
        slider.prev('.slider.slide-v').prev('.slider.slide-v').addClass('up');
      });
    } else if (direction == 'up' && slider.prev('.slider.slide-v').length > 0) {
      //slider.parent().css({top: '+=240'});
      slider.parent().animate({top: '+=240'}, 400, 'linear',function() {
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
      $('ul', slider).animate({left: '+=155'}, 200, 'linear');
    } else if (direction == 'right') {
      //$('ul', slider).css({left: '-=155'});
      $('ul', slider).animate({left: '-=155'}, 200, 'linear');
    }
  },
  goLeft: function(){
    var elmt = UI.getFocusedElmt();
	  $.keynav.goLeft();
    var slider = elmt.parents('.slide-h:first');
    if (slider && elmt.data('position') > 3 && parseInt(elmt.parent().data('current-position')) > 0) {
      //console.log('position', 'left', elmt.data('position'), parseInt(elmt.parent().data('current-position')));
      this.slideH(slider, 'left');
      elmt.parent().data('current-position', parseInt(elmt.parent().data('current-position'))-1);
    }
  },
  goRight: function(){
    var elmt = UI.getFocusedElmt();
	  $.keynav.goRight();
    var slider = elmt.parents('.slide-h:first');
    if (slider && elmt.data('position') >= 3) {
      //console.log('position', 'right', elmt.data('position'), parseInt(elmt.parent().data('current-position')));
      this.slideH(slider, 'right');
      elmt.parent().data('current-position', parseInt(elmt.parent().data('current-position'))+1);
    }
  },
  goUp: function(){
    var elmt = UI.getFocusedElmt();
	  $.keynav.goUp();
    //slider
    var slider = elmt.parents('.slide-v:first');
    if (slider.length > 0) {
      this.slideV(slider, 'up');
    }
    //data-slide-v
    if (elmt.prev().data('slide-v-step')) {
      //console.log('goUp', elmt, elmt.parents('.tv-container-vertical:first'));
      elmt.parents('.tv-container-vertical:first').animate({top: '+=' + elmt.data('slide-v-step')}, 200);
    }
  },
  goDown: function(){
    //return this.goUp();
    var elmt = UI.getFocusedElmt();
	  $.keynav.goDown();
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
  },
  goEnter: function(isEnter){

    var elmt = this.getFocusedElmt();
    //console.warn(['UI.goEnter', 'play-program-id', elmt.data('play-program-id')]);

    //input
    if (elmt.hasClass('tv-component-input') && (!elmt.val() || typeof isEnter == 'undefined')) { //
      console.warn(['UI.goEnter', 'tv-component-input', 'empty', isEnter, elmt.val()]);
      return false;
    }

    //btn
    if (elmt.hasClass('btn')) {
      //console.log('keynav', 'btn', elmt.parent());
      elmt.parent().find('.btn-primary').removeClass('btn-primary');
      elmt.addClass('btn-primary');
    }

    //nav ?
    if (elmt.hasClass('tv-component-vertical')) {
      console.warn(['UI.goEnter', 'tv-component-vertical']);
      $('li.tv-component-vertical-selected', elmt.parent()).removeClass('tv-component-vertical-selected');
      elmt.addClass('tv-component-vertical-selected');
      $('.keynav-container-vertical-selected').removeClass('keynav-container-vertical-selected');
    }

    //route ?
    if (elmt.data('load-route')) {

      var args = {};
      if (elmt.data('slider-scroll')) {
        args.scroll = elmt.data('slider-scroll');
      }
      if (elmt.data('keep-nav')) {
        args.keep_nav = elmt.data('keep-nav');
      }
      if (elmt.data('program-id')) {
        args.program_id = elmt.data('program-id');
      }
      if (elmt.data('nav')) {
        args.nav = elmt.data('nav');
        args.subnav = $('.nav .selected', UI.topbar).length > 0 ? $('.subnav .selected', UI.topbar).data('subnav') : '';
      } else if (elmt.data('subnav')) {
        args.subnav = elmt.data('subnav');
        args.nav = $('.nav .selected', UI.topbar).length > 0 ? $('.nav .selected', UI.topbar).data('nav') : '';
      }
      //console.warn(['UI.goEnter', 'load-route', args, elmt]);
      UI.load(elmt.data('load-route'), elmt.data('load-view'), args);

    // browser ?
    } else if (elmt.data('open-browser')) {
      console.warn(['UI.goEnter', 'open-browser', elmt.data('open-browser')]);
      Webview.postMessage(['browser', elmt.data('open-browser')]);

    //slider ?
    } else if (elmt.data('play-program-id')) {
      console.warn(['UI.goEnter', elmt.parents('.slider.couchmode').length , 'play-program-id:' + elmt.data('play-program-id')]);
      if (elmt.parents('.slider.couchmode').length == 0 || 
          Player.elmt.data('playing-id') == elmt.data('play-program-id')) {
        if (Player.state == 'playing') {
          Player.pause();
        }
        UI.load('fiche', 'popin', {id: elmt.data('play-program-id')});
      } else {
        Couchmode.play(elmt);
      }

    // click
    } else { //if (this.touch == false) { //gtv : touch == true !!!
      console.warn(['UI.goEnter', 'trigger', 'click']);
      elmt.trigger('click');
    } //else {
    //  console.warn(['UI.goEnter', 'no action', 'touch' + this.touch]);
    //}
  },
  goReturn: function(){
    //btn
    if ($('.modal').hasClass('in')) {
      $('.modal').modal('hide');
    } else {
      this.load('splash', 'splash', {});
    }
  },
  // -- error
  error: function(msg) {
    $('#error').html(msg).fadeIn();
    setTimeout(function() {
                 $('#error').hide().empty();
               }, 3000);
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