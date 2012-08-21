/*
 * jQuery Keyboard Navigation Plugin - Current
 *   http://mike-hostetler.com/jquery-keyboard-navigation-plugin
 *
 * To use, download this file to your server, save as keynav.js,
 * and add this HTML into the <head>...</head> of your web page:
 *   <script type="text/javascript" src="jquery.keynav.js"></script>
 *
 * Copyright (c) 2006-2010 Mike Hostetler <http://www.mike-hostetler.com/>
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 */
  $.keynav = new Object();

  $.fn.keynav = function (onClass,offClass,verticalClass) {

	  //Initialization
	  var kn = $.keynav;
	  if(!kn.init) {
		  kn.el = new Array();
		  kn.init = true;
	  }

	  return this.each(function() {
		  $.keynav.reg(this,onClass,offClass,verticalClass);
	  });
  }
  $.fn.keynav_sethover = function(onClass,offClass) {
    //console.warn('keynav_sethover');
	  return this.each(function() {
		this.onClass = onClass;
		this.offClass = offClass;
	  });
  }

  $.keynav.reset = function() {
	  var kn = $.keynav;
	  kn.el = new Array();
  }

  $.keynav.reg = function(e,onClass,offClass,verticalClass) {
	  var kn = $.keynav;
	  e.pos = $.keynav.getPos(e);
	  e.onClass = onClass;
	  e.offClass = offClass;
	  e.verticalClass = verticalClass;
	  e.onmouseover = function (e) {
      if (typeof Webview == 'undefined') {
       //console.warn(['keynav', 'onmouseover', e]);
	     $.keynav.setActive(this);
      } else {
       //console.warn(['keynav', 'onmouseover', e, 'skiped']);
      }
	  };
	  kn.el.push(e);
  }
  $.keynav.setActive = function(e, fromKeyb) {
    //console.warn(['keynav', 'setActive', e, fromKeyb]);
    
	  var kn = $.keynav;
	  var cur = $.keynav.getCurrent();
	  if ($(cur).hasClass(cur.offClass + '-input')) {
	   $(cur).blur();
	  }

    $(cur).removeClass(e.onClass).addClass(e.offClass);
    $(e).removeClass(e.offClass).addClass(e.onClass);
    UI.focus($(e), true);

    //vertical
    if ($(e).hasClass(cur.verticalClass)) {
      //console.log('keynav', 'verticalClass', $(e).parents('.tv-container-vertical:first').find('.' + e.verticalClass));
      $(e).parent().find('.' + e.verticalClass).show();
    } else {
      //console.log('keynav', 'no verticalClass', $('.' + e.verticalClass + ':not(.' + e.verticalClass + '-selected)'));
      $('.' + e.verticalClass + ':not(.' + e.verticalClass + '-selected)').hide();
    }

	  kn.currentEl = e;
    //console.warn(['keynav', 'focused', kn.currentEl.className]);
  }
  $.keynav.getCurrent = function () {
	  var kn = $.keynav;
	  if(kn.currentEl) {
		  var cur = kn.currentEl;
	  }
	  else {
		  var cur = kn.el[0];
	  }
    //console.warn(['keynav', 'lastFocused', cur.className]);
	  return cur;
  }
  $.keynav.quad = function(cur,fQuad) {    
	  var kn = $.keynav;
	  var quad = Array();
	  for(i=0;i<kn.el.length;i++) {
		var el = kn.el[i];
		if(cur == el) continue;
		if(fQuad((cur.pos.cx - el.pos.cx),(cur.pos.cy - el.pos.cy)))
		  quad.push(el);
	  }
	  return quad;
  }
  $.keynav.activateClosest = function(cur,quad,direction) {
	  var closest;
	  var od = 1000000;
	  var nd = 0;
	  var found = false;
	  for(i=0;i<quad.length;i++) {
		var e = quad[i];
		nd = Math.sqrt(Math.pow(cur.pos.cx-e.pos.cx,2)+Math.pow(cur.pos.cy-e.pos.cy,2));
		
		  /*if ($(found).hasClass('.nav') || $(found).hasClass('.subnav')) {
  	   console.log('keynav', 'hack', found);
  	   return $.keynav.setActive($('.logo.tv-component').get(0), true);
  	  }*/

    //si up on ne peut pas attraper les menus
		if(nd < od && ($(cur).parents('.slider').length == 0 ||
		               $(cur).parents('.slider').length != $(e).parents('.nav, .subnav').length)) {
		  console.log('keynav', 'found', e, direction, $(cur).parents('.slider').length + '!=' + $(e).parents('.nav, .subnav').length);
			closest = e;
			od = nd;
			found = true;
		}
	  }
	  if(found) {
		  $.keynav.setActive(closest, true);
	  } else if (direction == 'goUp') {
	   $.keynav.setActive($('.back:visible').get(0), true);
	  }
    //console.warn('keynav', 'closest', closest);
  }
  $.keynav.goLeft = function () {
	  var cur = $.keynav.getCurrent();
	  
    if ($(cur).hasClass(cur.verticalClass) == false) {
  	  var prev = $(cur).prevAll('.' + cur.offClass + ':first');
  	  //console.log('keynav', 'goLeft', $(cur), prev);
  	  if (prev.length > 0) {
  	   $.keynav.setActive(prev.get(0), true);
  	   return;
  	  }
  	  //vertical
  	  var container = $(cur).prevAll('.tv-container-vertical:first');
  	  var prev = container.find('.' + cur.verticalClass + '-selected:first');
  	  //console.log('keynav', 'goLeft', 'vertical', $(cur), prev);
  	  if (prev.length > 0) {
        $.keynav.setActive(prev.get(0), true);
  	    return;
  	  }
    } else {
      //autre menu ?
      var parent = $(cur).parents('.tv-container-vertical:first');
      var container = parent.prevAll('.tv-container-vertical:first');
  	  var prev = container.find('.' + cur.verticalClass + '-selected:first');
  	  if (prev.length > 0) {
        $.keynav.setActive(prev.get(0), true);
  	    return;

      //exit menu
  	  } else {
        var parent = $(cur).parents('.tv-container-vertical:first');
  	    var prev = parent.prevAll('.' + cur.offClass + ':first');
    	  if (prev.length > 0) {
    	   $.keynav.setActive(prev.get(0), true);
    	   return;
    	  }
  	  }
    }

	  var quad = $.keynav.quad(cur,function (dx,dy) { 
										if((dy >= 0) && (Math.abs(dx) - dy) <= 0)
											return true;	
										else
											return false;
								   });
	  $.keynav.activateClosest(cur,quad);
  }
  $.keynav.goRight = function () {
	  var cur = $.keynav.getCurrent();
	  
    if ($(cur).hasClass(cur.verticalClass) == false) {
  	  var next = $(cur).nextAll('.' + cur.offClass + ':first');
  	  //console.log('keynav', 'goRight', $(cur), next, '.' + cur.verticalClass + '-selected:first');
  	  if (next.length > 0) {
  	   $.keynav.setActive(next.get(0), true);
  	   return;
  	  }

  	  //vertical
  	  var container = $(cur).nextAll('.tv-container-vertical:first');
  	  var next = container.find('.' + cur.verticalClass + '-selected:first');
  	  //console.log('keynav', 'goLeft', 'vertical', $(cur), next);
  	  if (next.length > 0) {
        $.keynav.setActive(next.get(0), true);
  	    return;
  	  }
    } else {
      //autre menu ?
      var parent = $(cur).parents('.tv-container-vertical:first');
      var container = parent.nextAll('.tv-container-vertical:first');
  	  var next = container.find('.' + cur.verticalClass + '-selected:first');
  	  if (next.length > 0) {
        $.keynav.setActive(next.get(0), true);
  	    return;
  	  }
    }

	  var quad = $.keynav.quad(cur,function (dx,dy) { 
										if((dy <= 0) && (Math.abs(dx) + dy) <= 0)
											return true;	
										else
											return false;
								   });
	  $.keynav.activateClosest(cur,quad);
  }

  $.keynav.goUp = function () {
	  var cur = $.keynav.getCurrent();
	  
    if ($(cur).hasClass(cur.verticalClass)) {
	    //console.log('keynav', 'goUp', 'vertical', $(cur).prevAll('.' + cur.verticalClass + ':first'));
  	  var prev = $(cur).prevAll('.' + cur.verticalClass + ':first');
  	  if (prev.length > 0) {
  	   $.keynav.setActive(prev.get(0), true);
  	   return;
  	  }
    } /*else {
	    var prev = $(cur).parents('.tv-container:first').prevAll('.tv-container:first').find('.' + cur.offClass)
	    console.log('keynav', 'goUp', 'parents', $(cur).parents('.tv-container:first'));
  	  if (prev.length > 0) {
  	   $.keynav.setActive(prev.get(0), true);
  	   return;
  	  }
	  }*/

	  var quad = $.keynav.quad(cur,function (dx,dy) { 
										if((dx >= 0) && (Math.abs(dy) - dx) <= 0)
											return true;	
										else
											return false;
								   });
	  $.keynav.activateClosest(cur,quad,'goUp');
  }

  $.keynav.goDown = function () {
	  var cur = $.keynav.getCurrent();

    if ($(cur).hasClass(cur.verticalClass)) {
	    //console.log('keynav', 'goDown', 'vertical', $(cur).nextAll('.' + cur.verticalClass +':first'), '.' + cur.verticalClass +':first');
  	  var next = $(cur).nextAll('.' + cur.verticalClass +':first');
  	  if (next.length > 0) {
  	   $.keynav.setActive(next.get(0), true);
  	   return;
  	  }
    }

	  var quad = $.keynav.quad(cur,function (dx,dy) { 
										if((dx <= 0) && (Math.abs(dy) + dx) <= 0)
											return true;	
										else
											return false;
								   });
	  $.keynav.activateClosest(cur,quad,'goDown');
  }

  $.keynav.activate = function () {
	  var kn = $.keynav;
	  //$(kn.currentEl).trigger('click');
	  console.log('keynav', 'activate', kn.currentEl);
	  //$(kn.currentEl).click();
  }

  /**
   * This function was taken from Stefan's exellent interface plugin
   * http://www.eyecon.ro/interface/
   * 
   * I included it in this library's namespace because the functions aren't
   * quite the same.
   */
  $.keynav.getPos = function (e)
  {
    var l = 0;
    var t  = 0;
    var w = $.intval($.css(e,'width'));
    var h = $.intval($.css(e,'height'));
    while (e.offsetParent){
        l += e.offsetLeft + (e.currentStyle?$.intval(e.currentStyle.borderLeftWidth):0);
        t += e.offsetTop  + (e.currentStyle?$.intval(e.currentStyle.borderTopWidth):0);
        e = e.offsetParent;
    }
    l += e.offsetLeft + (e.currentStyle?$.intval(e.currentStyle.borderLeftWidth):0);
    t += e.offsetTop  + (e.currentStyle?$.intval(e.currentStyle.borderTopWidth):0);
	var cx = Math.round(t+(h/2));
	var cy = Math.round(l+(w/2));
    return {x:l, y:t, w:w, h:h, cx:cx, cy:cy};
  };

  /**
   * This function was taken from Stefan's exellent interface plugin
   * http://www.eyecon.ro/interface/
   */
  $.intval = function (v)
  {
    v = parseInt(v);
    return isNaN(v) ? 0 : v;
  };

