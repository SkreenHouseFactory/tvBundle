$(document).ready(function(){
  var Skhf = {
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

  // -- session
  //$('.user-on').hide();
  Skhf.session = new BaseSession(function(){
    console.log('script', 'context', API.context);
    //UI.loadUserPrograms();
  });

});