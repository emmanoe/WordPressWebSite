(function ($) {
  'use strict';
  
  // Defaults
  $.minicolors = {
    defaults: {
      animationSpeed: 50,
      animationEasing: 'swing',
      change: null,
      changeDelay: 0,
      control: 'hue',
      defaultValue: '',
      format: 'hex',
      hide: null,
      hideSpeed: 100,
      inline: false,
      keywords: '',
      letterCase: 'lowercase',
      opacity: false,
      position: 'bottom',
      show: null,
      showSpeed: 100,
      theme: 'default',
      swatches: []
    }
  };

  // Public methods
  $.extend($.fn, {
    minicolors: function(method, data) {

      switch(method) {
      // Destroy the control
      case 'destroy':
        $(this).each(function() {
          destroy($(this));
        });
        return $(this);

      // Hide the color picker
      case 'hide':
        hide();
        return $(this);

      // Get/set opacity
      case 'opacity':
        // Getter
        if(data === undefined) {
          // Getter
          return $(this).attr('data-opacity');
        } else {
          // Setter
          $(this).each(function() {
            updateFromInput($(this).attr('data-opacity', data));
          });
        }
        return $(this);

      // Get an RGB(A) object based on the current color/opacity
      case 'rgbObject':
        return rgbObject($(this), method === 'rgbaObject');

      // Get an RGB(A) string based on the current color/opacity
      case 'rgbString':
      case 'rgbaString':
        return rgbString($(this), method === 'rgbaString');

      // Get/set settings on the fly
      case 'settings':
        if(data === undefined) {
          return $(this).data('minicolors-settings');
        } else {
          // Setter
          $(this).each(function() {
            var settings = $(this).data('minicolors-settings') || {};
            destroy($(this));
            $(this).minicolors($.extend(true, settings, data));
          });
        }
        return $(this);

      // Show the color picker
      case 'show':
        show($(this).eq(0));
        return $(this);

      // Get/set the hex color value
      case 'value':
        if(data === undefined) {
          // Getter
          return $(this).val();
        } else {
          // Setter
          $(this).each(function() {
            if(typeof(data) === 'object' && data !== null) {
              if(data.opacity !== undefined) {
                $(this).attr('data-opacity', keepWithin(data.opacity, 0, 1));
              }
              if(data.color) {
                $(this).val(data.color);
              }
            } else {
              $(this).val(data);
            }
            updateFromInput($(this));
          });
        }
        return $(this);

      // Initializes the control
      default:
        if(method !== 'create') data = method;
        $(this).each(function() {
          init($(this), data);
        });
        return $(this);

      }

    }
  });

  // Initialize input elements
  function init(input, settings) {
        var minicolors = $('<div class="minicolors" />'),
            defaults = $.minicolors.defaults,
            name,
            size,
            swatches,
            swatch,
            swatchString,
            panel,
            i;

        // Do nothing if already initialized
        if(input.data('minicolors-initialized')) return;

        // Handle settings
        settings = $.extend(true, {}, defaults, settings);
        // The wrapper
        minicolors
          .addClass('minicolors-theme-' + settings.theme)
          .toggleClass('minicolors-with-opacity', settings.opacity);

        // Custom positioning
        if(settings.position !== undefined) {
          $.each(settings.position.split(' '), function() {
            minicolors.addClass('minicolors-position-' + this);
          });
        }

        // Input size
        if(settings.format === 'rgb') {
          size = settings.opacity ? '25' : '20';
        } else {
          size = settings.keywords ? '11' : '7';
        }

        // The input
        input
          .addClass('minicolors-input')
           .data('minicolors-initialized', false)
            .data('minicolors-settings', settings)
          .prop('size', size)
          .attr('autocomplete', 'off')
          .wrap(minicolors)
          .after(
            '<div class="minicolors-panel minicolors-slider-' + settings.control + '">' +
          '<div class="minicolors-slider minicolors-sprite">' +
          '<div class="minicolors-picker"></div>' +
          '</div>' +
          '<div class="minicolors-opacity-slider minicolors-sprite">' +
          '<div class="minicolors-picker"></div>' +
          '</div>' +
          '<div class="minicolors-grid minicolors-sprite">' +
          '<div class="minicolors-grid-inner"></div>' +
          '<div class="minicolors-picker"><div></div></div>' +
          '</div>' +
          '</div>'
          );

        // The swatch
        if(!settings.inline) {
            input.after('<span class="minicolors-swatch minicolors-sprite minicolors-input-swatch"><span class="minicolors-swatch-color tf_abs"></span></span>');
        }
        input.on('focus.minicolors blur.minicolors keydown.minicolors keyup.minicolors paste.minicolors',function(event){
            var type = event.type;
            if(type==='focus'){
                show(input);
            }
            else if(type==='blur'){

                var settings = input.data('minicolors-settings');
                var keywords;
                var hex;
                var rgba;
                var swatchOpacity;
                var value;

                if(!input.data('minicolors-initialized')) return;

                // Get array of lowercase keywords
                keywords = !settings.keywords ? [] : $.map(settings.keywords.split(','), function(a) {
                  return $.trim(a.toLowerCase());
                });

                // Set color string
                if(input.val() !== '' && $.inArray(input.val().toLowerCase(), keywords) > -1) {
                  value = input.val();
                } else {
                  // Get RGBA values for easy conversion
                  if(isRgb(input.val())) {
                    rgba = parseRgb(input.val(), true);
                  } else {
                    hex = parseHex(input.val(), true);
                    rgba = hex ? hex2rgb(hex) : null;
                  }

                  // Convert to format
                  if(rgba === null) {
                    value = settings.defaultValue;
                  } else if(settings.format === 'rgb') {
                    value = settings.opacity ?
                      parseRgb('rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + input.attr('data-opacity') + ')') :
                      parseRgb('rgb(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ')');
                  } else {
                    value = rgb2hex(rgba);
                  }
                }

                // Update swatch opacity
                swatchOpacity = settings.opacity ? input.attr('data-opacity') : 1;
                if(value.toLowerCase() === 'transparent') swatchOpacity = 0;
                input
                  .closest('.minicolors')
                  .find('.minicolors-input-swatch > span')
                  .css('opacity', swatchOpacity);

                // Set input value
                input.val(value);

                // Is it blank?
                if(input.val() === '') input.val(parseInput(settings.defaultValue, true));

                // Adjust case
                input.val(convertCase(input.val(), settings.letterCase));

            }
            else if(type==='keydown'){
                switch(event.which) {
                    case 9: // tab
                      hide();
                      break;
                    case 13: // enter
                    case 27: // esc
                      hide();
                      input.blur();
                      break;
                }
            }
            else if(type==='keyup' || type==='paste'){
                if(type==='keyup'){
                     updateFromInput(input, true);
                }
                else{
                    setTimeout(function() {
                      updateFromInput(input, true);
                    }, 1);
                }
            }
        })
        .closest('.minicolors').on('mousedown.minicolors touchstart.minicolors', '.minicolors-grid, .minicolors-slider, .minicolors-opacity-slider', function(event) {
            if(event.which===1){
                event.preventDefault();
                var target = $(this),
                    d = document.body.contains(this)?document:top.document;

                move(target, event, true);
                $(d).on('mousemove.minicolors touchmove.minicolors', function(event) {
                        move(target, event);
                  })
                  // Stop moving
                .one('mouseup.minicolors touchend.minicolors', function() {
                    $(d).off('mousemove.minicolors touchmove.minicolors');
                });
            }
        })
        .on('click.minicolors','.minicolors-swatches li',function(event){
                event.preventDefault();
                var target = $(this), input = target.parents('.minicolors').find('.minicolors-input'), color = target.data('swatch-color');
                updateInput(input, color, getAlpha(color));
                updateFromInput(input);
        })
        .find('.minicolors-input-swatch').on('click mousedown.minicolors touchstart.minicolors', function(event) {
            if(event.type==='click'){
                if(!settings.inline){
                    input.focus();
                }
            }
            else if(event.which===1){
                show(input);
            }
            else{
                return;
            }
            event.preventDefault();
        });
        
    // Prevent text selection in IE
    panel = input.parent().find('.minicolors-panel');
    panel.on('selectstart', function() { return false; }).end();

    // Swatches
    if(settings.swatches && settings.swatches.length !== 0) {
      panel.addClass('minicolors-with-swatches');
      swatches = $('<ul class="minicolors-swatches tf_scrollbar"></ul>')
        .appendTo(panel);
      for(i = 0; i < settings.swatches.length; ++i) {
        // allow for custom objects as swatches
        if($.type(settings.swatches[i]) === 'object') {
          name = settings.swatches[i].name;
          swatch = settings.swatches[i].color;
        } else {
          name = '';
          swatch = settings.swatches[i];
        }
        swatchString = swatch;
        swatch = isRgb(swatch) ? parseRgb(swatch, true) : hex2rgb(parseHex(swatch, true));
        $('<li class="minicolors-swatch minicolors-sprite"><span class="minicolors-swatch-color tf_abs" title="' + name + '"></span></li>')
          .appendTo(swatches)
          .data('swatch-color', swatchString)
          .find('.minicolors-swatch-color')
          .css({
            backgroundColor: rgb2hex(swatch),
            opacity: swatch.a
          });
        settings.swatches[i] = swatch;
      }
    }

    // Inline controls
    if(settings.inline) input.parent().addClass('minicolors-inline');

    updateFromInput(input, false);

    input.data('minicolors-initialized', true);
  }

  // Returns the input back to its original state
  function destroy(input) {
    var minicolors = input.parent();

    // Revert the input element
    input
      .removeData('minicolors-initialized')
      .removeData('minicolors-settings')
      .removeProp('size')
      .removeClass('minicolors-input');

    // Remove the wrap and destroy whatever remains
    minicolors.before(input).remove();
  }

  // Shows the specified dropdown panel
  function show(input) {
    var minicolors = input.parent(),
        panel = minicolors.find('.minicolors-panel'),
        settings = input.data('minicolors-settings'),
        d = document.body.contains(input[0])?document:top.document;

    // Do nothing if uninitialized, disabled, inline, or already open
    if(
      !input.data('minicolors-initialized') ||
      input.prop('disabled') ||
      minicolors.hasClass('minicolors-inline') ||
      minicolors.hasClass('minicolors-focus')
    ) return;

    hide(window.top.document);

    minicolors.addClass('minicolors-focus');
    if (panel.animate) {
      panel
        .stop(true, true)
        .fadeIn(settings.showSpeed, function () {
          if (settings.show) settings.show.call(input.get(0));
        });
    } else {
      panel.show();
      if (settings.show) settings.show.call(input.get(0));
    }
    $(d).on('mousedown.minicolors touchstart.minicolors', function(event) {
        if(event.which===1 && $(event.target).closest('.minicolors,.minicolors_wrapper').length===0) {
            $(this).off('mousemove.minicolors touchmove.minicolors mousedown.minicolors touchstart.minicolors mouseup.minicolors touchend.minicolors');
            hide(this);
            d=null;
        }
    });
  }

  // Hides all dropdown panels
  function hide(doc) {
    $('.minicolors-focus',doc).each(function() {
      var minicolors = $(this);
      var input = minicolors.find('.minicolors-input');
      var panel = minicolors.find('.minicolors-panel');
      var settings = input.data('minicolors-settings');

      if (panel.animate) {
        panel.fadeOut(settings.hideSpeed, function () {
          if (settings.hide) settings.hide.call(input.get(0));
          minicolors.removeClass('minicolors-focus');
        });
      } else {
        panel.hide();
        if (settings.hide) settings.hide.call(input.get(0));
        minicolors.removeClass('minicolors-focus');
      }
    });
  }

  // Moves the selected picker
  function move(target, event, animate) {
    var input = target.parents('.minicolors').find('.minicolors-input'),
        settings = input.data('minicolors-settings'),
        picker = target.find('[class$=-picker]'),
        offsetX = target.offset().left,
        offsetY = target.offset().top,
        x = Math.round(event.pageX - offsetX),
        y = Math.round(event.pageY - offsetY),
        duration = animate ? settings.animationSpeed : 0,
        wx, wy, r, phi, styles;

    // Touch support
    if(event.originalEvent.changedTouches) {
      x = event.originalEvent.changedTouches[0].pageX - offsetX;
      y = event.originalEvent.changedTouches[0].pageY - offsetY;
    }

    // Constrain picker to its container
    if(x < 0) x = 0;
    if(y < 0) y = 0;
    if(x > target.width()) x = target.width();
    if(y > target.height()) y = target.height();

    // Constrain color wheel values to the wheel
    if(target.parent().is('.minicolors-slider-wheel') && picker.parent().is('.minicolors-grid')) {
      wx = 75 - x;
      wy = 75 - y;
      r = Math.sqrt(wx * wx + wy * wy);
      phi = Math.atan2(wy, wx);
      if(phi < 0) phi += Math.PI * 2;
      if(r > 75) {
        r = 75;
        x = 75 - (75 * Math.cos(phi));
        y = 75 - (75 * Math.sin(phi));
      }
      x = Math.round(x);
      y = Math.round(y);
    }

    // Move the picker
    styles = {
      top: y + 'px'
    };
    if(target.is('.minicolors-grid')) {
      styles.left = x + 'px';
    }
    if (picker.animate) {
      picker
        .stop(true)
        .animate(styles, duration, settings.animationEasing, function() {
          updateFromControl(input, target);
        });
    } else {
      picker
        .css(styles);
      updateFromControl(input, target);
    }
  }

  // Sets the input based on the color picker values
  function updateFromControl(input, target) {

    function getCoords(picker, container) {
      var left, top;
      if(!picker.length || !container) return null;
      left = picker.offset().left;
      top = picker.offset().top;

      return {
        x: left - container.offset().left + (picker.outerWidth() / 2),
        y: top - container.offset().top + (picker.outerHeight() / 2)
      };
    }

    var hue, saturation, brightness, x, y, r, phi,
        hex = input.val(),
        opacity = input.attr('data-opacity'),

       // Helpful references
        minicolors = input.parent(),
        settings = input.data('minicolors-settings'),
        swatch = minicolors.find('.minicolors-input-swatch'),

       // Panel objects
        grid = minicolors.find('.minicolors-grid'),
        slider = minicolors.find('.minicolors-slider'),
        opacitySlider = minicolors.find('.minicolors-opacity-slider'),

       // Picker objects
        gridPicker = grid.find('[class$=-picker]'),
        sliderPicker = slider.find('[class$=-picker]'),
        opacityPicker = opacitySlider.find('[class$=-picker]'),

       // Picker positions
       gridPos = getCoords(gridPicker, grid),
       sliderPos = getCoords(sliderPicker, slider),
       opacityPos = getCoords(opacityPicker, opacitySlider);

    // Handle colors
    if(target.is('.minicolors-grid, .minicolors-slider, .minicolors-opacity-slider')) {

      // Determine HSB values
      switch(settings.control) {
      case 'wheel':
        // Calculate hue, saturation, and brightness
        x = (grid.width() / 2) - gridPos.x;
        y = (grid.height() / 2) - gridPos.y;
        r = Math.sqrt(x * x + y * y);
        phi = Math.atan2(y, x);
        if(phi < 0) phi += Math.PI * 2;
        if(r > 75) {
          r = 75;
          gridPos.x = 69 - (75 * Math.cos(phi));
          gridPos.y = 69 - (75 * Math.sin(phi));
        }
        saturation = keepWithin(r / 0.75, 0, 100);
        hue = keepWithin(phi * 180 / Math.PI, 0, 360);
        brightness = keepWithin(100 - Math.floor(sliderPos.y * (100 / slider.height())), 0, 100);
        hex = hsb2hex({
          h: hue,
          s: saturation,
          b: brightness
        });

        // Update UI
        slider.css('backgroundColor', hsb2hex({ h: hue, s: saturation, b: 100 }));
        break;

      case 'saturation':
        // Calculate hue, saturation, and brightness
        hue = keepWithin(parseInt(gridPos.x * (360 / grid.width()), 10), 0, 360);
        saturation = keepWithin(100 - Math.floor(sliderPos.y * (100 / slider.height())), 0, 100);
        brightness = keepWithin(100 - Math.floor(gridPos.y * (100 / grid.height())), 0, 100);
        hex = hsb2hex({
          h: hue,
          s: saturation,
          b: brightness
        });

        // Update UI
        slider.css('backgroundColor', hsb2hex({ h: hue, s: 100, b: brightness }));
        minicolors.find('.minicolors-grid-inner').css('opacity', saturation / 100);
        break;

      case 'brightness':
        // Calculate hue, saturation, and brightness
        hue = keepWithin(parseInt(gridPos.x * (360 / grid.width()), 10), 0, 360);
        saturation = keepWithin(100 - Math.floor(gridPos.y * (100 / grid.height())), 0, 100);
        brightness = keepWithin(100 - Math.floor(sliderPos.y * (100 / slider.height())), 0, 100);
        hex = hsb2hex({
          h: hue,
          s: saturation,
          b: brightness
        });

        // Update UI
        slider.css('backgroundColor', hsb2hex({ h: hue, s: saturation, b: 100 }));
        minicolors.find('.minicolors-grid-inner').css('opacity', 1 - (brightness / 100));
        break;

      default:
        // Calculate hue, saturation, and brightness
        hue = keepWithin(360 - parseInt(sliderPos.y * (360 / slider.height()), 10), 0, 360);
        saturation = keepWithin(Math.floor(gridPos.x * (100 / grid.width())), 0, 100);
        brightness = keepWithin(100 - Math.floor(gridPos.y * (100 / grid.height())), 0, 100);
        hex = hsb2hex({
          h: hue,
          s: saturation,
          b: brightness
        });

        // Update UI
        grid.css('backgroundColor', hsb2hex({ h: hue, s: 100, b: 100 }));
        break;
      }

      // Handle opacity
      if(settings.opacity) {
        opacity = parseFloat(1 - (opacityPos.y / opacitySlider.height())).toFixed(2);
      } else {
        opacity = 1;
      }

      updateInput(input, hex, opacity);
    }
    else {
      // Set swatch color
      swatch.find('span').css({
        backgroundColor: hex,
        opacity: opacity
      });

      // Handle change event
      doChange(input, hex, opacity);
    }
  }

  // Sets the value of the input and does the appropriate conversions
  // to respect settings, also updates the swatch
  function updateInput(input, value, opacity) {
    var rgb;

    // Helpful references
    var minicolors = input.parent(),
        settings = input.data('minicolors-settings'),
        swatch = minicolors.find('.minicolors-input-swatch');

    if(settings.opacity) input.attr('data-opacity', opacity);

    // Set color string
    if(settings.format === 'rgb') {
      // Returns RGB(A) string

      // Checks for input format and does the conversion
      if(isRgb(value)) {
        rgb = parseRgb(value, true);
      }
      else {
        rgb = hex2rgb(parseHex(value, true));
      }

      opacity = input.attr('data-opacity') === '' ? 1 : keepWithin(parseFloat(input.attr('data-opacity')).toFixed(2), 0, 1);
      if(isNaN(opacity) || !settings.opacity) opacity = 1;

      if(input.minicolors('rgbObject').a <= 1 && rgb && settings.opacity) {
        // Set RGBA string if alpha
        value = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + parseFloat(opacity) + ')';
      } else {
        // Set RGB string (alpha = 1)
        value = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
      }
    } else {
      // Returns hex color

      // Checks for input format and does the conversion
      if(isRgb(value)) {
        value = rgbString2hex(value);
      }

      value = convertCase(value, settings.letterCase);
    }

    // Update value from picker
    input.val(value);

    // Set swatch color
    swatch.find('span').css({
      backgroundColor: value,
      opacity: opacity
    });

    // Handle change event
    doChange(input, value, opacity);
  }

  // Sets the color picker values from the input
  function updateFromInput(input, preserveInputValue) {
    var hex, hsb, opacity, keywords, alpha, value, x, y, r, phi,
    // Helpful references
    minicolors = input.parent(),
    settings = input.data('minicolors-settings'),
    swatch = minicolors.find('.minicolors-input-swatch'),

   // Panel objects
    grid = minicolors.find('.minicolors-grid'),
    slider = minicolors.find('.minicolors-slider'),
    opacitySlider = minicolors.find('.minicolors-opacity-slider'),

   // Picker objects
    gridPicker = grid.find('[class$=-picker]'),
    sliderPicker = slider.find('[class$=-picker]'),
    opacityPicker = opacitySlider.find('[class$=-picker]');

    // Determine hex/HSB values
    if(isRgb(input.val())) {
      // If input value is a rgb(a) string, convert it to hex color and update opacity
      hex = rgbString2hex(input.val());
      alpha = keepWithin(parseFloat(getAlpha(input.val())).toFixed(2), 0, 1);
      if(alpha) {
        input.attr('data-opacity', alpha);
      }
    } else {
      hex = convertCase(parseHex(input.val(), true), settings.letterCase);
    }

    if(!hex){
      hex = convertCase(parseInput(settings.defaultValue, true), settings.letterCase);
    }
    hsb = hex2hsb(hex);

    // Get array of lowercase keywords
    keywords = !settings.keywords ? [] : $.map(settings.keywords.split(','), function(a) {
      return $.trim(a.toLowerCase());
    });

    // Set color string
    if(input.val() !== '' && $.inArray(input.val().toLowerCase(), keywords) > -1) {
      value = convertCase(input.val());
    } else {
      value = isRgb(input.val()) ? parseRgb(input.val()) : hex;
    }

    // Update input value
    if(!preserveInputValue) input.val(value);

    // Determine opacity value
    if(settings.opacity) {
      // Get from data-opacity attribute and keep within 0-1 range
      opacity = input.attr('data-opacity') === '' ? 1 : keepWithin(parseFloat(input.attr('data-opacity')).toFixed(2), 0, 1);
      if(isNaN(opacity)) opacity = 1;
      input.attr('data-opacity', opacity);
      swatch.find('span').css('opacity', opacity);

      // Set opacity picker position
      y = keepWithin(opacitySlider.height() - (opacitySlider.height() * opacity), 0, opacitySlider.height());
      opacityPicker.css('top', y + 'px');
    }

    // Set opacity to zero if input value is transparent
    if(input.val().toLowerCase() === 'transparent') {
      swatch.find('span').css('opacity', 0);
    }

    // Update swatch
    swatch.find('span').css('backgroundColor', hex);

    // Determine picker locations
    switch(settings.control) {
    case 'wheel':
      // Set grid position
      r = keepWithin(Math.ceil(hsb.s * 0.75), 0, grid.height() / 2);
      phi = hsb.h * Math.PI / 180;
      x = keepWithin(75 - Math.cos(phi) * r, 0, grid.width());
      y = keepWithin(75 - Math.sin(phi) * r, 0, grid.height());
      gridPicker.css({
        top: y + 'px',
        left: x + 'px'
      });

      // Set slider position
      y = 150 - (hsb.b / (100 / grid.height()));
      if(hex === '') y = 0;
      sliderPicker.css('top', y + 'px');

      // Update panel color
      slider.css('backgroundColor', hsb2hex({ h: hsb.h, s: hsb.s, b: 100 }));
      break;

    case 'saturation':
      // Set grid position
      x = keepWithin((5 * hsb.h) / 12, 0, 150);
      y = keepWithin(grid.height() - Math.ceil(hsb.b / (100 / grid.height())), 0, grid.height());
      gridPicker.css({
        top: y + 'px',
        left: x + 'px'
      });

      // Set slider position
      y = keepWithin(slider.height() - (hsb.s * (slider.height() / 100)), 0, slider.height());
      sliderPicker.css('top', y + 'px');

      // Update UI
      slider.css('backgroundColor', hsb2hex({ h: hsb.h, s: 100, b: hsb.b }));
      minicolors.find('.minicolors-grid-inner').css('opacity', hsb.s / 100);
      break;

    case 'brightness':
      // Set grid position
      x = keepWithin((5 * hsb.h) / 12, 0, 150);
      y = keepWithin(grid.height() - Math.ceil(hsb.s / (100 / grid.height())), 0, grid.height());
      gridPicker.css({
        top: y + 'px',
        left: x + 'px'
      });

      // Set slider position
      y = keepWithin(slider.height() - (hsb.b * (slider.height() / 100)), 0, slider.height());
      sliderPicker.css('top', y + 'px');

      // Update UI
      slider.css('backgroundColor', hsb2hex({ h: hsb.h, s: hsb.s, b: 100 }));
      minicolors.find('.minicolors-grid-inner').css('opacity', 1 - (hsb.b / 100));
      break;

    default:
      // Set grid position
      x = keepWithin(Math.ceil(hsb.s / (100 / grid.width())), 0, grid.width());
      y = keepWithin(grid.height() - Math.ceil(hsb.b / (100 / grid.height())), 0, grid.height());
      gridPicker.css({
        top: y + 'px',
        left: x + 'px'
      });

      // Set slider position
      y = keepWithin(slider.height() - (hsb.h / (360 / slider.height())), 0, slider.height());
      sliderPicker.css('top', y + 'px');

      // Update panel color
      grid.css('backgroundColor', hsb2hex({ h: hsb.h, s: 100, b: 100 }));
      break;
    }

    // Fire change event, but only if minicolors is fully initialized
    if(input.data('minicolors-initialized')) {
      doChange(input, value, opacity);
    }
  }

  // Runs the change and changeDelay callbacks
  function doChange(input, value, opacity) {
    var settings = input.data('minicolors-settings'),
        lastChange = input.data('minicolors-lastChange'),
        obj, sel, i;

    // Only run if it actually changed
    if(!lastChange || lastChange.value !== value || lastChange.opacity !== opacity) {

      // Remember last-changed value
      input.data('minicolors-lastChange', {
        value: value,
        opacity: opacity
      });

      // Check and select applicable swatch
      if(settings.swatches && settings.swatches.length !== 0) {
        if(!isRgb(value)) {
          obj = hex2rgb(value);
        }
        else {
          obj = parseRgb(value, true);
        }
        sel = -1;
        for(i = 0; i < settings.swatches.length; ++i) {
          if(obj.r === settings.swatches[i].r && obj.g === settings.swatches[i].g && obj.b === settings.swatches[i].b && obj.a === settings.swatches[i].a) {
            sel = i;
            break;
          }
        }

        input.parent().find('.minicolors-swatches .minicolors-swatch').removeClass('selected');
        if(sel !== -1) {
          input.parent().find('.minicolors-swatches .minicolors-swatch').eq(i).addClass('selected');
        }
      }

      // Fire change event
      if(settings.change) {
        if(settings.changeDelay) {
          // Call after a delay
          clearTimeout(input.data('minicolors-changeTimeout'));
          input.data('minicolors-changeTimeout', setTimeout(function() {
            settings.change.call(input.get(0), value, opacity);
          }, settings.changeDelay));
        } else {
          // Call immediately
          settings.change.call(input.get(0), value, opacity);
        }
      }
      input.trigger('change').trigger('input');
    }
  }

  // Generates an RGB(A) object based on the input's value
  function rgbObject(input) {
    var rgb,
      opacity = $(input).attr('data-opacity');
    if( isRgb($(input).val()) ) {
      rgb = parseRgb($(input).val(), true);
    } else {
      var hex = parseHex($(input).val(), true);
      rgb = hex2rgb(hex);
    }
    if( !rgb ) return null;
    if( opacity !== undefined ) $.extend(rgb, { a: parseFloat(opacity) });
    return rgb;
  }

  // Generates an RGB(A) string based on the input's value
  function rgbString(input, alpha) {
    var rgb,
      opacity = $(input).attr('data-opacity');
    if( isRgb($(input).val()) ) {
      rgb = parseRgb($(input).val(), true);
    } else {
      var hex = parseHex($(input).val(), true);
      rgb = hex2rgb(hex);
    }
    if( !rgb ) return null;
    if( opacity === undefined ) opacity = 1;
    if( alpha ) {
      return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + parseFloat(opacity) + ')';
    } else {
      return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
    }
  }

  // Converts to the letter case specified in settings
  function convertCase(string, letterCase) {
    return letterCase === 'uppercase' ? string.toUpperCase() : string.toLowerCase();
  }

  // Parses a string and returns a valid hex string when possible
  function parseHex(string, expand) {
    string = string.replace(/^#/g, '');
    if(!string.match(/^[A-F0-9]{3,6}/ig)) return '';
    if(string.length !== 3 && string.length !== 6) return '';
    if(string.length === 3 && expand) {
      string = string[0] + string[0] + string[1] + string[1] + string[2] + string[2];
    }
    return '#' + string;
  }

  // Parses a string and returns a valid RGB(A) string when possible
  function parseRgb(string, obj) {
    var values = string.replace(/[^\d,.]/g, ''),
        rgba = values.split(',');

    rgba[0] = keepWithin(parseInt(rgba[0], 10), 0, 255);
    rgba[1] = keepWithin(parseInt(rgba[1], 10), 0, 255);
    rgba[2] = keepWithin(parseInt(rgba[2], 10), 0, 255);
    if(rgba[3] !== undefined) {
      rgba[3] = keepWithin(parseFloat(rgba[3], 10), 0, 1);
    }

    // Return RGBA object
    if( obj ) {
      if (rgba[3] !== undefined) {
        return {
          r: rgba[0],
          g: rgba[1],
          b: rgba[2],
          a: rgba[3]
        };
      } else {
        return {
          r: rgba[0],
          g: rgba[1],
          b: rgba[2]
        };
      }
    }

    // Return RGBA string
    if(typeof(rgba[3]) !== 'undefined' && rgba[3] <= 1) {
      return 'rgba(' + rgba[0] + ', ' + rgba[1] + ', ' + rgba[2] + ', ' + rgba[3] + ')';
    } else {
      return 'rgb(' + rgba[0] + ', ' + rgba[1] + ', ' + rgba[2] + ')';
    }

  }

  // Parses a string and returns a valid color string when possible
  function parseInput(string, expand) {
    if(isRgb(string)) {
      // Returns a valid rgb(a) string
      return parseRgb(string);
    } else {
      return parseHex(string, expand);
    }
  }

  // Keeps value within min and max
  function keepWithin(value, min, max) {
    if(value < min) value = min;
    if(value > max) value = max;
    return value;
  }

  // Checks if a string is a valid RGB(A) string
  function isRgb(string) {
    var rgb = string.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? true : false;
  }

  // Function to get alpha from a RGB(A) string
  function getAlpha(rgba) {
    rgba = rgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+(\.\d{1,2})?|\.\d{1,2})[\s+]?/i);
    return (rgba && rgba.length === 6) ? rgba[4] : '1';
  }

  // Converts an HSB object to an RGB object
  function hsb2rgb(hsb) {
    var rgb = {},
        h = Math.round(hsb.h),
        s = Math.round(hsb.s * 255 / 100),
        v = Math.round(hsb.b * 255 / 100);
    if(s === 0) {
      rgb.r = rgb.g = rgb.b = v;
    } else {
      var t1 = v,
        t2 = (255 - s) * v / 255,
        t3 = (t1 - t2) * (h % 60) / 60;
      if(h === 360) h = 0;
      if(h < 60) { rgb.r = t1; rgb.b = t2; rgb.g = t2 + t3; }
      else if(h < 120) {rgb.g = t1; rgb.b = t2; rgb.r = t1 - t3; }
      else if(h < 180) {rgb.g = t1; rgb.r = t2; rgb.b = t2 + t3; }
      else if(h < 240) {rgb.b = t1; rgb.r = t2; rgb.g = t1 - t3; }
      else if(h < 300) {rgb.b = t1; rgb.g = t2; rgb.r = t2 + t3; }
      else if(h < 360) {rgb.r = t1; rgb.g = t2; rgb.b = t1 - t3; }
      else { rgb.r = 0; rgb.g = 0; rgb.b = 0; }
    }
    return {
      r: Math.round(rgb.r),
      g: Math.round(rgb.g),
      b: Math.round(rgb.b)
    };
  }

  // Converts an RGB string to a hex string
  function rgbString2hex(rgb){
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? '#' +
    ('0' + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ('0' + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ('0' + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
  }

  // Converts an RGB object to a hex string
  function rgb2hex(rgb) {
    var hex = [
      rgb.r.toString(16),
      rgb.g.toString(16),
      rgb.b.toString(16)
    ];
    $.each(hex, function(nr, val) {
      if(val.length === 1) hex[nr] = '0' + val;
    });
    return '#' + hex.join('');
  }

  // Converts an HSB object to a hex string
  function hsb2hex(hsb) {
    return rgb2hex(hsb2rgb(hsb));
  }

  // Converts a hex string to an HSB object
  function hex2hsb(hex) {
    var hsb = rgb2hsb(hex2rgb(hex));
    if(hsb.s === 0) hsb.h = 360;
    return hsb;
  }

  // Converts an RGB object to an HSB object
  function rgb2hsb(rgb) {
    var hsb = { h: 0, s: 0, b: 0 },
        min = Math.min(rgb.r, rgb.g, rgb.b),
        max = Math.max(rgb.r, rgb.g, rgb.b),
        delta = max - min;
    hsb.b = max;
    hsb.s = max !== 0 ? 255 * delta / max : 0;
    if(hsb.s !== 0) {
      if(rgb.r === max) {
        hsb.h = (rgb.g - rgb.b) / delta;
      } else if(rgb.g === max) {
        hsb.h = 2 + (rgb.b - rgb.r) / delta;
      } else {
        hsb.h = 4 + (rgb.r - rgb.g) / delta;
      }
    } else {
      hsb.h = -1;
    }
    hsb.h *= 60;
    if(hsb.h < 0) {
      hsb.h += 360;
    }
    hsb.s *= 100/255;
    hsb.b *= 100/255;
    return hsb;
  }

  // Converts a hex string to an RGB object
  function hex2rgb(hex) {
    hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
    return {
      r: hex >> 16,
      g: (hex & 0x00FF00) >> 8,
      b: (hex & 0x0000FF)
    };
  }
}(jQuery));

/*Themify Color Manager*/
(function ( $,window, document  ) {
    'use strict';
    /**
     * Themify Color Saver Manager
     * The resources that manage Global Styles
     *
     * @since 4.5.0
     */
    const topWindow=window.top.document;
    window.themifyColorManager = {
        colorSwatches:{},
        initilized:false,
        // Init global variables
        init:function(){
            if(this.initilized) {
                return;
            }
			if ( typeof themifyCM === 'undefined' ) {
				return;
			}
            for(let keys=Object.keys(themifyCM.colors),i = 0,len=keys.length;i<len;i++){
                this.colorSwatches[keys[i]] = themifyCM.colors[keys[i]];
            }
            this.initilized = true;
        },
        // Convert a color data to rgba sting
        toRgba:function(data){
            return data.color.replace('rgb','rgba').replace(')',','+data.opacity+')');
        },
        // Convert data to colors array
        toColorsArray:function(){
            let colors = [];
            for(let swatches=Object.keys(this.colorSwatches),i=swatches.length-1; i>=0;--i){
                colors.push(this.toRgba(this.colorSwatches[swatches[i]]));
            }
            if(!colors.length){
                colors = ['#FFF'];
            }
            return colors;
        },
        // Add required HTML to color picker
        initColorPicker : function () {
            const container = topWindow.querySelector('.minicolors-focus .minicolors-panel');
            if(container.getElementsByClassName('tf_swatches_container')[0]){
                return;
            }
            const newSwatchesContainer = document.createElement('div'),
                swatches = newSwatchesContainer.getElementsByClassName('minicolors-swatch'),
                keys=Object.keys(this.colorSwatches).reverse(),
                addSwatch = document.createElement('a'),
                sTooltip = document.createElement('span'),
                ieTooltip = document.createElement('span'),
                dropdownIcon = document.createElement('div');
        
            newSwatchesContainer.className = 'tf_swatches_container';
            newSwatchesContainer.addEventListener('click',this.initClick.bind(this));
            newSwatchesContainer.appendChild(container.getElementsByClassName('minicolors-swatches')[0]);
            // Add delete Icon
            for(let i = swatches.length-1;i>-1;--i){
                if(!keys.length){
                    swatches[i].parentNode.removeChild(swatches[i]);
                    break;
                }
                let deleteIcon = document.createElement('span'),
                    UID = 'undefined' !== typeof this.colorSwatches[keys[i]]['uid'] ? this.colorSwatches[keys[i]].uid : this.UID() + i ;
                deleteIcon.className = 'tb_delete_swatch tf_close';
                swatches[i].appendChild(deleteIcon);
                // Add ID to swatch
                swatches[i].dataset['uid'] = this.colorSwatches[keys[i]]['uid'] = UID;
            }
            ieTooltip.className=sTooltip.className='tf_cm_tooltip';
            // Add Add Swatch Icon
            sTooltip.innerText=themifyCM.labels.save;
            addSwatch.appendChild(sTooltip);
            addSwatch.className = 'tb_add_swatch tf_plus_icon';
            newSwatchesContainer.appendChild(addSwatch);
            // Add Import/Export Drop Down
            ieTooltip.innerText=themifyCM.labels.ie;
            dropdownIcon.appendChild(ieTooltip);
            dropdownIcon.className = 'tb_cm_dropdown_icon';
            dropdownIcon.appendChild(this.getIcon('ti-import'));
            dropdownIcon.setAttribute('tabIndex','-1');
            dropdownIcon.appendChild(this.makeImportExportDropdown());
            newSwatchesContainer.appendChild(dropdownIcon);
            container.appendChild(newSwatchesContainer);
        },
        // Make import/expot import
        makeImportExportDropdown:function(){
            const dropdown = document.createElement('div'),
                menu = document.createElement('ul'),
                importCM = document.createElement('li'),
                exportCM = document.createElement('li');
                dropdown.className = 'tb_cm_dropdown';
            importCM.className = 'tb_cm_import';
            importCM.textContent = themifyCM.labels.import;
            importCM.appendChild(this.getIcon('ti-import'));
            menu.appendChild(importCM);
            exportCM.className = 'tb_cm_export';
            exportCM.textContent = themifyCM.labels.export;
            exportCM.appendChild(this.getIcon('ti-export'));
            menu.appendChild(exportCM);
            dropdown.appendChild(menu);
            return dropdown;
        },
        getIcon: function (icon,cl) {
            icon='tf-'+icon.trim().replace(' ','-');
            const ns='http://www.w3.org/2000/svg',
                use=document.createElementNS(ns,'use'),
                svg=document.createElementNS(ns,'svg');
            let classes='tf_fa '+icon;
            if(cl){
                classes+=' '+cl;
            }
            svg.setAttribute('class',classes);
            use.setAttributeNS(null, 'href','#'+icon);
            svg.appendChild(use);
            return svg;
        },
        // Generate Unique ID
        UID:function(){
            const uid = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
            return uid.substring(0,5);
        },
        // Init Click events
        initClick:function(e){
            e.preventDefault();
            const target = e.target,
                classList = target.classList;
            if(classList.contains('tb_delete_swatch')){
                this.deleteSwatch(e);
            }
            else if(classList.contains('tb_add_swatch')){
                this.addSwatch();
            }
            else if(classList.contains('tb_cm_export')){
                target.parentNode.parentNode.parentNode.blur();
                document.location.assign(themifyCM.exportColorsURL);
            }
            else if(classList.contains('tb_cm_import')){
                target.parentNode.parentNode.parentNode.blur();
                this.importColors('colors');
            }
        },
        // Import Colors
        importColors:function(type){
            let input = topWindow.getElementsByClassName('themify_cm_input');
            if(!input.length){
                input = document.createElement('input');
                input.type = 'file';
                input.dataset.type = type;
                input.className = 'themify_cm_input';
                const self = this;
                input.addEventListener('change',function ( e ) {
                    const file = e.target.files[0],
                        formData = new FormData(),
                        type = e.target.dataset.type;
                    formData.append('file', file, file.name);
                    formData.append('action', 'themify_import_colors');
                    formData.append('tb_load_nonce', themifyCM.nonce);
                    formData.append('type', type);
                    $.ajax({
                        url: themifyCM.ajax_url,
                        type: 'POST',
                        data: formData,
                        cache: false,
                        dataType: 'json',
                        processData: false,
                        contentType: false,
                        success: function(data) {
                            if(data.status === 'SUCCESS'){
                                if('colors' === type){
                                    self.colorSwatches = data.colors;
                                    for(let swatches = topWindow.querySelectorAll('.tf_swatches_container .minicolors-swatch'),i=swatches.length-1; i >-1; --i ){
                                        swatches[i].parentNode.removeChild(swatches[i]);
                                    }
                                    for(let swatches = Object.keys(self.colorSwatches),len = swatches.length,i= 0 ;i < len ; i++ ){
                                        self.addSwatchHtml(self.colorSwatches[swatches[i]].color,self.colorSwatches[swatches[i]].opacity,swatches[i]);
                                    }
                                }
                                else if('gradients' === type){
                                    const instance = ThemifyBuilderCommon.Lightbox.$lightbox.find('.tb_gradient_container').first().data('themifyGradient');
                                    for(let oldSwatches = Object.keys(themifyCM.gradients),i=oldSwatches.length-1; i >-1; --i ){
                                        instance.removeSwatch(oldSwatches[i]);
                                    }
                                    themifyCM.gradients = data.colors;
                                    for(let swatches = Object.keys(themifyCM.gradients),i= 0,len = swatches.length;i < len ; i++ ){
                                        instance.addSwatch(themifyCM.gradients[swatches[i]]);
                                    }
                                }
                            }
                            alert(data.msg);
                        }
                    });

                });
            }else{
                input = input[0];
                input.dataset.type = type;
            }
            input.click();
        },
        // Delete a swatch
        deleteSwatch:function(e){
            e.preventDefault();
            e.stopPropagation();
            const swatchID = e.target.parentNode.dataset.uid;
            for(let swatches = topWindow.querySelectorAll('[data-uid="'+swatchID+'"]'),i=swatches.length-1; i >=0; --i ){
                swatches[i].parentNode.removeChild(swatches[i]);
            }
            delete this.colorSwatches[swatchID];
            // update the color swatches
            this.updateColorSwatches('colors');
        },
        // Sync all swatches with the server
        updateColorSwatches:function(type){
            // Run ajax to sync with server
            $.ajax({
                type: 'POST',
                url: themifyCM.ajax_url,
                dataType: 'json',
                data: {
                    action: 'themify_save_colors',
                    type: type,
                    tb_load_nonce: themifyCM.nonce,
                    colors: 'colors' === type ? this.colorSwatches : themifyCM.gradients
                }
            });
        },
        // Add a swatch
        addSwatch:function(){
            const input = topWindow.querySelector('.minicolors-focus .minicolors-input'),
                newColor = this.hex2Rgb(input.value),
                newOpacity = input.dataset['opacity'];
            if(null === newColor){
                return false;
            }
            let exist = false;
            // Check if color is not exist in swatches
            for(let swatches = Object.keys(this.colorSwatches),i=swatches.length-1; i >=0; --i ){
                if(this.colorSwatches[swatches[i]].color.replace(/\s/g,'') === newColor && parseFloat(this.colorSwatches[swatches[i]].opacity) === parseFloat(newOpacity)){
                    exist = true;
                    break;
                }
            }
            if(!exist){
                const UID = this.UID();
                this.addSwatchHtml(newColor,newOpacity,UID);
                this.colorSwatches[UID] = {color:newColor,opacity:newOpacity,uid:UID};
                // update the color swatches
                this.updateColorSwatches('colors');
            }
        },
        // Add Swatche HTML
        addSwatchHtml:function(color,opacity,UID){
            function createSwatch(UID){
                const newSwatch = document.createElement('li'),
                    colorSpan = document.createElement('span'),
                    deleteIcon = document.createElement('span');
                newSwatch.className = 'minicolors-swatch minicolors-sprite';
                newSwatch.dataset['uid'] = UID;
                newSwatch.dataset['swatchColor'] = color.replace(')', ', '+opacity+')').replace('rgb', 'rgba');
                colorSpan.className = 'minicolors-swatch-color tf_abs';
                colorSpan.style.backgroundColor = color;
                colorSpan.style.opacity = opacity;
                newSwatch.appendChild(colorSpan);
                deleteIcon.className = 'tb_delete_swatch tf_close';
                newSwatch.appendChild(deleteIcon);
                return newSwatch;
            }
            for(let containers=topWindow.querySelectorAll('.tf_swatches_container .minicolors-swatches'),i=containers.length-1; i >=0; --i ){
                containers[i].insertBefore(createSwatch(UID), containers[i].firstChild);
            }
        },
        // convert Hex to Rgb
        hex2Rgb:function(hex){
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? 'rgb(' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) + ')' : null;
        }
    };
    window.themifyColorManager.init();
}( jQuery, window, document ));
