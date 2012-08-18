// -- ready
$(document).ready(function(){

  // give first div focus (optional)
  UI.focus($('.tv-component:visible:first'));
  // Handle enter clicks
  $('.tv-component-focused').live('click', function() {
    if ($(this).hasClass('.tv-component-focused-vertical')) {
      $(this).nextAll('.tv-component-focused-vertical').removeClass('.tv-component-focused-vertical');
      $(this).prevAll('.tv-component-focused-vertical').removeClass('.tv-component-focused-vertical');
      $(this).addClass('.tv-component-focused-vertical');
    } else if ($(this).hasClass('btn')) {
      $(this).parent().find('.btn-primary').removeClass('btn-primary');
      $(this).addClass('btn-primary');
    }
    console.warn('keynav', 'click');
  });

  //nav vertical sliders couchmode
  $(window).keyup(function(e) {
    console.warn('keyup', e.keyCode);
    switch (e.keyCode) {
      case 38: //up
        var elmt = UI.getFocusedElmt();
        var slider = elmt.parents('.slider.slide-v:first');
        console.log(slider);
        if (slider.length > 0) {
          UI.slideV(slider, 'up');
        }
      break;
      case 40: //down
        var elmt = UI.getFocusedElmt();
        var slider = elmt.parents('.slider.slide-v:first');
        console.log(slider);
        if (slider.length > 0) {
          UI.slideV(slider, 'down');
        }
      break;
      case 37: //left
        var elmt = UI.getFocusedElmt();
        var slider = elmt.parents('.slider.slide-h:first');
        if (slider && elmt.data('position') > 2) {
          UI.slideH(slider, 'left');
        }
      break;
      case 39: //right
        var elmt = UI.getFocusedElmt();
        var slider = elmt.parents('.slider.slide-h:first');
        if (slider && elmt.data('position') > 3) {
          UI.slideH(slider, 'right');
        }
      break;
    }
  });



  // -- debut script
  Skhf = {
    session: null
  }

  // -- init
  API.init(function(){
    // -- console
    if( API.config.console != true ) {
      console = {
          log: function() {},
          warn: function() {},
          error: function() {}
      };
    }
  });
  UI.init();

  // -- session
  //$('.user-on').hide();
  Skhf.session = new BaseSession(function(){
    console.log('script', 'context', API.context);
    //UI.loadUserPrograms();
    //UI.focus($('#splash .icon:first'));
  });
  $('a.signout').live('click', function(){
    Skhf.session.signout(function() {
      UI.loadUser();
    });
    return false;
  });

   Couchmode.player = $('#couchmode-player');
   Player.elmt = $('#couchmode-player');

  // -- fav
  $('.fav').live('click', function(e){
    e.preventDefault();
    UI.togglePlaylistProgram($(this));
    return false;
  });

  // -- nav
  $('.nav ul li, .subnav ul li').live('click', function(e) {
    //e.preventDefault();
    console.log('script', 'nav', $('li.selected', $(this).parent()), $(this))
    //update menu
    $('li.selected', $(this).parent()).removeClass('selected');
    $(this).parent().removeClass('tv-container-show');
    $(this).addClass('selected')
    return false;
  });

  // -- modal
  $('.modal').on('shown', function(e){
    console.log('script', 'modal', "on('shown')");
    $('.tv-component-focused:last').removeClass('tv-component-focused').addClass('tv-component-last-focused');
    
    setTimeout(function(){
      $('.tv-component-focused').removeClass('tv-component-focused'); //cancel background focus
      $('.modal input').addClass('tv-component tv-input');
      $('.modal input[type="text"], .modal input.text').attr('autocomplete', 'off');
      UI.focus($('.modal .tv-component:first'), '.modal');
    }, 2000);
  });
  $('.modal').on('hide', function(e){
    console.log('script', 'modal', "on('hide')", $('.last-tv-component-focused'), $('div:not(#toppbar, .modal) .tv-component:first'));
    UI.focus($('.tv-component-last-focused')); //$('div:not(#toppbar, .modal) .tv-component:first'));
  });
  $('.modal .close').live('click', function(e){
    $('.modal').modal('hide');
  });

  // -- routes
  $('[data-load-route]').live('click', function(e) {
    //e.preventDefault();

    var args = {};
    if ($(this).data('slider-scroll')) {
      args.scroll = $(this).data('slider-scroll');
    }
    if ($(this).data('keep-nav')) {
      args.keep_nav = $(this).data('keep-nav');
    }
    if ($(this).data('program-id')) {
      args.program_id = $(this).data('program-id');
    }
    if ($(this).data('nav')) {
      args.nav = $(this).data('nav');
      args.subnav = $('.nav .selected', UI.topbar).length > 0 ? $('.subnav .selected', UI.topbar).data('subnav') : '';
    } else if ($(this).data('subnav')) {
      args.subnav = $(this).data('subnav');
      args.nav = $('.nav .selected', UI.topbar).length > 0 ? $('.nav .selected', UI.topbar).data('nav') : '';
    }
    console.log('script tv', 'load-route', args, $(this));
    UI.load($(this).data('load-route'), $(this).data('load-view'), args);
    return false;
  });
  $('[data-open-browser]').live('click', function(e) {
    console.log('script', '[data-open-browser]', $(this).data('open-browser'));
    Webview.postMessage['browser', $(this).data('open-browser')]
  });

  // -- sliders
  $('.slider:not(.couchmode) li').live('click', function(e) {
    e.preventDefault();
    console.log('script', 'slider', 'li click', $(this));
    UI.load('fiche', 'popin', {id: $(this).data('id')});
    return false;
  });
  $('.slider.couchmode li').live('click', function(e) {
    e.preventDefault();
    console.log('script', 'couchmode', 'li click', $(this));
    if (Couchmode.player.data('playing-id') == $(this).data('id')) {
      UI.load('fiche', 'popin', {id: $(this).data('id')});
    } else {
      Couchmode.play($(this), $('#couchmode-player'));
      UI.load('show');
    }
    return false;
  }); 
  //document.location = '/app.php/gtv?microtime=' + new Date();
});