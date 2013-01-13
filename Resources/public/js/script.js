// -- ready
$(document).ready(function(){

  // -- init
  API.init(function(){
    console.log('API.init', 'callback');
    
    // -- session
    Skhf.session = new BaseSession(function(){
      console.log('script', 'session', API.context);
      UI.loadView('splash', 'splash');
      //UI.loadUserPrograms();
    });
  });

	UI.init();

  //touch event
  if (document.location.href.match(/touch/gi)) {
    $('.tv-component-focused').live('click', function(e){
  	  e.preventDefault();
  	  e.stopPropagation();
  	  UI.goEnter();
    });
  }

  // -- signout
  $('a.signout').live('click', function(){
    Skhf.session.signout(function() {
      Skhf.session.sync(function(){
        UI.loadUser();
        UI.loadView('splash', 'splash');
        setTimeout(function(){ UI.keynav(); }, 1000);
      });
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
    //callback ?
    if (UI.callbackModal != null) {
      console.log("script", "UI.callbackModal");
      UI.callbackModal();
      UI.callbackModal = null;
    }
  });
  $('.modal .close').live('click', function(e){
    $('.modal').modal('hide');
  });
 
  //document.location = '/app.php/gtv?microtime=' + new Date();

  //keynav
  $(document).keydown(function(e) {

    //block navigation ?
    if ($('[data-block-navigation="true"]').length > 0) {
      console.warn('script.keydown', 'block-navigation:', $('[data-block-navigation="true"]'));
      return false;
    }

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


  UI.keynav($('#splash'));

  // html5 history
  history.pushState({route: 'splash', 
                      view: 'splash',
                      args: {}}, 
                    document.title,
                    document.location.href);
  window.addEventListener('popstate', function(event) {
    console.warn('popstate', event.state);
    if (typeof event.state != 'undefined' && event.state != null) {
      UI.load(event.state.route, 
              event.state.view,
              typeof event.state.args != 'undefined' ? event.state.args : {});
    }
  });

});