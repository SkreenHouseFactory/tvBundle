$.easing.crazy = function(t, millisecondsSince, startValue, endValue, totalDuration) {
    if (t < endValue) {
      return t + 0.2;
    } else {
      return endValue;
    }
    if (t<0.5) {
        return t*4;
    } else {
        return -2*t + 3;  
    } 
};

// -- Couchmode
var Couchmode;
Couchmode = {
  elmt: null,
  sliders: null,
  active_slider: null,
  timeout: null,
  timeoutdelay: 6000,
  init: function(args) {
    console.log('Couchmode.start', args);
    var self = this;
    this.elmt = $('#couchmode');
    this.sliders = $('#couchmode-sliders .container', this.elmt).empty();
    this.player = $('#couchmode-player', this.elmt).empty();
    UI.appendLoader(this.player, 2000);
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
                { onglet: args.onglet, 
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
      $('.tv-component:visible, #topbar .tv-component').keynav('tv-component-focused', 'tv-component-unfocused', 'tv-component-vertical');
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
    //console.log('Couchmode.idle');
    $('.overlay').show();
    window.clearTimeout(this.timeout);
    this.timeout = setTimeout(function(){
      $('.overlay').fadeOut('slow');
    }, this.timeoutdelay);

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
                        if ($('ul.items li', slider).length > 0) {
                          self.sliders.append(slider.addClass('couchmode slide-h slide-v').data('slide-v-step', 240));
                          //console.log('Couchmode.loadSliders', 'callback', $('.slider', self.sliders).length, datas.length);
                          if (typeof callback != 'undefined' && $('.slider', self.sliders).length == nb_sliders) {
                            //console.log('Couchmode.loadSliders', 'callback', key);
                            callback();
                          }
                        } else {
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
                                                   .replace('v3-jeunesse', 'Contenus jeunesse')
                                                   .replace('films', 'Films en VOD')
                                                   .replace('documentaires', 'Documentaires en VOD')
                                                   .replace('series', 'Séries en VOD')
                                                   .replace('spectacles', 'Théatre & spectacles en VOD')
                                                   .replace('emissions', 'Emissions en VOD'));
    var nav = $('.nav ul', this.topbar);
    if (menu.nav != null && menu.nav.length > 0) {
      for (key in menu.nav) {
        if (args.onglet == 'playlist') {
          nav.append('<li data-load-route="playlist" data-keep-nav="1" data-nav="' + menu.nav[key]  + '" class="tv-component tv-component-vertical' + (key == 0 ? ' tv-component-vertical-selected' : '') + '"><a href="#">' + menu.nav[key]  + '</a></li>');
        } else {
          nav.append('<li data-keep-nav="1" data-load-route="' + menu.nav[key]  + '" class="tv-component tv-component-vertical' + (key == 0 ? ' tv-component-vertical-selected' : '') + '"><a href="#">' + menu.nav[key].replace('v3-','')  + '</a></li>');
        }
      }
      $('.nav').addClass('tv-container-vertical');
    }
    /*
    var subnav = $('.subnav ul', this.topbar);
    if (menu.subnav.length > 0) {
      for (key in menu.subnav) {
        subnav.append('<li data-load-route="' + menu.subnav[key] + '" data-subnav="' + menu.subnav[key]  + '" class="tv-component' + (key == 0 ? ' tv-component-vertical-selected' : '') + '"><a href="#" class="item">' + menu.subnav[key].name  + '</a></li>');
      }
    } else {
      $('.subnav').show();
    }*/
  },
  next: function() {
    var next = $('.tv-component-focused', this.active_slider).next();
    if (next.length > 0) {
      UI.focus(next);
      this.play(next);
    }
  },
  prev: function() {
    var prev = $('.tv-component-focused', this.active_slider).prev();
    if (prev.length > 0) {
      UI.focus(prev);
      this.play(prev);
    }
  },
  play: function(li) {
    UI.removeLoader(this.player);
    if (typeof this.player == 'undefined') {
      this.player = $('#couchmode-player');
    }
    var li = typeof li != 'undefined' ? li : $('li:first', this.active_slider);
    UI.focus(li);
    var play = Player.playProgram(li.data('id'), this.player);
    if (play == false) { // pas de vidéo : on lance la popin
      //li.click();
    }
    // TODO : Player.loadMetaProgram({title: li.find('.title').text(), format:'', year:''});
    this.player.data('playing-id', li.data('id'))
  },
  unload: function() {
    console.log('Couchmode.unload');
    clearTimeout(this.timeout);
    this.active_slider = null;
    this.sliders.css('top', '0px');
    Player.pause();
    Player.stop();
  }
}