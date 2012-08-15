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
    this.sliders = $('#couchmode-sliders .container', this.elmt);
    this.player = $('#couchmode-player', this.elmt).empty();
    self.active_slider == null
    if (this.timeout == null) {
      this.idle();
    }

    if (args.onglet == 'show') {
      this.elmt.show();
    } else {
      args = $.extend(args, {img_width: 150, img_height: 200});
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
    //reset
    this.sliders.empty();
    self.active_slider = null;
    //load
    this.loadMenu(datas.menu);
    this.loadSliders(datas.sliders, function(slider){
      console.log('Couchmode.init', 'callback', $('.slider', self.sliders));
      if (self.active_slider == null) {
        self.active_slider = slider;
        self.active_slider.addClass('current');
        self.elmt.show()
        self.play();
      } else {
        slider.addClass('down');
      }
    });
  },
  idle: function() {
    var self = this;
    this.timeout = setTimeout(function(){
      $('.overlay').fadeOut('slow');
    }, this.timeoutdelay);

    $(window).mousemove(function(e) {
      clearTimeout(self.timeout);
      //if ($('.overlay').css('display') == 'none') {
        console.log('Couchmode.timeout', 'mousemove');
        $('.overlay').show();
        self.timeout = setTimeout(function(){
          $('.overlay').fadeOut('slow');
        }, self.timeoutdelay);
      //}
    });

    $(window).keyup(function(e) {
      clearTimeout(self.timeout);
      //if ($('.overlay').css('display') == 'none') {
        console.log('Couchmode.timeout', 'mousemove');
        $('.overlay').show();
        self.timeout = setTimeout(function(){
          $('.overlay').fadeOut('slow');
        }, self.timeoutdelay);
      //}
    });
  },
  loadMenu: function(menu) {
    console.log('Couchmode.loadMenu', menu, this.topbar);
    $('.onglet span', this.topbar).html(menu.onglet);
    $('.nav, .subnav').show();
    var nav = $('.nav ul', this.topbar);
    var subnav = $('.subnav ul', this.topbar);
    if (menu.nav != null && menu.nav.length > 0) {
      for (key in menu.nav) {
        nav.append('<li data-load-route="' + menu.nav[key]  + '" class="tv-component' + (key == 0 ? ' selected' : '') + '"><a href="#">' + menu.nav[key]  + '</a></li>');
      }
      $('.nav').show();
    } else {
      $('.nav').show();
    }
    /*if (menu.nav.length > 0) {
      for (key in menu.subnav) {
        subnav.append('<li data-load-route="' + menu.subnav[key] + '" data-subnav="' + menu.subnav[key]  + '" class="tv-component' + (key == 0 ? ' selected' : '') + '"><a href="#" class="item">' + menu.subnav[key].name  + '</a></li>');
      }
    } else {
      $('.subnav').show();
    }*/
  },
  loadSliders: function(datas, callback) {
    var self = this;
    console.log('Couchmode.loadSliders', datas);
    for (key in datas) {
      new BaseSlider({
                        title: datas[key].name, 
                        data_id: datas[key].id,
                        programs: datas[key].programs
                      }, 
                      function(slider){
                        console.log('Couchmode.loadSliders', 'callback');
                        self.sliders.append(slider.addClass('couchmode'));
                        if (typeof callback != 'undefined') {
                          callback(slider);
                        }
                      });
    }
  },
  play: function(li) {
    if (typeof this.player == 'undefined') {
      this.player = $('#couchmode-player');
    }
    var li = typeof li != 'undefined' ? li : $('li:first', this.active_slider);
    UI.focus(li); //li.addClass('tv-component-focused');
    console.log('Couchmode.play', li, this.active_slider);
    Player.playProgram(li.data('id'), this.player);
    // TODO : Player.loadMetaProgram({title: li.find('.title').text(), format:'', year:''});
    this.player.data('playing-id', li.data('id'))
  },
  slideV: function(slider, direction) {
    $('.slider', this.sliders).removeClass('down up current');
    if (direction == 'down') {
      //slider.prev('.tv-container-horizontal').removeClass('down');
      slider.removeClass('current').addClass('up');
      slider.next('.tv-container-horizontal').addClass('current');
      slider.next('.tv-container-horizontal').next('.tv-container-horizontal').addClass('down');
      this.sliders.animate({top: '-=240'}, 1000);
    } else {
      //slider.next('.tv-container-horizontal').removeClass('up');
      slider.removeClass('current').addClass('down');
      slider.prev('.tv-container-horizontal').addClass('current');
      slider.prev('.tv-container-horizontal').prev('.tv-container-horizontal').addClass('up');
      this.sliders.animate({top: '+=240'}, 1000);
    }
  },
  slideH: function(slider, direction) {
    console.log('Couchmode.slideH', slider, direction);
    if (direction == 'left') {
      $('ul', slider).animate({left: '+=155'}, 500);
    } else {
      $('ul', slider).animate({left: '-=155'}, 500);
    }
  }
}