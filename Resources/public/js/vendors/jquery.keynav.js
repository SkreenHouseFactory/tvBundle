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
       console.warn(['keynav', 'onmouseover', e]);
	     $.keynav.setActive(this);
      } else {
       console.warn(['keynav', 'onmouseover', e, 'skiped']);
      }
	  };
	  kn.el.push(e);
  }
  $.keynav.setActive = function(e, fromKeyb) {
    //console.warn(['keynav', 'setActive', e, fromKeyb]);
	  var kn = $.keynav;
	  var cur = $.keynav.getCurrent();
	  $(cur).trigger('blur');
	  for(var i=0;i<kn.el.length;i++) {
		  var tmp = kn.el[i];
      $(tmp).removeClass(tmp.onClass).addClass(tmp.offClass);
	  }
    $(e).removeClass(e.offClass).addClass(e.onClass);
	  $(e).trigger('focus');
	  if (fromKeyb) $(e).trigger('keynav:focus');

    //vertical
    if ($(e).hasClass(cur.verticalClass)) {
      //console.log('keynav', 'verticalClass', $(e).parents('.tv-container-vertical:first').find('.' + e.verticalClass));
      $(e).parents('.tv-container-vertical:first').find('.' + e.verticalClass).show();
    } else {
      //console.log('keynav', 'no verticalClass', $('.' + e.verticalClass + ':not(.' + e.verticalClass + '-selected)'));
      $('.' + e.verticalClass + ':not(.' + e.verticalClass + '-selected)').hide();
    }

	  kn.currentEl = e;
  }
  $.keynav.getCurrent = function () {
    //console.warn(['keynav', 'getCurrent', $.keynav.currentEl]);
	  var kn = $.keynav;
	  if(kn.currentEl) {
		  var cur = kn.currentEl;
	  }
	  else {
		  var cur = kn.el[0];
	  }
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
  $.keynav.activateClosest = function(cur,quad) {
	  var closest;
	  var od = 1000000;
	  var nd = 0;
	  var found = false;
	  for(i=0;i<quad.length;i++) {
		var e = quad[i];
		nd = Math.sqrt(Math.pow(cur.pos.cx-e.pos.cx,2)+Math.pow(cur.pos.cy-e.pos.cy,2));
		if(nd < od) {
			closest = e;
			od = nd;
			found = true;
		}
	  }
	  if(found)
		$.keynav.setActive(closest, true);
    //console.warn('keynav', 'closest', closest);
  }
  $.keynav.goLeft = function () {
	  var cur = $.keynav.getCurrent();
	  
    if ($(cur).hasClass(cur.verticalClass) == false) {
  	  var prev = $(cur).prev('.' + cur.offClass);
  	  //console.log('keynav', 'goLeft', $(cur), prev);
  	  if (prev.length > 0) {
  	   $.keynav.setActive(prev.get(0), true);
  	   return;
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
  	  var next = $(cur).next('.' + cur.offClass);
  	  //console.log('keynav', 'goRight', $(cur), next);
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
	    //console.log('keynav', 'goUp', 'vertical', $(cur).prev('.' + cur.offClass));
  	  var prev = $(cur).prev('.' + cur.offClass);
  	  if (prev.length > 0) {
  	   $.keynav.setActive(prev.get(0), true);
  	   return;
  	  }
    }

	  var quad = $.keynav.quad(cur,function (dx,dy) { 
										if((dx >= 0) && (Math.abs(dy) - dx) <= 0)
											return true;	
										else
											return false;
								   });
	  $.keynav.activateClosest(cur,quad);
  }

  $.keynav.goDown = function () {
	  var cur = $.keynav.getCurrent();

    if ($(cur).hasClass(cur.verticalClass)) {
	    //console.log('keynav', 'goDown', 'vertical', $(cur).next('.' + cur.offClass));
  	  var next = $(cur).next('.' + cur.offClass);
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
	  $.keynav.activateClosest(cur,quad);
  }

  $.keynav.activate = function () {
	  var kn = $.keynav;
	  //$(kn.currentEl).trigger('click');
	  console.log('keynav', 'activate', kn.currentEl);
	  $(kn.currentEl).click();
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

