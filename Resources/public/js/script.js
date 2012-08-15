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
    UI.focus($('#splash .icon:first'));
  });
  $('a.signout').live('click', function(){
    Skhf.session.signout();
    return false;
  });

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
    setTimeout(function() {
                $('.modal input[type="text"], .modal input.text').attr('autocomplete', 'off');
                $('.modal').addClass('tv-container-vertical');
                $('.modal input').addClass('tv-component');
                UI.focus($('.modal .tv-component:first'));
               }, 2000);
  });
  $('.modal').on('hide', function(e){
    console.log('script', 'modal', "on('hide')", $('body .tv-container-horizontal .tv-component:first'));
    UI.focus($('body > div:not(#toppbar, .modal) .tv-component:first'));
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

  // -- keys
  $(window).keyup(function(e) {
    console.warn('keyup', e.keyCode);
    var elmt = $('.tv-component-focused');

    /*if ($('.modal').css('display') == 'block') {
      console.warn('keyup', 'modal');
      if (e.keyCode == 40) { //down
        UI.focus(elmt.next('input'));
      } else if (e.keyCode == 38) { //up
        UI.focus(elmt.prev('input'));
      }
      
      return false;
    }*/
    if (e.keyCode == 8) {
      UI.historyBack();
    }
    if (e.keyCode == 40) { //down
      //vertical
      if (elmt.find('.tv-container-vertical .tv-component:first').length > 0) {
        UI.focus(elmt.find('.tv-container-vertical .tv-component:first'));
        elmt.find('.tv-container-vertical').addClass('tv-container-show');
        return false;
      } else if (elmt.parents('.tv-container-vertical').length > 0) {
        console.log('keyup', 'down', 'vertical', elmt.parents('.tv-container-vertical'));
        if (elmt.next('.tv-component').length > 0) {
          UI.focus(elmt.next('.tv-component'));
        } else {
         var found = false;
          elmt.parents('.tv-container-vertical:first').find('.tv-component:not([type="hidden"])').map(function(k, nextelmt){
            console.log('keyup', 'down', 'vertical', 'component', $(nextelmt).attr('name'), elmt.attr('name'));
            if ($(nextelmt).attr('name') == elmt.attr('name')) {
              elmt.data('next', 1);
            } else if (elmt.data('next') == 1) {
              UI.focus($(nextelmt));
              elmt.data('next', 0);
            }
          });
        }
      } else {
      
        //horizontal
        var parents = elmt.parents('.tv-container-horizontal');
        var parent = $(parents[0])
        console.warn('keyup', 'down', 'parents', parents, parent.find(elmt));
        if (parent.find(elmt).length > 0 && 
            parent.hasClass('slider') == false && 
            parent.attr('id') != 'icons') {
          console.log('keyup', 'down', 'horizontal', 'parent contains elmt', parent);
          var not = parent.attr('id') != 'undefined' ? ':not(#' + parent.attr('id') + ')' : '';
          UI.focus(parent.parent().find('.tv-container-horizontal' + not + ' .tv-component:first'));
        
        } else if (parent.hasClass('tv-container-horizontal')) {
          if (parent.next('.tv-container-horizontal').find('.tv-component:first').length > 0) {
            UI.focus(parent.next('.tv-container-horizontal').find('.tv-component:first'));
          } else {
            var parent = $(parents[1])
            if (parent.next('.tv-container-horizontal').find('.tv-component:first').length > 0) {
              UI.focus(parent.next('.tv-container-horizontal').find('.tv-component:first'));
            }
          }
          
          if (parent.hasClass('couchmode')) {
            console.log('keyup', 'couchmode current');
            Couchmode.slideV(parent, 'down');
          }
        }
      }
    }
    if (e.keyCode == 39) { //right
      var nexts = elmt.nextAll('.tv-component');
      //console.log('keyup', 'nexts', nexts);
      if (nexts.length > 0) {
        UI.focus($(nexts[0]));
          console.log('keyup', 'nexts', 'p:' + $(nexts[0]).data('position'), 'c:' + $(nexts[0]).parents('.slider.couchmode').length);
        if ($(nexts[0]).data('position') > 4 && $(nexts[0]).parents('.slider:not(.no-scroll)').length > 0) {
          console.log('keyup', 'nexts', 'slideH', 'right');
          Couchmode.slideH($(nexts[0]).parents('.slider:not(.no-scroll)'), 'right');
        }
      }
    }
    if (e.keyCode == 38) { //up
      //vertical
      if (elmt.parents('.tv-container-vertical').length > 0) {
        console.log('keyup', 'up', 'vertical', elmt.parents('.tv-container-vertical'));
        if (elmt.prev('.tv-component').length > 0) {
          UI.focus(elmt.prev('.tv-component'));
        } else {
          
         elmt.parents('.tv-container-vertical').removeClass('tv-container-show');
          
         prevelmt = null;
          elmt.parents('.tv-container-vertical:first').find('.tv-component:not([type="hidden"])').map(function(k, nextelmt){
            console.log('keyup', 'up', 'vertical', 'component', $(nextelmt).attr('name'), elmt.attr('name'));
            if ($(nextelmt).attr('name') == elmt.attr('name')) {
              console.log('prevelmt', prevelmt);
              UI.focus(prevelmt);
              return false;
            }
            prevelmt = $(nextelmt);
          });


         //} else {
         //}
        }
        return false;
      }
      
      //horizontal
      var parents = elmt.parents('.tv-container-horizontal');
      var parent = $(parents[0])
      console.warn('keyup', 'up', 'parents', parents);
      if (parent) {
        if (parent.prevAll('.tv-container-horizontal:first').find('.tv-component:first').length > 0) {
          UI.focus(parent.prevAll('.tv-container-horizontal:first').find('.tv-component:first'));
        } else {
          var parent = $(parents[1])
          if (parent.prev('.tv-container-horizontal').find('.tv-component:first').length > 0) {
            UI.focus(parent.prev('.tv-container-horizontal').find('.tv-component:first'));
          } else if (UI.topbar.css('display') == 'block') {
            UI.focus(UI.topbar.find('.tv-component:first'));
          }
        }
        
        if (parent.hasClass('couchmode')) {
          console.log('keyup', 'couchmode current');
          Couchmode.slideV(parent, 'up');
        }
      }
    }
    if (e.keyCode == 37) { //left
      var prevs = elmt.prevAll('.tv-component');
      //console.log('keyup', 'prevs', prevs);
      if (prevs.length > 0) {
        UI.focus($(prevs[0]));
        if ($(prevs[0]).data('position') >= 4 && $(prevs[0]).parents('.slider:not(.no-scroll)').length > 0) {
          console.log('keyup', 'nexts', 'slideH', 'left');
          Couchmode.slideH($(prevs[0]).parents('.slider:not(.no-scroll)'), 'left');
        }
      }
    }
    if (e.keyCode == 13) {
      console.log('keyup', 'click', elmt);
      elmt.click();
    }

    return false;
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
});