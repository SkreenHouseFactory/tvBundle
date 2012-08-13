// -- Couchmode
var Couchmode;
Couchmode = {
  elmt: null,
  sliders: null,
  active_slider: null,
  timeout: null,
  timeoutdelay: 3000,
  init: function(args) {
    console.log('Couchmode.start', args);
    var self = this;
    this.elmt = $('#couchmode');
    this.sliders = $('#couchmode-sliders', this.elmt);
    this.player = $('#couchmode-player', this.elmt);
    this.idle()

    if (args.onglet == 'show') {
      this.elmt.show();
    } else {
      API.query('GET',
                'couchmode.json',
                args,
                function(json){
                  self.start(json);
                }, 
                true, 
                2);
    }
  },
  start: function(datas) {
    console.log('Couchmode.init', datas);
    var self = this;
    this.loadMenu(datas.menu);
    this.loadSliders(datas.sliders, function(){
      if (self.active_slider == null) {
        console.log('Couchmode.init', 'callback');
        self.active_slider = $('.slider', self.sliders).slice(0,1);
        self.active_slider.addClass('current');
        self.play();
      }
      self.elmt.show()
    });
  },
  idle: function() {
    var self = this;
    this.timeout = setTimeout(function(){
      $('.overlay').fadeOut('slow');

    }, this.timeoutdelay);
    $(window).mousemove(function(e) {
      if ($('.overlay').css('display') == 'none') {
        console.log('Couchmode.timeout', 'mousemove');
        $('.overlay').show();
        self.timeout = setTimeout(function(){
          $('.overlay').fadeOut('slow');
        }, self.timeoutdelay);
      }
    });
    $(window).keyup(function(e) {
      if ($('.overlay').css('display') == 'none') {
        console.log('Couchmode.timeout', 'mousemove');
        $('.overlay').show();
        self.timeout = setTimeout(function(){
          $('.overlay').fadeOut('slow');
        }, self.timeoutdelay);
      }
    });
  },
  loadMenu: function(menu) {
    console.log('Couchmode.loadMenu', menu, this.topbar);
    $('.onglet span', this.topbar).html(menu.onglet);
    var nav = $('.nav ul', this.topbar);
    var subnav = $('.subnav ul', this.topbar);
    for (key in menu.nav) {
      nav.append('<li class="tv-component item-parent' + (key == 0 ? ' selected' : '') + '"><a href="#" class="item">' + menu.nav[key]  + '</a></li>');
    }
    for (key in menu.subnav) {
      subnav.append('<li class="tv-component item-parent' + (key == 0 ? ' selected' : '') + '"><a href="#" class="item">' + menu.subnav[key].name  + '</a></li>');
    }
  },
  loadSliders: function(datas, callback) {
    console.log('Couchmode.loadSliders', datas);
    for (key in datas) {
      var slider = new BaseSlider({
                                   title: datas[key].name, 
                                   data_id: datas[key].id
                                  }, 
                                  function(){
                                    console.log('Couchmode.loadSliders', 'callback');
                                    if (typeof callback != 'undefined') {
                                      callback();
                                    }
                                  });
      this.sliders.append(slider.render());
    }
  },
  play: function(li) {
    if (typeof this.player == 'undefined') {
      this.player = $('#couchmode-player');
    }
    var li = typeof li != 'undefined' ? li : $('li:first-child', this.active_slider);
    console.log('Couchmode.play', li);
    Player.playProgram(li.data('id'), this.player);
    li.focus();
  }
}