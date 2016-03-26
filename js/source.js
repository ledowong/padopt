$(document).ready(function() {

  // enable bootstrap tooltip
  $('[data-toggle="tooltip"]').tooltip();

  // upload screenshot by drag and drop
  $('body').on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
  })
  .on('dragover dragenter', function() {
    $('body').addClass('is-dragover');
  })
  .on('dragleave dragend drop', function() {
    $('body').removeClass('is-dragover');
  })
  .on('drop', function(e) {
    // droppedFiles = e.originalEvent.dataTransfer.files;
    var elem = document.getElementById("screenshot_canvas");
    if (elem) elem.parentElement.removeChild(elem); // reset canvas
    var fr = new FileReader();
    fr.onload = imageLoaded;   // onload fires after reading is complete
    if (e.originalEvent.dataTransfer.files.length > 1) {
      alert('One image only');
    } else {
      fr.readAsDataURL(e.originalEvent.dataTransfer.files[0]);
    }
  });

  // upload screenshot by button
  // $("#upload_screenshot").on('change', function(){
  //   var elem = document.getElementById("screenshot_canvas");
  //   if (elem) elem.parentElement.removeChild(elem); // reset canvas
  //   var fr = new FileReader();
  //   fr.onload = imageLoaded;   // onload fires after reading is complete
  //   fr.readAsDataURL($(this)[0].files[0]);    // begin reading
  // });

  // handle screenshot
  function imageLoaded(p){
    var data_uri = p.currentTarget.result;
    var col_row = $('#form_grid_size').val().split('x');
    imageAnalysis(data_uri, col_row[0], col_row[1], function(result_string){
      if (result_string) {
        board.import(result_string);
      } else {
        // TODO
        alert('Game board not found.')
      }
    });
  }



  // prepare and draw game board
  var board = new Board('6x5');

  $('#form_grid_size').on('change', function(){
    board.changeGrid($(this).val()); // update board
    COL_ROW = $(this).val().split('x'); // update optimizer variables
  });

  $('#profile-selector').change(function() {
    // var values = this.value.replace(/\s+/g, '').split(/,/);
    // for (var i = 0; i < TYPES; ++ i) {
    //   $('#e' + i + '-normal').val(values[4*i]);
    //   $('#e' + i + '-mass').val(values[4*i+1]);
    //   $('#e' + i + '-row').val(values[4*i+2]);
    //   $('#e' + i + '-tpa').val(values[4*i+3]);
    // }
    // globalmult = values[4*TYPES];
    console.log('TODO');
  });

  $('#form_draw_style').on('change', function() {
    drawstyle = $(this).val();
  });

  $('#form_sorting').on('change', function() {
    sorter = $(this).val();
  });

  $('.form_solve_button').click(function() {
    // $('[id^="grid"] > div').each(function(){ $(this).removeClass('border-flash'); });
    // var solver_button = this;
    // var board = get_board();
    // global_board = board;
    // solver_button.disabled = true;
    // $('.loading-throbber').fadeToggle('fast');
    // solve_board(board, function(p, max_p) {
    //   //console.log(p);
    //   //console.log(max_p);
    //   var result = parseInt(p * 100 / parseInt(max_p));
    //   $('#are-you-ready').remove();
    //   if ($('#status').hasClass('active')) {
    //     $('#solutions ol li').fadeToggle();
    //     $('#status').removeClass('active');
    //   }
    //   $('#status').text('Solving ( ' + result + '% )');
    // }, function(solutions) {
    //   $('.loading-throbber').fadeToggle();
    //   var html_array = [];
    //   global_unsimplified = solutions;
    //   solutions = simplify_solutions(solutions);
    //   global_solutions = solutions;
    //   solutions.forEach(function(solution) {
    //     add_solution_as_li(html_array, solution, board);
    //   });
    //   $('#solutions > ol').html(html_array.join(''));
    //   solver_button.disabled = false;
    //   $('#status').addClass('active');
    // });
    console.log('TODO');
  });

  // $('#pathincrease').click(function() {
  //   $('[id^="grid"] > div').each(function(){ $(this).removeClass('border-flash'); });
  //   board = global_board
  //   $('.loading-throbber').fadeToggle('fast');
  //   lengthenSolution(board, global_unsimplified, function(p, max_p) {
  //     //console.log(p);
  //     //console.log(max_p);
  //     var result = parseInt(p * 100 / parseInt(max_p));
  //     $('#are-you-ready').remove();
  //     if ($('#status').hasClass('active')) {
  //       $('#solutions ol li').fadeToggle();
  //       $('#status').removeClass('active');
  //     }
  //     $('#status').text('Solving ( ' + result + '% )');
  //   }, function(solutions) {
  //     $('.loading-throbber').fadeToggle();
  //     var html_array = [];
  //     global_unsimplified = solutions;
  //     solutions = simplify_solutions(solutions);
  //     global_solutions = solutions;
  //     solutions.forEach(function(solution) {
  //       add_solution_as_li(html_array, solution, board);
  //     });
  //     $('#solutions > ol').html(html_array.join(''));
  //     $('#status').addClass('active');
  //   });
  // });

  $('#solutions').on('click', 'li', function(e) {
    // show_board(global_board);
    // global_index = $(this).index();
    // var solution = global_solutions[global_index];
    // var path = draw_path(solution.init_cursor, solution.path);
    // var hand_elem = $('#hand');
    // hand_elem.stop(/*clearQueue*/true).show();
    // path.forEach(function(xy, i) {
    //   if ( COL_ROW[0] == "5" ) {
    //     var left = xy.x + 46;
    //   } else {
    //     var left = xy.x + 14;
    //   }
    //   var top = xy.y + 14;
    //   hand_elem[i == 0 ? 'offset' : 'animate']({left: left, top: top});
    // });
    // $('#solutions li.prev-selection').removeClass('prev-selection');
    // $(this).addClass('prev-selection');
    console.log('TODO');
  });

  $('#form_randomize_button').click(function() {
    var types = $('#form_random_type').val().split(",");
    board.randomize(types);
  });

  $('#form_clear_button').click(function() {
    board.changeGrid($("#form_grid_size").val());
  });

  $('#form_drop_match_button').click(function() {
    // var solution = global_solutions[global_index];
    // if (!solution) {
    //   return;
    // }
    // var board = in_place_evaluate_solution(solution, get_weights());
    // show_board(board);
    // clear_canvas();
    // TODO
    console.log('TODO');
  });

  $('#form_final_state_button').click(function() {
    // var solution = global_solutions[global_index];
    // if (solution) {
    //   show_board(solution.board);
    // }
    console.log('TODO');
  });

  // import textarea only accept pre-set character.
  $("#importModal textarea").on('keydown', function (e) {
    if ($.inArray(e.keyCode, [46, 8, 9, 27]) !== -1 || // Allow: 8backspace, 46delete, 9tab, 27escape
        (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) || // Allow: Ctrl+A
        (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) || // Allow: Ctrl+C
        (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) || // Allow: Ctrl+X
        (e.keyCode == 86 && (e.ctrlKey === true || e.metaKey === true)) || // Allow: Ctrl+V
        (e.keyCode >= 35 && e.keyCode <= 39)) { // Allow: home, end, left, right
       // let it happen, don't do anything
       return;
    }
    // only allow following characters
    if ($.inArray(e.keyCode, [
      48, 49, 50, 51, 52, 53, 54, 55, 56, // 0-8
      96, 97, 98, 99,100,101,102,103,104, // 0-8 (numpad)
      110,190, // .
      88, 81, 87, 82, 89, 71, 72, 66, 80// color
      ]) === -1) {
      e.preventDefault();
    }
  });

  // open import modal window
  $('#form_import_button').click(function() {
    // update textarea style
    var cc = [];
    $('#form_grid_size option').each(function(){ cc.push("grid"+$(this).val()); });
    $("#importModal textarea").removeClass(cc.join(' ')).addClass("grid"+$("#form_grid_size").val());
    var current_grid = $("#form_grid_size").val().split("x");
    $("#importModal textarea").prop('maxlength', parseInt(current_grid[0]) * parseInt(current_grid[1])); // maxlength
    // update textarea text
    $('#importModal textarea').val(board.export());
    $('#importModal').modal('show');
  });
  $('#importModal').on('shown.bs.modal', function (e) {
    // focus textarea
    $('#importModal textarea').select().focus();
  })


  // import & solve button clicked (inside modal window)
  $('#importModal .btn-primary').click(function() {
    board.import($('#importModal textarea').val());
    $('#importModal').modal('hide');
  });

  $('#change-change').click(function() {
    // TODO
    // var change_targets = $('.change-target').map(function() {
    //   return get_type(this);
    // });
    // var board = get_board();
    // for (var i = 0; i < COL_ROW[1]; ++ i) {
    //   for (var j = 0; j < COL_ROW[0]; ++ j) {
    //     var type = board[i][j];
    //     if (type == 'X') {
    //       type = change_targets[change_targets.length-1];
    //     } else {
    //       type = change_targets[type];
    //     }
    //     board[i][j] = type;
    //   }
    // }
    // show_board(board);
    // clear_canvas();
    // $('#change-popup').hide();
  });
});
