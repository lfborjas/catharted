$(document).ready(function() {


  //  Array.indexOf throws errors in versions of IE8. Sorry.
    if (!Array.indexOf) {
      Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0); i < this.length; i++) {
          if (this[i] == obj) {
            return i;
          }
        }
      };
    }


  $.navi  = {
    eventClass: '.keynav',
    focusClass: '.withfocus',
    //  CACHE INDICES
    last: 0,
    crnt: 0,
    //  REF CURRENTLY VISIBLE LIST ITEMS
    visibles:  function () {
      return jQuery.makeArray($( $.navi.eventClass + ':visible'));
    },
    reset: function () {
      $.navi.last = 0;
      $.navi.crnt = 0;

      $($.navi.eventClass)
        .removeClass($.navi.focusClass.substr(1, $.navi.focusClass.length));
      $('html,body')
        .scrollTop('0');
    },
    //  ADAPTED AND REFACTORED FROM http://www.eyecon.ro/interface/
    getPos: function (_element)  {
      var l = 0, t  = 0, w = $.navi.pInt($.css(_element,'width')), h = $.navi.pInt($.css(_element,'height'));

      while (_element.offsetParent){
          l += _element.offsetLeft + (_element.currentStyle ? $.navi.pInt(_element.currentStyle.borderLeftWidth):0);
          t += _element.offsetTop  + (_element.currentStyle ? $.navi.pInt(_element.currentStyle.borderTopWidth):0);
          _element = _element.offsetParent;
      }

      l += _element.offsetLeft + (_element.currentStyle ? $.navi.pInt(_element.currentStyle.borderLeftWidth):0);
      t += _element.offsetTop  + (_element.currentStyle ? $.navi.pInt(_element.currentStyle.borderTopWidth):0);

      var cx = Math.round(t+(h/2)), cy = Math.round(l+(w/2));

      return {x:l, y:t, w:w, h:h, cx:cx, cy:cy};
    },
    //  ADAPTED FROM http://www.eyecon.ro/interface/
    pInt: function (v) {
      v = parseInt(v, 10);
      return isNaN(v) ? 0 : v;
    },
    //  ADAPTED AND REFACTORED FROM jquery.keynav.js
    getClosest: function(_current,_quad) {
      var closest, od = 1000000, nd = 0, found = false;

      for(i=0;i<_quad.length;i++) {
        var _element  = _quad[i];
        nd = Math.sqrt(Math.pow(_current.pos.cx-_element.pos.cx,2)+Math.pow(_current.pos.cy-_element.pos.cy,2));


        if(nd < od) {
          closest = _element;
          od      = nd;
          found   = true;
        }
      }

      return closest;
    },
    //  ADAPTED AND REFACTORED FROM jquery.keynav.js
    quad: function(_current, fQuad) {

      var $visibles = $.navi.visibles(),
          _visible  = '',
          quad      = [];

      for( var i = 0, _len  = $visibles.length; i <  _len; i++ ) {
        _visible = $visibles[i];

        if(_current == _visible) {
          continue;
        }

        _current.pos  = $.navi.getPos(_current);
        _visible.pos  = $.navi.getPos(_visible);


        if(  fQuad( (_current.pos.cx - _visible.pos.cx),(_current.pos.cy - _visible.pos.cy)) ) {
          quad.push(_visible);
        }
      }
      return quad;
    }
  };


    //  FOCUS ON THE INPUT SEARCH FIELD WILL RESET THE $.navi CACHE INDICES
    $($.navi.eventClass + ':first')
      .bind('focus', function () {
        $.navi.reset();
      });

    //  LET'S JQUERY MANAGE THE VISUAL STATE OF AN ELEMENT WITH FOCUS
    $('li' + $.navi.eventClass)
      .bind('focus', function () {
        $(this).addClass($.navi.focusClass.substr(1, $.navi.focusClass.length));
      });

    $(document)
      .bind('keydown', function(event) {

      //  A BIT HACKISH, BUT LIMITS THE KEYS WE CARE ABOUT
      // Remove left and right for now 37, 39
      var _keyIndex = [ 38, 40].indexOf(event.keyCode);

      if ( _keyIndex == -1 || _keyIndex == null ) {
        return true;
      }

      //  PREVENT BROWSER FOR MOVING DOWN THE PAGE
      event.preventDefault();

      //  AQUIRE CURRENT VISIBLE LIST ITEMS
      var $visibles = $.navi.visibles();

      //  SET UP SOME PRIVATE PARTS
      var _quadFn   = null,
          _dir      = null,
          _key      = event.keyCode,
          _crnt     = $.navi.crnt,//$visibles.indexOf( event.originalTarget ),
          _next     = 0;

      //  A FEW MORE PRIVATE PARTS
      var _triggerQuad,
          _triggerElement,
          _triggerIndex,
          _targetScrollTop;


      //  _quadFn = fn() DEFINITIONS FROM jquery.keynav.js
      switch(_key) {
       
        case 38:

          if ( event.shiftKey ) {
            $($.navi.eventClass + ':first')
              .trigger('focus');

            return;
          }

          //  UP
          _quadFn = function (dx,dy) {
                      if((dx >= 0) && (Math.abs(dy) - dx) <= 0) {
                        return true;
                      } else {
                        return false;
                      }
                    };

          _dir    = 'up';
          break;
        case 40:
          //  DOWN
          _quadFn = function (dx,dy) {
                      if((dx <= 0) && (Math.abs(dy) + dx) <= 0) {
                        return true;
                      } else {
                        return false;
                      }
                    };

          _dir    = 'down';
          break;
        default:
        // do nothing
          break;
      }

      $($.navi.eventClass)
        .removeClass($.navi.focusClass.substr(1, $.navi.focusClass.length));

      //  IF THE EVENT HAS AN ASSOCIATED _quadFn
      if ( _quadFn ) {
        _triggerQuad      = $.navi.quad( $visibles[$.navi.crnt],  _quadFn);
        _triggerElement   = $.navi.getClosest($visibles[$.navi.crnt], _triggerQuad),
        _triggerIndex     = $visibles.indexOf(_triggerElement);
      }

      //  FORCE CHANGE FOR INDEX -1
      if ( _triggerIndex < 0 ) {
        _triggerIndex = 0;
      }

      //  STUPID OVERRIDE FOR FIRST ELEMENT BEING "MISSED" ... ONLY SOMETIMES.
      if ( _crnt == 0 ) {
        _triggerIndex = 1;
      }

      //  PULL THE TRIGGER
      $($visibles[_crnt]).trigger('blur');
      $($visibles[_triggerIndex]).trigger('focus');

      //  STORE THE LAST AND CURRENT INDICES
      $.navi.last = $.navi.crnt;
      $.navi.crnt = _triggerIndex;


      //  KEEP CURRENT FOCUSED ELEMENT IN VIEWPORT
      //  CONCEPT CONTRIBUTED BY BOAZ SENDER
      if ( [ 'up', 'down' ].indexOf(_dir) >= 0 && _triggerIndex > 0 ) {
        var currentHeight = $($visibles[$.navi.crnt]).outerHeight(), offset = $($visibles[$.navi.crnt]).offset();
        _targetScrollTop  = Math.round( offset.top - currentHeight - ($(window).height()/3) );
        //$('html,body').animate({ scrollTop: _targetScrollTop }, 100);
        $('html,body').scrollTop(_targetScrollTop);
      }
    });

});
