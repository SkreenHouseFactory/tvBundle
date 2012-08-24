// -- init
API.init(function(){
  // -- console
  if( API.config.env != 'dev' ) {
    console = {
        log: function() {},
        warn: function() {},
        error: function() {}
    };
  }
});

// -- ready
$(document).ready(function(){

  //keynav
  $(document).keydown(function(e) {

    var key = e.keyCode;
    //console.warn(['script.keydown', 'key', key]);
		switch(key) {
			//case 68:
			case 37:
			  //e.preventDefault();
			  UI.goLeft();
			  break;
			//case 84:
			case 38:
			  //e.preventDefault();
			  UI.goUp();
			  break;
			//case 71:
			case 39: 
			  //e.preventDefault();
			  UI.goRight();
			  break;
			//case 70:
			case 40: 
			  //e.preventDefault();
			  UI.goDown();
			  break;
			case 13:
			  //e.preventDefault();
			  if (typeof Webview == 'undefined') {
			   UI.goEnter()
			  } else {
          console.warn(['keydown', 'enter 13', 'skipped']);
			  }
			  break;
			case 27:
			  //e.preventDefault();
			  UI.goReturn()
			  break;
			default:
        console.warn(['keydown', 'key', key]);
			  break;
		}

    if (UI.currentView == 'couchmode') {
      Couchmode.idle();
    }
  });

  // keynav + give first div focus (optional)
  $('#splash .tv-component:visible').keynav('tv-component-focused', 'tv-component-unfocused', 'tv-component-vertical');
  UI.focus($('#icons .tv-component:visible:first'));

  // Couchmode
  $(window).mousemove(function(e) {
    e.preventDefault();
    //console.log('script', 'mousemove', 'Couchmode.idle', UI.currentView);
    if (UI.currentView == 'couchmode') {
      Couchmode.idle();
    }
  });

  // -- debut script
  Skhf = {
    session: null
  }

  // -- init
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
    $('li.tv-component-vertical-selected', $(this).parent()).removeClass('tv-component-vertical-selected');
    $(this).parent().removeClass('tv-container-show');
    $(this).addClass('tv-component-vertical-selected')
    return false;
  });

  // -- modal
  $('.modal').on('hide', function(e){
    console.log('script', 'modal', "on('hide')", $('.tv-component-last-focused'));
    $('.tv-component:visible, #topbar .tv-component').keynav('tv-component-focused', 'tv-component-unfocused', 'tv-component-vertical');
    UI.focus($('.tv-component-last-focused')); //$('div:not(#toppbar, .modal) .tv-component:first'));
    Player.resume(Couchmode.player);
  });
  $('.modal .close').live('click', function(e){
    $('.modal').modal('hide');
  });

  // -- routes
  $('.tv-component-focused[data-load-route]').live('click', function(e) {
    e.preventDefault();
    console.warn(['[data-load-route]', $(this).data('load-route'), this.className]);

    if ($(this).hasClass('tv-component-input') && !$(this).val()) {
      console.warn(['script', 'tv-component-input', 'empty']);
      return false;
    }

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
  $('.tv-component-focused[data-open-browser]').live('click', function(e) {
    console.warn('script', '[data-open-browser]', $(this).data('open-browser'));
    Webview.postMessage(['browser', $(this).data('open-browser')]);
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
      Player.pause($('#couchmode-player'));
      $(this).addClass('tv-component-last-focused');
      UI.load('fiche', 'popin', {id: $(this).data('id')});
    } else {
      Couchmode.play($(this), $('#couchmode-player'));
      //UI.load('show');
    }
    return false;
  }); 
  //document.location = '/app.php/gtv?microtime=' + new Date();
});