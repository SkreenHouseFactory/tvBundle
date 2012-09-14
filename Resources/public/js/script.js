// -- init
console.log('API.init');
API.init(function(){
  // -- console
  if( API.config.env != 'dev' ) {
    console = {
        log: function() {},
        warn: function() {},
        error: function() {}
    };

    console.log('API.init', 'callback');
  }
});

// -- ready
$(document).ready(function(){

	UI.init();

  //touch event
  if (document.location.href.match(/touch/gi)) {
    $('.tv-component-focused').live('click', function(e){
  	  e.preventDefault();
  	  e.stopPropagation();
  	  UI.goEnter();
    });
  }


  // -- debut script
  Skhf = {
    session: null
  }

  // -- session
  //$('.user-on').hide();
  Skhf.session = new BaseSession(function(){
    console.log('script', 'context', API.context);
    UI.loadView('splash', 'splash');
    //UI.loadUserPrograms();
  });

  // -- signout
  $('a.signout').live('click', function(){
    Skhf.session.signout(function() {
      UI.loadUser();
    });
    return false;
  });

  // -- fav
  $('.fav').live('click', function(e){
    e.preventDefault();
    UI.togglePlaylistProgram($(this));
    return false;
  });

  // -- modal
  $('.modal').on('show', function(e){
    $('.tv-component-last-focused').removeClass('tv-component-last-focused');
    $('.tv-component-focused').addClass('tv-component-last-focused');
  });
  $('.modal').on('hide', function(e){
    console.log(['script', 'modal', "on('hide')", 'last-focused:' + $('.tv-component-last-focused').length]);
    UI.keynav();
    UI.focus($('.tv-component-last-focused')); //$('div:not(#toppbar, .modal) .tv-component:first'));
    if (Player.state == 'paused') {
      Player.resume();
    }
  });
  $('.modal .close').live('click', function(e){
    $('.modal').modal('hide');
  });
 
  //document.location = '/app.php/gtv?microtime=' + new Date();

  //keynav
  $(document).keydown(function(e) {

    var key = e.keyCode;
		switch(key) {
			case 37:
			  UI.goLeft();
			  break;
			case 38:
			  UI.goUp();
			  break;
			case 39:
			  UI.goRight();
			  break;
			case 40: 
			  UI.goDown();
			  break;
			case 13:
			  if (typeof Webview == 'undefined' || !navigator.userAgent.match(/android/gi)) {
         console.warn(['script.keydown', 'enter 13', 'no Webview']);
			   UI.goEnter(key);
			  } else {
         //console.warn(['script.keydown', 'enter 13', 'skipped']);
			  }
			  break;
			case 27:
			  UI.goReturn()
			  break;
			default:
			  break;
		}

    Couchmode.idle();

    //console.warn(['script.keydown', 'key', key]);
  });

});