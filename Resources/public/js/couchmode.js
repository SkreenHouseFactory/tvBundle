// -- Couchmode
var Couchmode;
Couchmode = {
  elmt: null,
  params: null,
  sliders: null,
  active_slider: null,
  timeout: null,
  timeoutdelay: 6000,
  initialized: false,
  init: function(args) {
    console.log('Couchmode.init', args);
    var self = this;
    this.params = {
      autoplay: typeof args.autoplay != 'undefined' ? args.autoplay : false, 
      hide_sliders:  typeof args.hide_sliders != 'undefined' ? args.hide_sliders : false
    };
    this.elmt = $('#couchmode');
    this.sliders = $('#couchmode-sliders .container', this.elmt).empty();
    Player.init($('#couchmode-player', this.elmt), $('#couchmode-player-meta', this.elmt));
    UI.appendLoader(Player.elmt, 1000);

    this.elmt.show();
    this.on();

    this.active_slider == null
    if (this.timeout == null) {
      this.idleStart();
    }

    if (args.onglet == 'show') {
      this.elmt.show();
    } else {
      var params = $.extend({
                             img_width: 150,
                             img_height: 200,
                             with_pass: 1,
                             limit: 3
                            },
                            args);
      API.query('GET',
                'couchmode.json',
                params,
                function(json){
                  self.start(json, args);
                }, 
                true, 
                2);
    }

    // initialize idle
    if (this.initialized == false) {
      $(window).mousemove(function(e) {
        e.preventDefault();
        //console.log('Couchmode.init', 'mousemove', 'Couchmode.idle', UI.currentView);
        self.idle();
      });
      this.initialized = true;
    }
  },
  prepare: function() {
    console.log('Couchmode.prepare', 'li:'+$('[data-play-program-id]', this.elmt).length);
    var self = this;
    this.on();
    $('.couchmode-close').unbind().bind('click', function(e){
      e.preventDefault();
      self.unload();
    });
    $('[data-play-program-id]', this.elmt).unbind().bind('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var elmt = $(this);
      console.warn('Couchmode.init' , 'play-program-id:' + elmt.data('play-program-id'));
      if (elmt.parents('.slider.couchmode').length == 0 || 
          Player.elmt.data('playing-id') == elmt.data('play-program-id')) {
        if (Player.state == 'playing') {
          Player.pause();
        }
        //self.infos(elmt.data('play-program-id'));
      } else {
        self.play(elmt);
      }
      return false;
    });
  },
  on: function() {
    console.log('Couchmode.on', this.params);
    if (this.params.hide_sliders) {
      $('#couchmode-sliders', this.elmt).hide().removeClass('couchmode-overlay');
    }
    $('.couchmode-off:not(.couchmode-overlay)').hide();
    $('.couchmode-on').show().animate({opacity: 1}, 500);
  },
  off: function() {
    window.clearTimeout(this.timeout);
    $('.couchmode-on').animate({opacity: 0}, 500, function(){
      $(this).hide();
      $('.couchmode-off').show();
    });
  },
  start: function(datas, args) {
    console.log('Couchmode.start', datas);
    var self = this;
    //reset
    this.sliders.empty();
    self.active_slider = null;
    //load
    this.loadMenu(datas.menu, args);
    this.loadSliders(datas.sliders, function(){
      console.log('Couchmode.start', 'callback', $('.slider', self.sliders), 'autoplay', datas.autoplay);
      UI.keynav();
      if (self.active_slider == null) {
        self.active_slider = $('.slider:first', self.sliders);
        self.active_slider.addClass('current');
        $('.slider:not(.current)', self.sliders).addClass('down');
        var autoplay = $('[data-id="' + datas.autoplay + '"]');
        self.play(autoplay.length > 0 ? autoplay : null, 
                  typeof datas.occurrence_id != 'undefined' ? datas.occurrence_id : null);

      } else {
        //slider.addClass('down');
      }
    });
  },
  idleStart: function() {
    var self = this;
    self.idle();
  },
  idle: function() {
    //console.log('Couchmode.idle');
    if (this.elmt != null && 
        this.elmt.css('display') == 'block') {
      $('.couchmode-overlay:not(#user)').show();
      window.clearTimeout(this.timeout);
      this.timeout = setTimeout(function(){
        $('.overlay, .couchmode-overlay').fadeOut('slow');
      }, this.timeoutdelay);
    }
  },
  loadSliders: function(datas, callback) {
    var self = this;
    console.log('Couchmode.loadSliders', datas);
    var nb_sliders = datas.length;
    for (key in datas) {
      new BaseSlider({
                      title: datas[key].name, 
                      data_id: datas[key].id,
                      programs: datas[key].programs,
                      url: datas[key].url
                     }, 
                     function(slider){
                      if ($('ul.items li:not(.loader)', slider).length > 0) {
                        slider.find('h2')
                              .prepend('<span class="pull-right">Plus de choix : "Flèche bas" <i class="icon-chevron-down icon-white"></i></span>')
                        self.sliders.append(slider.addClass('couchmode slide-h slide-v').data('slide-v-step', 240));
                        //console.log('Couchmode.loadSliders', 'callback', $('.slider', self.sliders).length, datas.length);
                      } else {
                        slider.remove();
                        nb_sliders = nb_sliders - 1;
                        console.warn('Couchmode.loadSliders', 'slider ignored : no programs', slider);
                        //self.sliders.append(slider.addClass('hide'));
                      }
                      if (typeof callback != 'undefined' && $('.slider', self.sliders).length == nb_sliders) {
                        console.log('Couchmode.loadSliders', 'callback', key);
                        self.prepare();
                        callback();
                      }
                     });
    }
  },
  loadMenu: function(menu, args) {
    console.log('Couchmode.loadMenu', menu, this.topbar);
    $('.onglet span', this.topbar).html(menu.onglet.replace('v3-vod', 'Vidéo à la demande')
                                                   .replace('v3-cine', 'Au cinéma')
                                                   .replace('couchmode-cine', 'Au cinéma')
                                                   .replace('v3-jeunesse', 'Vidéo à la demande')// 'Contenus jeunesse')
                                                   .replace('films', 'Vidéo à la demande')// 'Films en VOD')
                                                   .replace('documentaires', 'Vidéo à la demande')// 'Documentaires en VOD')
                                                   .replace('series', 'Vidéo à la demande')// 'Séries en VOD')
                                                   .replace('spectacles', 'Vidéo à la demande')// 'Théatre & spectacles en VOD')
                                                   .replace('emissions', 'Vidéo à la demande')// 'Emissions en VOD')
                                                   );
    var nav = $('.nav ul', this.topbar);
    if (menu.nav != null && menu.nav.length > 0) {
      for (key in menu.nav) {
        var name = menu.nav[key].replace('v3-','')
                                .replace('films', 'Films')
                                .replace('documentaires', 'Documentaires')
                                .replace('emissions', 'Emissions')
                                .replace('series', 'Séries')
                                .replace('spectacle', 'Concerts, spectacle')
                                .replace('jeunesse', 'Jeunesse');
        if (args.onglet == 'playlist') {
          nav.append('<li data-load-route="playlist" data-keep-nav="1" data-nav="' + menu.nav[key]  + '" class="tv-component tv-component-vertical' + (key == 0 ? ' tv-component-vertical-selected' : '') + '"><a href="#">' + name  + '</a></li>');
        } else {
          nav.append('<li data-keep-nav="1" data-load-route="' + menu.nav[key]  + '" class="tv-component tv-component-vertical' + (key == 0 ? ' tv-component-vertical-selected' : '') + '"><a href="#">' + name  + '</a></li>');
        }
      }
      $('.nav').addClass('tv-container-vertical');
      $('.nav').show();
    }
    /*
    var subnav = $('.subnav ul', this.topbar);
    if (menu.subnav.length > 0) {
      for (key in menu.subnav) {
        subnav.append('<li data-load-route="' + menu.subnav[key] + '" data-subnav="' + menu.subnav[key]  + '" class="tv-component' + (key == 0 ? ' tv-component-vertical-selected' : '') + '"><a href="#" class="item">' + menu.subnav[key].name  + '</a></li>');
      }
      $('.subnav').show();
    }*/
  },
  next: function() {
    var self = this;
    var next = $('.tv-component-focused', this.active_slider).next();
    if (next.length > 0) {
      if (Player.state == 'playing' || Player.state == 'paused') {
        Player.stop();
      }
      setTimeout(function(){
        UI.focus(next);
        self.play(next);
      }, 1000);
    } else {
      UI.error('Plus de programmes !');
    }
  },
  prev: function() {
    var self = this;
    var prev = $('.tv-component-focused', this.active_slider).prev();
    if (prev.length > 0) {
      if (Player.state == 'playing' || Player.state == 'paused') {
        Player.stop();
      }
      setTimeout(function(){
        UI.focus(prev);
        self.play(prev);
      }, 1000);
    } else {
      UI.error('Plus de programmes !');
    }
  },
  play: function(li, occurrence_id) {
    var self = this;
    console.log('Couchmode.play', 'occurrence_id:', occurrence_id, 'params:', this.params);
    if (typeof Player.elmt == 'undefined') {
      Player.elmt = $('#couchmode-player');
    }
    UI.removeLoader(Player.elmt);
    this.elmt.removeClass('unvailable');

    var li = typeof li != 'undefined' && li ? li : $('li:not(.static):first', this.active_slider);
    //console.log('Couchmode.play', 'player-program', li.data('player-program'), li);

    var player_datas = li.data('player-program');
    if (typeof player_datas == 'undefined') {
      return this.error('player_datas undefined');
    } else if (player_datas.id) {
      UI.focus(li);
      $('li.tv-component-focused', this.sliders).removeClass('tv-component-focused');
      li.addClass('tv-component-focused');

      //onErrorCallback
      var onErrorCallback = function(error){
        if (error) {
          this.error(error);
        } else {
          self.next();
        }
      }

      Player.loadMetaProgram(player_datas);
      //YouTube
      if (isNaN(player_datas.id)) {
        Player.play({
                      format: player_datas.format, 
                      url: player_datas.id
                    },
                    onErrorCallback);
      //Player mySkreen
      } else {
        var args = {fromWebsite: 'couchmode'}
        if (!this.params.hide_sliders) {
          args.control = 'disabled';
        }
        if (typeof occurrence_id != 'undefined' && occurrence_id != null) {
          Player.playOccurrence(occurrence_id, 
                              onErrorCallback,
                              args);
        } else {
          Player.playProgram(player_datas.id, 
                              onErrorCallback,
                              args);
        }
      }
      //console.log('Couchmode.play', 'play', play);
      //if (play == false) { // pas de vidéo : on lance la popin
      //  li.click();
      //}
      // TODO : Player.loadMetaProgram({title: li.find('.title').text(), format:'', year:''});
    } else {
      console.warn(['Couchmode.play', 'error player', li.data('id'), player_datas]);
    }
  },
  error: function(msg) {
    switch(msg) {
      case 'unvailable':
        this.elmt.addClass('unvailable');
      break;
      default:
        $('#couchmode-error').html(msg).fadeIn();
        setTimeout(function() {
                     $('#couchmode-error').hide().empty();
                   }, 3000);
      break;
    }

    $('#couchmode-error').html(msg).fadeIn();
    setTimeout(function() {
                 $('#couchmode-error').hide().empty();
               }, 3000);
  },
  unload: function() {
    console.log('Couchmode.unload');
    this.off();
    Player.stop();
    this.active_slider = null;
    if (this.sliders) {
      this.sliders.css('top', '0px');
      this.sliders.empty();
    }
  }
}