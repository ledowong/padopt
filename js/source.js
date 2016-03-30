// TODO, global varialbe use between optimizer and source.js
// Should redesign 'profile' and remove this global variable.
var globalmult = -1;



$(document).ready(function() {

  function errorFlash(msg){
    $('#status_bar').addClass('error');
    $('.error_label').text(msg);
    setTimeout(function(){
      $('#status_bar').removeClass('error');
    }, 1500);
  }

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
      errorFlash('One image only.');
    } else {
      fr.readAsDataURL(e.originalEvent.dataTransfer.files[0]);
    }
  });

  // upload screenshot by button
  $("#file_upload").on('change', function(){
    var elem = document.getElementById("screenshot_canvas");
    if (elem) elem.parentElement.removeChild(elem); // reset canvas
    var fr = new FileReader();
    fr.onload = imageLoaded;   // onload fires after reading is complete
    if ($(this)[0].files.length > 1) {
      errorFlash('One image only');
    } else {
      fr.readAsDataURL($(this)[0].files[0]);
    }
  });

  // handle screenshot
  function imageLoaded(p){
    var data_uri = p.currentTarget.result;
    var col_row = $('#form_grid_size').val().split('x');
    $('#status_bar').addClass('image_analysing');
    imageAnalysis(data_uri, col_row[0], col_row[1], function(result_string){
      $('#status_bar').removeClass('image_analysing');
      if (result_string) {
        board.import(result_string);
        if (result_string.indexOf('x') === -1) {
          // no x in the result, everything matched, solve the puzzle
          $('.form_solve_button:first').click();
        }
      } else {
        errorFlash('Game board not found.');
      }
    });
  }

  // TODO, this should be upgrade, and remove global variable 'globalmult'.
  // ready profile
  $('#form_profile').change(function() {
    var types = 9
    var values = this.value.replace(/\s+/g, '').split(/,/);
    for (var i = 0; i < types; ++ i) {
      $('#e' + i + '-normal').val(values[4*i]);
      $('#e' + i + '-mass').val(values[4*i+1]);
      $('#e' + i + '-row').val(values[4*i+2]);
      $('#e' + i + '-tpa').val(values[4*i+3]);
    }
    globalmult = values[4*types];
  });



  // resize solution max-height
  var setSolutionMaxHeight = function(){
    var status_bar_height = $('#status_bar').outerHeight();
    $('#solutions').css('max-height', $(window).height()-status_bar_height+'px');
  }
  setSolutionMaxHeight();//init
  $(window).on('resize', function(){
    setSolutionMaxHeight();
  });


  // prepare and draw game board
  var board = new Board('board_canvas',
    {rows: parseInt($('#form_grid_size').val().split('x')[1]),
     cols: parseInt($('#form_grid_size').val().split('x')[0]),
     draw_style: $('#form_draw_style').val()});
  var optimizer = new Optimizer({
    rows: parseInt($('#form_grid_size').val().split('x')[1]),
    cols: parseInt($('#form_grid_size').val().split('x')[0]),
    sorting: $('#form_sorting').val(),
    max_path: parseInt($('#form_max_paths').val()),
    is_8_dir_movement: $("#form_direction").val() === "8",
    max_length: parseInt($('#form_max_length').val()),
  });

  $('#form_direction').on('change', function(){
    optimizer.change8dirMovement($("#form_direction").val() === "8");
  });

  $('#form_max_paths').on('change', function(){
    optimizer.changeMaxPath(parseInt($('#form_max_paths').val()));
  });

  $('#form_grid_size').on('change', function(){
    board.changeGrid($(this).val()); // update board
    optimizer.changeGrid($(this).val());
    $("#solutions li").remove();
  });

  $('#form_draw_style').on('change', function() {
    board.changeDrawStyle($(this).val());
    if ($('#solutions li.selected').length > 0) {
      $('#solutions li.selected').click();
    }
  });

  $('#form_sorting').on('change', function() {
    optimizer.changeSorting($(this).val());
  });

  $('.form_solve_button').click(function() {
    // should not begin if board is not ready. (with '?' unknown orbs)
    if (!board.ready()) {
      errorFlash('Unknown orb(s) in board.');
      return;
    }
    // disable solve button
    $('.form_solve_button').button('loading');
    // remove all existing solutions
    $('#solutions li').remove();
    // status bar
    $('.solving_label span').text(0);
    $('#status_bar').addClass('solving');
    // redraw board, to clear path and animation
    board.redraw();
    // solve board
    optimizer.solveBoard(board.export(), function(p, max_p){ // step callback
      var percentage = parseInt(p * 100 / parseInt(max_p));
      $('.solving_label span').text(percentage);
      //$('.progress-bar').attr('aria-valuemin', percentage).css('width', percentage+'%');
    }, function(solutions){ // finish callback
      // progress bar style
      $('#status_bar').removeClass('solving');
      // handle solutions
      function _addSolutionAsLi(html_array, solution) {
        html_array.push('<li><a href="#">W=');
        html_array.push(solution.weight.toFixed(2));
        html_array.push(', L=');
        html_array.push(solution.path.length);
        html_array.push(', M=');
        html_array.push(solution.mult.toFixed(2));
        html_array.push(', &#8623;=');
        html_array.push(solution.complexity);
        html_array.push('<br/>');
        var sorted_matches = solution.matches.slice();
        sorted_matches.sort(function(a, b) {
          if (a.count != b.count) {
            return b.count - a.count;
          } else if (a.type > b.type) {
            return 1;
          } else if (a.type < b.type) {
            return -1;
          } else {
            return 0;
          }
        });
        sorted_matches.forEach(function(match, i) {
          html_array.push('<span class="gem gem');
          html_array.push(match.type);
          html_array.push('"></span>&times;');
          html_array.push(match.count);
        });
        html_array.push('</a></li>');
      }
      // display solution in HTML
      var html_array = [];
      solutions.forEach(function(solution) {
        _addSolutionAsLi(html_array, solution);
      });
      $('#solutions ol').html(html_array.join(''));
      // reset solve buttons
      $('.form_solve_button').button('reset');
    });
  });


  $('#form_max_length').on('change', function(){
    optimizer.changeMaxLength(parseInt($(this).val()));
  });


  $('#solutions').on('click', 'li', function(e) {
    // update li highlight
    $('#solutions li.selected').removeClass('selected');
    $(this).addClass('selected');
    var solution = optimizer.getSolution($(this).index());
    board.drawSolution(solution);
  });

  $('#form_randomize_button').click(function() {
    var types = $('#form_random_type').val().split(",");
    board.randomize(types);
  });

  $('#form_clear_button').click(function() {
    board.changeGrid($("#form_grid_size").val());
  });

  $('#form_drop_match_button').click(function() {
    if ($('#solutions li.selected').length > 0) {
      var index = $('#solutions li.selected').index();
      var string = optimizer.exportSolutionDropMatchesBoard(index);
      board.import(string);
    }
  });

  // final state button
  $('#form_final_state_button').click(function() {
    if ($('#solutions li.selected').length > 0) {
      var index = $('#solutions li.selected').index();
      var solution = optimizer.getSolution(index);
      board.drawSolutionFinalState(solution);
    }
  });

  // play button
  $('#form_play_button').click(function() {
    if ($('#solutions li.selected').length > 0) {
      $('#solutions li.selected').click();
    }
  });

  // import textarea only accept pre-set character.
  $("#importModal textarea").on('keydown', function (e) {
    if ($.inArray(e.keyCode, [46, 8, 9, 27]) !== -1 || // Allow: 8backspace, 46delete, 9tab, 27escape
        (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) || // Allow: Ctrl+A
        (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) || // Allow: Ctrl+C
        (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) || // Allow: Ctrl+X
        (e.keyCode == 86 && (e.ctrlKey === true || e.metaKey === true)) || // Allow: Ctrl+V
        (e.keyCode >= 35 && e.keyCode <= 40)) { // Allow: home, end, left, right
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


  // import button clicked (inside modal window)
  $('#importModal .btn-primary').click(function() {
    board.import($('#importModal textarea').val());
    $('#importModal').modal('hide');
  });

  // toggle change orbs, left and right click
  $('#changeOrbsModal .gem-target').on('click contextmenu', function(e) {
    var classes = $(this).attr('class').split(' ');
    var current_gem_class = $(classes).not(['gem-target', 'gem', 'gem-lg'])[0];
    var forward = e.type === 'click';
    $(this).removeClass("gem0 gem1 gem2 gem3 gem4 gem5 gem6 gem7 gem8 gemX");
    switch (current_gem_class) {
      case 'gem0': $(this).addClass(forward ? 'gem1' : 'gem8'); break;
      case 'gem1': $(this).addClass(forward ? 'gem2' : 'gem0'); break;
      case 'gem2': $(this).addClass(forward ? 'gem3' : 'gem1'); break;
      case 'gem3': $(this).addClass(forward ? 'gem4' : 'gem2'); break;
      case 'gem4': $(this).addClass(forward ? 'gem5' : 'gem3'); break;
      case 'gem5': $(this).addClass(forward ? 'gem6' : 'gem4'); break;
      case 'gem6': $(this).addClass(forward ? 'gem7' : 'gem5'); break;
      case 'gem7': $(this).addClass(forward ? 'gem8' : 'gem6'); break;
      case 'gem8': $(this).addClass(forward ? 'gem0' : 'gem7'); break;
      case 'gemX': $(this).addClass(forward ? 'gem0' : 'gem8'); break;
    }
    return false; // prevent right click menu popup
  });


  // reset change orbs
  $('#changeOrbsModal .btn-danger').on('click', function(){
    $('#changeOrbsModal .gem-target').each(function(){
      $(this).removeClass("gem0 gem1 gem2 gem3 gem4 gem5 gem6 gem7 gem8 gemX").addClass($(this).attr('id').split('-')[1]);
    });
  });

  // apply change orbs
  $('#changeOrbsModal .btn-primary').on('click', function(){
    var re, to_index, orginal_index;
    var board_stirng = board.export();
    $('#changeOrbsModal .gem-target').each(function(){
      orginal_index = $(this).attr('id').slice(-1);
      if (orginal_index === 'X') {
        orginal_index = '.';
      }
      to_index = $($(this).attr('class').split(' ')).not(['gem-target', 'gem', 'gem-lg'])[0].slice(-1);
      if (to_index != 'X') {
        if (orginal_index !== to_index) {
          if (orginal_index === '.') {
            re = new RegExp("\\"+orginal_index, "g");
          } else {
            re = new RegExp(orginal_index, "g");
          }
          board_stirng = board_stirng.replace(re, to_index);
        }
      }
    });
    console.log(board_stirng);
    board.import(board_stirng);
    $('#changeOrbsModal').modal('hide');
  });
});
