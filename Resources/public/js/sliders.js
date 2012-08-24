// -- Sliders
var Sliders;
Sliders = {
  elmt: null,
  sliders: null,
  params: {img_width: 150,
         img_height: 200},
  nav: {replay: ['Plus d\'une semaine', 
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
    UI.appendLoader(this.sliders);
    this.elmt.fadeIn();

    this.ui(action, args, function(){
      $('.tv-component:visible, #topbar .tv-component').keynav('tv-component-focused', 'tv-component-unfocused', 'tv-component-vertical');
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
    var args = $.extend(args, {title: title,
                               programs: programs,
                               scroll: args.scroll});
    console.log('Sliders.load', args);
    new BaseSlider(args, function(slider){
      if ($('.slider', self.sliders).length > 0) {
        slider.addClass('slide-v').data('slide-v-step', 240);
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
                //loader
                UI.removeLoader(self.sliders);
                //sliders
                nb = 0;
                for(k in datas) {
                    if (datas.hasOwnProperty(k)) {
                        nb++;
                    }
                }
                for (k in datas) {
                  console.log('Sliders.initTvreplay', 'slider', datas[k], nb);
                  self.load(datas[k].title, datas[k].programs, args, callback, nb);
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
                //loader
                UI.removeLoader(self.sliders);
                //sliders
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
                //menu
                if (typeof args.keep_nav == 'undefined') {
                  self.loadMenuSearch(datas.facets);
                }
                //callback
                callback();
              }, 
              true, 
              2);
  },
  loadMenuTvReplay: function() {
    console.log('Sliders.loadMenuTvReplay', this.nav.replay, this.subnav.replay);
    $('.onglet span', UI.topbar).html('TV & Replay');
    //nav
    for (key in this.nav.replay) {
      UI.nav.append('<li class="tv-component tv-component-vertical' + (key == 5 ? '  tv-component-vertical-selected' : '') + '" data-load-view="sliders" data-load-route="tv-replay" data-keep-nav="1" data-nav="' + this.nav.replay[key]  + '">' + this.nav.replay[key]  + '</li>');
    }
    //subnav
    for (key in this.subnav.replay) {
      UI.subnav.append('<li class="tv-component tv-component-vertical' + (key == 0 ? '  tv-component-vertical-selected' : '') + '" data-load-view="sliders" data-load-route="tv-replay" data-keep-nav="1" data-subnav="' + this.subnav.replay[key]  + '">' + this.subnav.replay[key]  + '</li>');
    }

    //$('.nav, .subnav').addClass('tv-container-vertical').show();
  },
  loadMenuSearch: function(facets) {
    return;
    if (facets.access != 'undefined') {
        console.log('Sliders.loadMenuSearch', facets.access);
        var access = facets.access.split(';');
        UI.nav.append('<li class="tv-component tv-component-vertical tv-component-vertical-selected" data-load-view="sliders" data-load-route="search" data-keep-nav="1" data-nav="">Tout</li>');
      for (k in access) {
        UI.nav.append('<li class="tv-component tv-component-vertical" data-load-view="sliders" data-load-route="search" data-keep-nav="1" data-nav="' + access[k]  + '">' + access[k].replace('myskreen', 'Google TV').replace('ios', 'iPhone, iPad').replace('externe', 'Autre')  + '</li>');
      }
      UI.nav.parent().show();
    }
  }
}