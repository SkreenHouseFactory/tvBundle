// -- Sliders
var Sliders;
Sliders = {
  elmt: null,
  topbar: null,
  args: {img_width: 150,
         img_height: 200},
  nav: {replay: [' ', 'Plus d\'une semaine', 'La semaine dernière', 'Hier', 'Hier soir', 'En ce moment', 'Ce soir', 'Demain', 'Cette semaine', 'Au delà']
  },
  subnav: {replay: ['Tous les genres', 'Films', 'Documentaires', 'Séries', 'Emissions', 'Sport', 'Spectacles']
  },
  init: function(action, args) {
    console.log('Sliders.init', action, args);
    this.elmt = $('#sliders');
    this.topbar = $('#topbar');
    $.extend(this.args, args);
    
    this.loadDatas(action);
    this.elmt.fadeIn();
  },
  loadDatas: function(action) {
    var self = this;
    switch (action) {
      case 'tv-replay':
        this.initTvreplay();
      break;
      case 'search':
        this.initSearch();
      break;
    }
  },
  load: function(title, programs, args) {
    var self = this;
    //console.log('Sliders.load', title, programs);
    var args = $.extend(args, {title: title,
                               programs: programs,
                               scroll: this.args.scroll});
    var slider = new BaseSlider(args);
    

    this.elmt.append(slider.render());
  },
  initTvreplay: function() {
    var self = this;
    this.loadMenuTvReplay();
    var args = $.extend(this.args, {date: '2012-08-11 2', with_best_offer: 1});
    
    API.query('GET',
              'schedule/tvreplay.json',
              args,
              function(datas){
                for (k in datas) {
                  console.log('Sliders.load', 'slider', datas[k]);
                  self.load(datas[k].title, datas[k].programs, {});
                }
              }, 
              true, 
              2);
  },
  initSearch: function() {
    var self = this;
    //this.elmt.prepend($('#splash [data-load-route="search"]').clone()).addClass('search');
    var sliders = ['Archives','Documentaires','Emissions','Films','Spectacles','Séries'];
    var q = $('[data-load-route="search"]').val();
    var args = $.extend(this.args, {offset:0, nb_results: 10});
    $('.onglet span', UI.topbar).html('Recherche : ' + q);
    API.query('GET',
              'search/q' + q + '.json',
              args,
              function(datas){
                for (k in datas) {
                  if ($.inArray(k, sliders) != -1) {
                    console.log('Sliders.load', 'slider', k);
                    self.load(k, datas[k], {});
                    if (k == 'Archives') {
                      break;
                    }
                  }
                }
              }, 
              true, 
              2);
  },
  loadMenuTvReplay: function() {
    console.log('Sliders.loadMenuTvReplay', this.nav.replay, this.subnav.replay);
    $('.onglet span', this.topbar).html('TV & Replay');
    var nav = $('.nav ul', this.topbar);
    var subnav = $('.subnav ul', this.topbar);
    for (key in this.nav.replay) {
      nav.append('<li class="tv-component item-parent' + (key == 5 ? ' selected' : '') + '"><a href="#" class="item">' + this.nav.replay[key]  + '</a></li>');
    }
    for (key in this.subnav.replay) {
      subnav.append('<li class="tv-component item-parent' + (key == 0 ? ' selected' : '') + '"><a href="#" class="item">' + this.subnav.replay[key]  + '</a></li>');
    }
  },
}