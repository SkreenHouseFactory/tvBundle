// -- Sliders
var Sliders;
Sliders = {
  elmt: null,
  topbar: null,
  params: {img_width: 150,
         img_height: 200},
  nav: {replay: ['&nbsp;', 'Plus d\'une semaine', 'La semaine dernière', 'Hier', 'Hier soir', 'En ce moment', 'Ce soir', 'Demain', 'Cette semaine', 'Au delà']
  },
  subnav: {replay: ['Tous les genres', 'Films', 'Documentaires', 'Séries', 'Emissions', 'Sport', 'Spectacles']
  },
  init: function(action, args) {
    var self = this;
    console.log('Sliders.init', action, args);
    this.elmt = $('#sliders');
    this.topbar = $('#topbar');
    
    this.elmt.empty();
    this.ui(action, args, function(){
      UI.focus($('li:first', self.elmt)); //.addClass('tv-component-focused');
    });
    this.elmt.fadeIn();
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
  load: function(title, programs, args) {
    var self = this;
    //console.log('Sliders.load', title, programs);
    var args = $.extend(args, {title: title,
                               programs: programs,
                               scroll: args.scroll});
    var slider = new BaseSlider(args);
    

    this.elmt.append(slider.render());
  },
  initTvreplay: function(args, callback) {
    var self = this;
    if (typeof args.keep_nav == 'undefined') {
      this.loadMenuTvReplay();
    }
    var args = $.extend(this.params, args, {with_best_offer: 1});
    
    API.query('GET',
              'schedule/tvreplay.json',
              args,
              function(datas){
                for (k in datas) {
                  console.log('Sliders.load', 'slider', datas[k]);
                  self.load(datas[k].title, datas[k].programs, args);
                }
                callback();
              }, 
              true, 
              2);
  },
  initSearch: function(args, callback) {
    var self = this;
    //this.elmt.prepend($('#splash [data-load-route="search"]').clone()).addClass('search');
    var sliders = ['Archives','Documentaires','Emissions','Films','Spectacles','Séries'];
    var q = $('[data-load-route="search"]').val();
    var args = $.extend(this.params, args, {offset:0, nb_results: 10});
    $('.onglet span', UI.topbar).html('Recherche : ' + q);
    $('.nav, .subnav').hide();
    API.query('GET',
              'search/' + q + '.json',
              args,
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
    $('.onglet span', this.topbar).html('TV & Replay');
    $('.nav, .subnav').show();
    var nav = $('.nav ul', this.topbar);
    var subnav = $('.subnav ul', this.topbar);
    for (key in this.nav.replay) {
      nav.append('<li class="tv-component' + (key == 5 ? ' selected' : '') + '" data-load-view="sliders" data-load-route="tv-replay" data-keep-nav="1" data-nav="' + this.nav.replay[key]  + '">' + this.nav.replay[key]  + '</li>');
    }
    $('.nav').show();
    for (key in this.subnav.replay) {
      subnav.append('<li class="tv-component' + (key == 0 ? ' selected' : '') + '" data-load-view="sliders" data-load-route="tv-replay" data-keep-nav="1" data-subnav="' + this.subnav.replay[key]  + '">' + this.subnav.replay[key]  + '</li>');
    }
    $('.subnav').show();
  },
}