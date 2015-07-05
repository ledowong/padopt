/**
 * Main js file for Combo.Tips
 */

(function($) {

  $(document).on('ready', function() {
    // Enable slider for Path Number Scaling
    $('#num-paths').slider()
      .on('slide', function(ev){

      var $path_value_input = $(this).siblings('#num-path-value');
      $('#num-path-value').val(ev.value);
      if (ev.value <= 120) {
        $path_value_input.removeClass('medium slow');
        $path_value_input.addClass('fast');
      }
      if (ev.value > 120 && ev.value <= 250) {
        $path_value_input.removeClass('fast slow');
        $path_value_input.addClass('medium');
      }
      if (ev.value > 250) {
        $path_value_input.removeClass('fast medium');
        $path_value_input.addClass('slow');
      }
      if (ev.value > 300) {
        if ($('.slow-warning').length === 0) {
          $('<p class="slow-warning">This might take a while...</p>').insertAfter($path_value_input);
        } else {
          $('.slow-warning').removeClass('hide');
        }
      } else {
        $('.slow-warning').addClass('hide');
      }
    });
  });

  /**
   * Load + Resize events for mobile adjustments.
   */
  $(window).on('load resize', function(){
    var width = $(window).width();
    if (width < 1030 && !$('#disqus_thread').hasClass('repositioned')) {
      $('#disqus_thread').hide().css({margin: 0, maxWidth: '97%'});
      $('.glyphicon-heart-empty').on('click', function() {
       $('#disqus_thread').slideToggle();
      });
      $('#solutions').css('z-index', 1);
      $('.secondary-navbar-bottom').css('z-index', 2);
      $('.secondary-navbar-bottom').append($('#disqus_thread').addClass('repositioned'));
    }
  });

  // Tooltip
  $('a[data-toggle="tooltip"]').tooltip({
    animated: 'fade',
    placement: 'bottom',
  });
  var thumbnail_invert = false;

  var throbber_animation_markup = $('<div class="background-fade"><div class="dots">Loading...</div></div>');

  // Handle the file uploaded by Dropzone
  Dropzone.autoDiscover = false;
  var dz_screenshot = new Dropzone("#screenshot-upload", {
    acceptedFiles:"image/*",
    clickable: true,
    uploadMultiple: false,

  });

  dz_screenshot.on("processing", function() {
    if ($('.dots').length === 0) {
      $(throbber_animation_markup).appendTo('body');
      $('.dots, .background-fade').fadeIn();

    } else {
      $('.dots, .background-fade').fadeIn();
    }
  });

  dz_screenshot.on("complete", function(file) {
    $.ajax({
      url: '/images/uploads/Puzzle-Dragons-Combo-Tips-' + file.name,
      // Double check to make sure the file is there before we attach the src to the canvas image
      complete: function(){
        $('.uploaded-image').attr("src", "/images/uploads/Puzzle-Dragons-Combo-Tips-" + file.name);
        $('#screenshot-upload img').last().attr("src", "/images/uploads/Puzzle-Dragons-Combo-Tips-" + file.name);
        // Insert the newly uploaded thumbnail as the first item in the list
        $('.dz-success.dz-image-preview').last().insertBefore($('.dz-success.dz-image-preview').first());
        // Limit the thumbnails so that we only show the last 3 uploaded files.
        if ($('.dz-success.dz-image-preview').length > 3) {
          $('.dz-success.dz-image-preview').last().remove();
        }
        // If the dots throbber is showing, turn it off when the background fade is complete.
        if ($('.dots').css('display') !== 'none' && $('.background-fade').css('display') !== 'none') {
          $('.dots, .background-fade').promise().done(function(){
            $(this).fadeToggle();
          });
        }
        // Open the menu
        $('.dropdown.upload').toggleClass('open');
      },
    });
  });

  // ##### IMGUR SOLUTION. NOT BEING USED
  //$('#imgur_upload').on('submit', function(e){
  //e.preventDefault();
  //console.log('test');
  //console.log($(this));
  //var form_data = new FormData(this);
  //console.log(form_data);
  //$.ajax({
  //type: 'POST',
  //url: $(this).attr('action'),
  //data: form_data,
  //cache: false,
  //contentType: false,
  //processData: false,
  //dataType: "json",
  //})
  //.done(function(data){
  //console.log(data);
  //$('.uploaded-image').attr("src", data.data.link);

  //console.log($('.uploaded-image').attr("src"));
  //})
  //.fail(function(data) {
  //var responseText = data.responseText;
  //console.log(responseText);
  //console.log(data);
  //// just in case posting your form failed
  //console.log( "Posting failed." );

  //});

  //});

  $('.uploaded-image, #import-orbs').on("click", function(event){
    //console.log('clicked image');
    $(document).initImageAnalysis();
    ga('send', 'event', 'button', 'click', 'Combo Requested', 1);
  });

  $('html').on('click', function(event){
    if ($('#keep-open input').prop("checked")) {
      $('.dropdown-toggle').attr('data-toggle', 'collapse in');
    } else {

      $('.dropdown-toggle').attr('data-toggle', 'dropdown');
    }
    // This one feels a bit hacky. Bootstrap was annoying
    if (event.target.className == 'close') {
      $('#orb-alert-msg.bs-example').fadeOut();
    }
  });



  $.fn.initImageAnalysis = function() {
    // Setup orb array
    var orbs_found = [];
    //console.log('it ran');

    //Create a stage by getting a reference to the canvas
    stage = new createjs.Stage("drawCanvas");
    //console.log(stage);
    var image_object = $('.uploaded-image');
    //console.log(image_object);

    // Percentages (NOT USED)
    var game_header_height = 55.72;
    var game_header_width = 100;
    var orb_grid_height = 44.28;
    var orb_grid_width = 100;
    // We can't have the analysis run from distorted DOM image values
    //var image_height = $(image_object).height();
    //var image_width = $(image_object).width();

    // Instead, use the natural height/width
    var image_height = image_object[0].naturalHeight;
    var image_width = image_object[0].naturalWidth;


    // if we want to break the algorithm... use these
    //var orb_frame_width = (image_width * .166);
    //var orb_frame_height = (image_height * .0916);

    // Mobile phones have a wide variety of screenshot resolutions.
    // So to make sure our analysis works on all of those image sizes, we
    // set the frame size using dynamic width/height values.
    var orb_frame_width = (image_width * .166);
    var orb_frame_height = (image_height * .0905555);

    var uploaded_image_url = $(image_object).attr('src');

    // @images: The image url we're going to break up into tiny frames
    // @frames: the size of each square frame that we will analyze for RGB values
    var data = {
      images:[uploaded_image_url],
      frames: {width: orb_frame_width, height: orb_frame_height},
    };
    var spriteSheet = new createjs.SpriteSheet(data);
    var sprite = new createjs.Sprite(spriteSheet);
    //console.log(spriteSheet);
    var number_of_frames = spriteSheet._numFrames;
    //console.log(number_of_frames + ' get number frames');
    var frameIndex = spriteSheet._numFrames;
    //console.log(frameIndex);


    // @MAGIC - Adjusting the tolerance level to a higher value will
    // broaden the range of acceptable colors for a given orb.
    // 20 works best...
    var tolerance_level = 20;

    // Used to add the tolerance for an RGB value
    var color_top_range = function(color) {
      var cTopRange = (color + tolerance_level);

      return cTopRange;

    }
    // Used to subtract the tolerance for an RGB value
    var color_bottom_range = function(color) {
      var cBottomRange = (color - tolerance_level);
      return cBottomRange;
    }
    // Sets up defaults. These may need to be adjusted if we start seeing a lot of errors
    var fire_rgb_default = [179, 98, 84];
    var water_rgb_default = [106, 132, 165];
    var wood_rgb_default = [94, 152, 111];
    var light_rgb_default = [169, 154, 97];
    var dark_rgb_default = [145, 91, 140];
    var heart_rgb_default = [173, 86, 124];




    // Super dirty, but it works...
    for (numx=0; numx < frameIndex; numx++) {
      if (numx > 29) {

        var isLikeFire = false;
        var isLikeWater = false;
        var isLikeWood = false;
        var isLikeLight = false;
        var isLikeDark = false;
        var isLikeHeart = false;

        var found_color = false;

        var imgEl = createjs.SpriteSheetUtils.extractFrame(spriteSheet, numx);
        var imageColor = $(document).getAverageRGB(imgEl);
        var red_value = imageColor.r;
        var green_value = imageColor.g;
        var blue_value = imageColor.b;
        var orb = {"red": red_value, "green": green_value, "blue": blue_value};
        if (orb) {
          //console.log('#### Setting up color ranges ####');
          //console.log(orb);

          if (color_top_range(orb.red) > fire_rgb_default[0] && fire_rgb_default[0] > color_bottom_range(orb.red)) {
            if (color_top_range(orb.green) > fire_rgb_default[1] && fire_rgb_default[1] > color_bottom_range(orb.green)) {
              if (color_top_range(orb.blue) > fire_rgb_default[2] && fire_rgb_default[2] > color_bottom_range(orb.blue)) {
                isLikeFire = true;
                found_color = true;
              }
            }
          }
          if (color_top_range(orb.red) > water_rgb_default[0] && water_rgb_default[0] > color_bottom_range(orb.red) && found_color == false) {
            if (color_top_range(orb.green) > water_rgb_default[1] && water_rgb_default[1] > color_bottom_range(orb.green)) {
              if (color_top_range(orb.blue) > water_rgb_default[2] && water_rgb_default[2] > color_bottom_range(orb.blue)) {
                isLikeWater = true;
                found_color = true;
              }
            }
          }
          if (color_top_range(orb.red) > wood_rgb_default[0] && wood_rgb_default[0] > color_bottom_range(orb.red) && found_color == false) {
            if (color_top_range(orb.green) > wood_rgb_default[1] && wood_rgb_default[1] > color_bottom_range(orb.green)) {
              if (color_top_range(orb.blue) > wood_rgb_default[2] && wood_rgb_default[2] > color_bottom_range(orb.blue)) {
                isLikeWood = true;
                found_color = true;
              }
            }
          }
          if (color_top_range(orb.red) > light_rgb_default[0] && light_rgb_default[0] > color_bottom_range(orb.red) && found_color == false) {
            if (color_top_range(orb.green) > light_rgb_default[1] && light_rgb_default[1] > color_bottom_range(orb.green)) {
              if (color_top_range(orb.blue) > light_rgb_default[2] && light_rgb_default[2] > color_bottom_range(orb.blue)) {
                isLikeLight = true;
                found_color = true;
              }
            }
          }
          if (color_top_range(orb.red) > heart_rgb_default[0] && heart_rgb_default[0] > color_bottom_range(orb.red) && found_color == false) {
            if (color_top_range(orb.green) > heart_rgb_default[1] && heart_rgb_default[1] > color_bottom_range(orb.green)) {
              if (color_top_range(orb.blue) > heart_rgb_default[2] && heart_rgb_default[2] > color_bottom_range(orb.blue)) {
                isLikeHeart = true;
                found_color = true;
              }
            }
          }
          if (color_top_range(orb.red) > dark_rgb_default[0] && dark_rgb_default[0] > color_bottom_range(orb.red) && found_color == false) {
            if (color_top_range(orb.green) > dark_rgb_default[1] && dark_rgb_default[1] > color_bottom_range(orb.green)) {
              if (color_top_range(orb.blue) > dark_rgb_default[2] && dark_rgb_default[2] > color_bottom_range(orb.blue)) {
                isLikeDark = true;
                found_color = true;
              }
            }
          }

        }

        // NEW WAY
        if (isLikeFire) {
          orbs_found.push("e0");
          //console.log('its fire');
        } else if(isLikeWater) {
          orbs_found.push("e1");
          //console.log('its water');
        } else if (isLikeWood) {
          orbs_found.push("e2");
          //console.log('its wood');
        } else if (isLikeLight) {
          orbs_found.push("e3");
          //console.log('its light');
        } else if (isLikeDark) {
          orbs_found.push("e4");
          //console.log('its dark');
        } else if (isLikeHeart) {
          orbs_found.push("e5");
          //console.log('its heart');
        } else {
          orbs_found.push('eX');
        }

        /** OLD WAY
        console.log('--');
        // LIGHT ORBS
        if (orb.red < 175 && orb.red > 135 && orb.green > 120 && orb.green < 175) {
          orbs_found.push("e3");
          console.log('light');
        }
        // HEART ORBS
        if (orb.red < 185 && orb.red > 150 && orb.green > 70 && orb.green < 110 && orb.blue < 145 && orb.blue > 100) {
          orbs_found.push("e5");
          console.log('heart');
        }
        // DARK ORBS
        if (orb.red < 160 && orb.red > 105 && orb.green < 110 && orb.green > 60 && orb.blue < 155 && orb.blue > 110) {
          orbs_found.push("e4");
          console.log('dark');
        }
        // WOOD ORBS
        if (orb.red < 120 && orb.red > 65 && orb.green < 170 && orb.green > 125 && orb.blue < 130 && orb.blue > 75) {
          orbs_found.push("e2");
          console.log('wood');
        }
        // FIRE ORBS
        if (orb.red < 210 && orb.red > 150 && orb.green < 125 && orb.green > 75 && orb.blue < 120 && orb.blue > 50) {
          orbs_found.push("e0");
          console.log('fire');
        }
        // WATER ORBS
        if (orb.red < 135 && orb.red > 75 && orb.green < 155 && orb.green > 105 && orb.blue < 195 && orb.blue > 135) {
          orbs_found.push("e1");
          console.log('water');
        }
        console.log(orb.red);
        console.log(orb.green);
        console.log(orb.blue);
        console.log('--');
        //orbs_found.push(orb);
        **/
      }
    }
    $('#grid > div').each(function(index) {
      //console.log(orbs_found[index]);
      if (orbs_found.length > 0) {
        var grid_class = $(this).attr('class');
        var current_icon_class = $(this).attr('class').split(' ').slice(-1);
        var swap_class = grid_class.replace(current_icon_class, orbs_found[index]);
        $(this).removeClass().addClass(swap_class);
        // SET ERROR FOR ORB ISSUE
        if (orbs_found[index] === 'eX') {
          var message = '<div id="orb-alert-msg" class="bs-example"><div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong> It looks like there was a problem with one or more of the orbs. You may want to double check the board.</div></div>';
          $("#solutions").append(message);
          $(this).addClass('border-flash');
          ga('send', 'event', 'error', 'Algorithm', 'Orb Color Not Found', 1);
        }
        //console.log(current_icon_class);
        //$(this).removeClass(current_icon_class);
        //$(this).removeClass(current_icon_class).addClass(orbs_found[index]);
      }	else {
        //$(this).addClass('eX');
      }
    });
    //console.log(orbs_found);
    //sprite.gotoAndStop(3);
    //var img = createjs.SpriteSheetUtils.extractFrame(spriteSheet, 54);
    //console.log(img);
    //document.getElementById("status").appendChild(img);
    //var imageColor = getAverageRGB(img);
    //var red_value = imageColor.r;
    //var green_value = imageColor.g;
    //var blue_value = imageColor.b;

    //document.body.style.backgroundColor="rgb(" + red_value + "," + green_value + "," + blue_value +")";
    //stage.update();
    //console.log(orbs_found);
    return orbs_found;
  }
  // GET IMAGE COLOR
  $.fn.getAverageRGB = function(imgEl) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
      return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
      data = context.getImageData(0, 0, width, height);
    } catch(e) {
      /* security error, img on diff domain */
      return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
      ++count;
      rgb.r += data.data[i];
      rgb.g += data.data[i+1];
      rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;

  }

  //helpers

})(jQuery);
