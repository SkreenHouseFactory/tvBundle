// -- Couchmode
var Couchmode;
Couchmode = {
  elmt: null,
  sliders: null,
  active_slider: null,
  timeout: null,
  timeoutdelay: 6000,
  initialized: false,
  init: function(args) {
    console.log('Couchmode.start', args);
    var self = this;
    this.elmt = $('#couchmode');
    this.sliders = $('#couchmode-sliders .container', this.elmt).empty();
    Player.init($('#couchmode-player', this.elmt));
    UI.appendLoader(Player.elmt, 1000);
    self.elmt.show();

    self.active_slider == null
    if (this.timeout == null) {
      this.idleStart();
    }

    if (args.onglet == 'show') {
      this.elmt.show();
    } else {
      API.query('GET',
                'couchmode.json',
                {
                  onglet: args.onglet, 
                  session_uid:args.session_uid, 
                  program_id: args.program_id,
                  nav: args.nav,
                  img_width: 150,
                  img_height: 200,
                  limit: 3
                },
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
  start: function(datas, args) {
    console.log('Couchmode.init', datas);
    var self = this;
    //reset
    this.sliders.empty();
    self.active_slider = null;
    //load
    this.loadMenu(datas.menu, args);
    this.loadSliders(datas.sliders, function(){
      console.log('Couchmode.init', 'callback', $('.slider', self.sliders));
      UI.keynav();
      if (self.active_slider == null) {
        self.active_slider = $('.slider:first', self.sliders);
        self.active_slider.addClass('current');
        $('.slider:not(.current)', self.sliders).addClass('down');
        self.play();
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
    //if (typeof Webview != 'undefined') {
    //  return;
    //}
    
    //console.log('Couchmode.idle');
    if (this.elmt != null && 
        this.elmt.css('display') == 'block') {
      $('.overlay').show();
      window.clearTimeout(this.timeout);
      this.timeout = setTimeout(function(){
        $('.overlay').fadeOut('slow');
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
                        slider.find('h2').prepend('<span class="pull-right">Plus de choix : "Flèche bas" <i class="icon-chevron-down icon-white"></i></span>')
                        self.sliders.append(slider.addClass('couchmode slide-h slide-v').data('slide-v-step', 240));
                        //console.log('Couchmode.loadSliders', 'callback', $('.slider', self.sliders).length, datas.length);
                        if (typeof callback != 'undefined' && $('.slider', self.sliders).length == nb_sliders) {
                          //console.log('Couchmode.loadSliders', 'callback', key);
                          callback();
                        }
                      } else {
                        slider.remove();
                        nb_sliders = nb_sliders - 1;
                        console.warn('Couchmode.loadSliders', 'slider ignored : no programs', slider);
                        //self.sliders.append(slider.addClass('hide'));
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
  play: function(li) {
    var self = this;
    if (typeof Player.elmt == 'undefined') {
      Player.elmt = $('#couchmode-player');
    }
    UI.removeLoader(Player.elmt);

    var li = typeof li != 'undefined' ? li : $('li:not(.static):first', this.active_slider);

    if (parseInt(li.data('play-program-id')) > 0) {
      UI.focus(li);
      var play = Player.playProgram(li.data('play-program-id'), function(){
        self.next();
      });
      if (play == false) { // pas de vidéo : on lance la popin
        li.click();
      }
      // TODO : Player.loadMetaProgram({title: li.find('.title').text(), format:'', year:''});
    } else {
      console.warn(['Couchmode.play', 'error player', li.data('id')]);
    }
  },
  unload: function() {
    console.log('Couchmode.unload');
    clearTimeout(this.timeout);
    this.active_slider = null;
    if (this.sliders) {
      this.sliders.css('top', '0px');
      this.sliders.empty();
    }
  }
}