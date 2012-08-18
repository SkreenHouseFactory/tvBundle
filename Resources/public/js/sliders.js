// -- Sliders
var Sliders;
Sliders = {
  elmt: null,
  sliders: null,
  params: {img_width: 150,
         img_height: 200},
  nav: {replay: ['&nbsp;', 
                 'Plus d\'une semaine', 
                 'La semaine dernière', 
                 'Hier', 
                 'Hier soir', 
                 'En ce moment', 
                 'Ce soir', 
                 'Demain', 
                 'Cette semaine', 
                 'Au delà']
  },
  subnav: {replay: ['Tous les genres', 
                    'Films', 
                    'Documentaires', 
                    'Séries', 
                    'Emissions', 
                    'Sport', 
                    'Spectacles']
  },
  init: function(action, args) {
    var self = this;
    console.log('Sliders.init', action, args);
    this.elmt = $('#sliders');
    this.sliders = $('.container', this.elmt);
    this.sliders.empty();
    this.elmt.fadeIn();

    this.ui(action, args, function(){
      UI.focus($('li:first', self.sliders)); //.addClass('tv-component-focused');
    });
  },
  ui: function(action, args, callback) {
    var self = this;
    switch (action) {
      case 'tv-replay':
        this.initTvreplay(args, callback);
      break;
      case 'search':
        this.initSearch(args, callback);
      break;
    }
  },
  load: function(title, programs, args, callback, sliders_length) {
    var self = this;
    console.log('Sliders.load', title, programs);
    var args = $.extend(args, {title: title,
                               programs: programs,
                               scroll: args.scroll});
    new BaseSlider(args, function(slider){
      if ($('.slider', self.sliders).length >= 2) {
        slider.addClass('slide-v')
      }
      self.sliders.append(slider.addClass('sliders slide-h'));
      console.log('Sliders.load', 'callback', $('.slider', self.sliders).length, sliders_length);
      if (typeof callback != 'undefined' && $('.slider', self.sliders).length == sliders_length) {
        callback();
      }
    });
  },
  initTvreplay: function(args, callback) {
    var self = this;
    if (typeof args.keep_nav == 'undefined') {
      this.loadMenuTvReplay();
    }
    var params = $.extend({with_best_offer: 1, 
                  keep_nav: args.keep_nav, 
                  scroll: args.scroll, 
                  nav: typeof args.nav != 'undefined' ? args.nav : '', 
                  subnav: typeof args.subnav != 'undefined' ? args.subnav : ''}, this.params);

    API.query('GET',
              'schedule/tvreplay.json',
              params,
              function(datas){
                var datas = $.makeArray(datas);
                for (k in datas) {
                  console.log('Sliders.initTvreplay', 'slider', datas[k]);
                  self.load(datas[k].title, datas[k].programs, args, callback, datas.length);
                }
              }, 
              true, 
              2);
  },
  initSearch: function(args, callback) {
    var self = this;
    //this.elmt.prepend($('#splash [data-load-route="search"]').clone()).addClass('search');
    var sliders = ['Archives','Documentaires','Emissions','Films','Spectacles','Séries'];
    var q = $('[data-load-route="search"]').val();
    $.extend(this.params, {offset:0, nb_results: 10, keep_nav: args.keep_nav, scroll: args.scroll});
    $('.onglet span', UI.topbar).html('Recherche : ' + q);
    API.query('GET',
              'search/' + q + '.json',
              this.params,
              function(datas){
                for (k in datas) {
                    console.log('Sliders.load', 'slider', k, datas[k]);
                  if ($.inArray(k, sliders) != -1 && datas[k].length > 0) {
                    console.log('Sliders.load', 'slider', k, datas[k]);
                    self.load(k, datas[k], args);
                    if (k == 'Archives') {
                      break;
                    }
                  }
                }
                callback();
              }, 
              true, 
              2);
  },
  loadMenuTvReplay: function() {
    console.log('Sliders.loadMenuTvReplay', this.nav.replay, this.subnav.replay);
    $('.onglet span', UI.topbar).html('TV & Replay');
    //nav
    var nav = $('.nav ul', UI.topbar);
    for (key in this.nav.replay) {
      nav.append('<li class="tv-component tv-component-vertical' + (key == 5 ? '  tv-component-vertical-selected' : '') + '" data-load-view="sliders" data-load-route="tv-replay" data-keep-nav="1" data-nav="' + this.nav.replay[key]  + '">' + this.nav.replay[key]  + '</li>');
    }
    //subnav
    var subnav = $('.subnav ul', UI.topbar);
    for (key in this.subnav.replay) {
      subnav.append('<li class="tv-component tv-component-vertical' + (key == 0 ? '  tv-component-vertical-selected' : '') + '" data-load-view="sliders" data-load-route="tv-replay" data-keep-nav="1" data-subnav="' + this.subnav.replay[key]  + '">' + this.subnav.replay[key]  + '</li>');
    }

    $('.nav, .subnav').addClass('tv-container-vertical').show();
  }
}