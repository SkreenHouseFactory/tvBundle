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

$.fn.keynav = function (componentClass,containerClass) {

  //Initialization
  var kn = $.keynav;
  if(!kn.init) {
	  kn.onClass = componentClass + '-focused';
	  kn.offClass = componentClass;
	  kn.verticalClass = componentClass + '-vertical';
	  kn.containerClass = containerClass;
	  kn.init = true;
  }
}

$.keynav.setActive = function(e, fromKeyb) {
  console.warn(['keynav', 'setActive', e, fromKeyb]);
  var kn = $.keynav;
  var cur = $.keynav.currentEl;
  
  e.addClass(kn.onClass);

  //specific
  if (typeof cur != 'undefined') {
   cur.removeClass(kn.onClass);
   if (cur.hasClass('tv-input')) {
    cur.trigger('blur');
   }
  }
  if (e.hasClass('tv-input')) {
	  e.trigger('focus');
	  if (fromKeyb) e.trigger('keynav:focus');
  }

  //vertical
  if (e.hasClass(kn.verticalClass)) {
    //console.log('keynav', 'verticalClass', e.parents('.tv-container-vertical:first').find('.' + e.verticalClass));
    e.parents('.' + kn.containerClass + '-vertical:first').find('.' + kn.verticalClass).show();
  } else {
    //console.log('keynav', 'no verticalClass', $('.' + e.verticalClass + ':not(.' + e.verticalClass + '-selected)'));
    $('.' + kn.verticalClass + ':not(.' + kn.verticalClass + '-selected)').hide();
  }

  kn.currentEl = e;
  console.warn(['keynav', 'focused', kn.currentEl]);
}
$.keynav.grid = function(cur,direction,loop) {
  console.log('keynav', 'grid', cur, direction);
  var kn = $.keynav;
  if (direction == 'goUp' || direction == 'goLeft') {
    var prev = cur.prevAll('.' + kn.offClass + ':first:visible');
    if (prev.length > 0 && (direction != 'goUp' || prev.hasClass(kn.verticalClass))) {
      return $.keynav.setActive(prev, true);
    } else {
      var parent = cur.parents('.' + kn.containerClass + ':first:visible');
      if (parent.prevAll('.' + kn.containerClass + ':first:visible').length > 0) {
        console.log('keynav', 'grid', 'parent.prevAll', direction, parent, parent.prevAll('.' + kn.containerClass + ':first:visible'));
        return $.keynav.grid(parent.prevAll('.' + kn.containerClass + ':first:visible'), direction, true);
      }
    }
  }
  if (direction == 'goDown' || direction == 'goRight') {
    var next = cur.nextAll('.' + kn.offClass + ':first:visible');
    if (next.length > 0 && (direction != 'goDown' || next.hasClass(kn.verticalClass))) {
      console.log('keynav', 'grid', 'nextAll', next, '.' + kn.offClass + ':first:visible');
      return $.keynav.setActive(next, true);
    } else {
      var parent = cur.parents('.' + kn.containerClass + ':first:visible');
      console.log('keynav', 'grid', 'parent.nextAll', direction, parent, parent.nextAll('.' + kn.containerClass + ':first:visible'));
      if (parent.nextAll('.' + kn.containerClass + ':first:visible').length > 0) {
        return $.keynav.grid(parent.nextAll('.' + kn.containerClass + ':first:visible'), direction, true);
      }
    }
  }

  var child = $('.' + kn.offClass + ':first:visible', cur);
  if (child.length > 0) {
    console.log('keynav', 'grid', 'child', direction, child);
    return $.keynav.setActive(child, true);
  } else {
    var parent = parent.parents('.' + kn.containerClass + ':first:visible');
    console.log('keynav', 'grid', 'parent.parents', direction, parent);
    if (parent.length > 0)  {
      return $.keynav.grid(parent, direction, true);
    }
  }

}
$.keynav.goLeft = function () {
  var cur = $.keynav.currentEl;
  
  $.keynav.grid(cur, 'goLeft');
  
}
$.keynav.goRight = function () {
  console.log('goRight');
  var cur = $.keynav.currentEl;
  
  $.keynav.grid(cur, 'goRight');
}

$.keynav.goUp = function () {
  var cur = $.keynav.currentEl;
  
  $.keynav.grid(cur, 'goUp');
}

$.keynav.goDown = function () {
  var cur = $.keynav.currentEl;
  
  $.keynav.grid(cur, 'goDown');
}