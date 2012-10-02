// -- Android Webview
var Webview;
Webview = {
  onMessage: function(args) {
    Couchmode.idle();
    //console.warn(['Webview.onMessage', args[0], args[1]]);
    switch (args[0]) {
      case 'init':
        Player.setType('android');
      break;
      case 'videoInfo':
      case 'videoError':
        UI.error('Erreur : ' + args[2]);
        console.warn(['Android videoError', args[1], args[2]]);
      case 'videoStart':
      case 'videoEnd':
        Couchmode.next();
      break;
      case 'keyCode':

        var key = parseInt(args[1]);
        switch (key) {
          case 22: //right
            //console.warn(['Webview.keyCode', 'UI.goRight']);
			      UI.goRight();
          break;
          case 21: //left
            //console.warn(['Webview.keyCode', 'UI.goLeft']);
			      UI.goLeft();
          break;
          case 20: //down
            //console.warn(['Webview.keyCode', 'UI.goDown']);
            //UI.goUp();
			      UI.goDown();
          break;
          case 19: //up
            //console.warn(['Webview.keyCode', 'UI.goUp']);
			      UI.goUp();
          break;
          case 13: //enter : attention already binded by jquery
          case 23: //enter
          //case 66: //enter kb
			      UI.goEnter(key);
            //console.warn(['Webview.keyCode', 'UI.goEnter', key]);
          break;
          case 4: //return
            //console.warn(['Webview.keyCode', 'UI.goReturn']);
			      UI.goReturn();
          break;
          case 89: //prev
            //console.warn(['Webview.keyCode', 'prev']);
            Couchmode.prev();
          break;
          case 90: //next
            //console.warn(['Webview.keyCode', 'next']);
            Couchmode.next();
          break;
          case 126: //play
            //console.warn('play');
			      Webview.postMessage(['player', 'play']);
          break;
          case 127: //pause
            //console.warn('pause');
			      Webview.postMessage(['player', 'pause']);
          break;
          default:
            //console.warn(['Webview.keyCode', args[1]]);
          break;
        }
        return false;
      break;
      case 'log':
        console.warn(['Webview.log', args[1]]);
      break;
    }
  },
  postMessage: function(args) {
    if (this.isActive()) {
      //alert('Webview success');
      //console.warn(['Webview.postMessage', args[0], args[1], args[2]]);
      switch (args[0]) {
        case 'player':
          switch (args[1]) {
            case 'launch':
              //launch video
              App.playerSetUrl(args[2]);
            break;
            case 'start':
              //start
              App.playerStart();
            break;
            case 'pause':
              //pause
              App.playerPause();
            break;
            case 'play':
              //play
              App.playerPlay();
            break;
            case 'stop':
              //pause
              App.playerStop();
            break;
          }
        break;
        case 'browser':
          App.webOpenUrl(args[1]);
        break;
        case 'fullscreen':
          App.setWebFullScreen();
        break;
      }
    } else {
      //alert('Webview fail');
      console.warn(['Webview.postMessage UNDEFINED !!', args[0], args[1], args[2]]);
    }
  },
  isActive: function() {
    return typeof App != 'undefined' ? true : false;
  },
  launchAndKill: function(url) {
    if (this.isActive()) {
      App.webOpenUrlAndLeave(url);
    }
  }
}