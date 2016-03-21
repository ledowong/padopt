/**
 * Main js file
 */

(function($) {

  $(document).on('ready', function() {
    // perfect scrollbar
    $('#contentHolder').perfectScrollbar();
    $('#solutions').perfectScrollbar();

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
  // var thumbnail_invert = false;
  //
  // var throbber_animation_markup = $('<div class="background-fade"><div class="dots">Loading...</div></div>');
  //
  // Handle the file uploaded by Dropzone
  // Dropzone.autoDiscover = false;
  // var dz_screenshot = new Dropzone("#screenshot-upload", {
  //   acceptedFiles:"image/*",
  //   clickable: true,
  //   uploadMultiple: false,
  //
  // });
  //
  // dz_screenshot.on("processing", function() {
  //   if ($('.dots').length === 0) {
  //     $(throbber_animation_markup).appendTo('body');
  //     $('.dots, .background-fade').fadeIn();
  //
  //   } else {
  //     $('.dots, .background-fade').fadeIn();
  //   }
  // });
  //
  // dz_screenshot.on("complete", function(file) {
  //   $.ajax({
  //     url: '/images/uploads/Puzzle-Dragons-Combo-Tips-' + file.name,
  //     // Double check to make sure the file is there before we attach the src to the canvas image
  //     complete: function(){
  //       $('.uploaded-image').attr("src", "/images/uploads/Puzzle-Dragons-Combo-Tips-" + file.name);
  //       $('#screenshot-upload img').last().attr("src", "/images/uploads/Puzzle-Dragons-Combo-Tips-" + file.name);
  //       // Insert the newly uploaded thumbnail as the first item in the list
  //       $('.dz-success.dz-image-preview').last().insertBefore($('.dz-success.dz-image-preview').first());
  //       // Limit the thumbnails so that we only show the last 3 uploaded files.
  //       if ($('.dz-success.dz-image-preview').length > 3) {
  //         $('.dz-success.dz-image-preview').last().remove();
  //       }
  //       // If the dots throbber is showing, turn it off when the background fade is complete.
  //       if ($('.dots').css('display') !== 'none' && $('.background-fade').css('display') !== 'none') {
  //         $('.dots, .background-fade').promise().done(function(){
  //           $(this).fadeToggle();
  //         });
  //       }
  //       // Open the menu
  //       $('.dropdown.upload').toggleClass('open');
  //     },
  //   });
  // });

  // $('.uploaded-image, #import-orbs').on("click", function(event){
  //   //console.log('clicked image');
  //   $(document).initImageAnalysis();
  // });

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






  //helpers

})(jQuery);
