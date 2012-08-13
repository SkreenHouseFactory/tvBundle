$(document).ready(function(){
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
  });

  // -- nav
  $('[data-load-route]').live('click', function(e) {
    e.preventDefault();
    var args = {};
    if ($(this).data('slider-scroll')) {
      args.scroll = $(this).data('slider-scroll');
    }
    console.log('script tv', 'load-route', args, $(this));
    UI.load($(this).data('load-route'), $(this).data('load-view'), args);
    return false;
  });

  //keys
  $(window).keyup(function(e) {
    console.warn('keyup', e.keyCode);
    if (e.keyCode == 8) {
      console.warn('keyup', e.keyCode);
      UI.historyBack();
      return false;
    }
  });

  // -- sliders
  $('.slider li').live('click', function(e) {
    e.preventDefault();
    console.log('script', 'slider', 'li click', $(this));
    UI.load('program', 'popin', {id: $(this).data('id')});
    return false;
  });
  $('#couchmode .slider li').live('click', function(e) {
    e.preventDefault();
    console.log('script', 'couchmode', 'li click', $(this));
    Couchmode.play($(this), $('#couchmode-player'));
    UI.load('show');
    return false;
  });
});