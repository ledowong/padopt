/*!
* Author: Leonardo Wong (https://github.com/ledowong)
* Path drawing credit to izenn (https://github.com/izenn/padopt) and more.
*/
'use strict';

var Board = function(canvas_id, opts){
  var _debug = false;
  var _draw_style = opts['draw_style'];
  var _canvas = document.getElementById(canvas_id);
  var _ctx = _canvas.getContext('2d');
  var _ORB_SIZE = 100; // even number
  var _GRID_SIZE = 104; // even number, larger than _ORB_SIZE.
  var _board_data = [];
  var _orbs = [];
  var _rows = opts['rows'];
  var _cols = opts['cols'];
  var _requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  var _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
  var _path_animation = {step: 0, x: null, y: null, xys: [], request_id: 0, move_distance_x: 1, move_distance_y: 1, frame_start_at: null};
  var _PATH_SQUARE_SIZE = 10; // starting point, ending point, and moving point.
  var _FPS = 60;
  var _NUMBER_OF_STEP_BETWEEN_TWO_POINT = 20; // adjust this value for the path moving speed. (20 similar to jquery animation 400ms)

  // private methods
  var _width = function(){
    return _GRID_SIZE * _cols;
  }
  var _height = function(){
    return _GRID_SIZE * _rows;
  }
  var _rowCol2xy = function(row,col){
    return {x: (_GRID_SIZE * col) + (_GRID_SIZE / 2),
            y: (_GRID_SIZE * row) + (_GRID_SIZE / 2)};
  }
  var _drawOrb = function(row, col, orb_index){
    var xy = _rowCol2xy(row, col);
    if (orb_index === null) {
      // draw circle
      _ctx.beginPath();
      _ctx.arc(xy.x + ((_GRID_SIZE - _ORB_SIZE) / 2) - 2,
               xy.y + ((_GRID_SIZE - _ORB_SIZE) / 2) - 2,
               50, 0, 2 * Math.PI);
      _ctx.fillStyle = '#444';
      _ctx.fill();
      // draw "?"
      _ctx.fillStyle = "#ccc";
      _ctx.font = "80px Courier";
      _ctx.fillText("?", xy.x - 22, xy.y + 26)
    } else {
      var width_diff = (_ORB_SIZE - ORB_IMAGE_DATA[orb_index].size) / 2;
      _ctx.drawImage(_orbs[orb_index],
        xy.x - (_GRID_SIZE / 2) + ((_GRID_SIZE - _ORB_SIZE) / 2) + width_diff,
        xy.y - (_GRID_SIZE / 2) + ((_GRID_SIZE - _ORB_SIZE) / 2) + width_diff,
        ORB_IMAGE_DATA[orb_index].size,
        ORB_IMAGE_DATA[orb_index].size);
    }
  }
  var _drawBoard = function(keep_animation){
     // cancel path animation if not finish.
    if (keep_animation !== true) {
      _cancelAnimationFrame(_path_animation.request_id);
    }
    // clear canvas
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
    // draw debug grid
    if (_debug) {
      // draw grid
      _ctx.strokeStyle="#FFFF00";
      _ctx.lineWidth=1;
      _ctx.strokeRect(0, 0, _width(), _height()); // draw border
      _ctx.fillStyle="#FF0000";
      for (var y=1; y < _rows; y++) {
        _ctx.fillRect(0, _GRID_SIZE * (y), _width(), 1);
      }
      for (var x=1; x < _cols; x++) {
        _ctx.fillRect(_GRID_SIZE * (x), 0, 1, _height());
      }
    }
    // draw orbs
    for (var y=0; y < _rows; y++) {
      for (var x=0; x < _cols; x++) {
        if (typeof(_board_data[_rowCol2index(y,x)]) === 'undefined') {
          _drawOrb(y,x,null);
        } else {
          _drawOrb(y,x,_board_data[_rowCol2index(y,x)]);
        }
      }
    }
  }
  var _rowCol2index = function(row,col){
    return (_cols * row) + col;
  }
  var _changeGrid = function (grid){
    _rows = parseInt(grid.split('x')[1]);;
    _cols = parseInt(grid.split('x')[0]);;
    _resetCanvas();
    _drawBoard();
  }
  var _import = function(string){
    var key_indexes = ORB_IMAGE_DATA.map(function(d){
      return d.key;
    });
    string.split('').forEach(function(k,i){
      if ($.inArray(k, ["0", "1", "2", "3", "4", "5", "6", "7", "8"]) !== -1 ){
        _board_data[i] = parseInt(k);
      } else {
        var new_orb_index = key_indexes.indexOf(k);
        if (new_orb_index === -1) {
          _board_data[i] = null;
        } else {
          _board_data[i] = new_orb_index;
        }
      }
    });
    _drawBoard();
  }
  var _export = function(){
    var key_indexes = ORB_IMAGE_DATA.map(function(d){
      return d.key;
    });
    var r = []
    for (var x = 0; x < _rows * _cols; x ++) {
      if (typeof(_board_data[x]) === 'undefined' || _board_data[x] === null) {
        r.push('.');
      } else {
        r.push(_board_data[x]);
      }
    }
    return r.join('');
  }
  var _randomize = function(key_array){
    var key_indexes = ORB_IMAGE_DATA.map(function(d){
      return d.key;
    });
    var index_for_random = key_array.map(function(k){
      return key_indexes.indexOf(k);
    });
    _board_data = []; // reset
    for (var x = 0; x < _rows * _cols; x ++) {
      _board_data.push(index_for_random[Math.floor((Math.random() * index_for_random.length))]);
    }
    _drawBoard();
  }
  var _coords2gridPosition = function(x, y){
    var current_width = $(_canvas).width(); // sacled by CSS
    var current_height = $(_canvas).height(); // sacled by CSS
    var row = Math.floor(x / (current_width / _cols));
    var col = Math.floor(y / (current_height / _rows));
    return [row, col];
  }
  var _toggleOrb = function(row, col, backward){
    var current_orb = _board_data[_rowCol2index(row, col)];
    var change_to_orb;
    if (typeof(current_orb) === 'undefined' || current_orb === null) {
      // is '?'
      change_to_orb = (backward === true) ? (_orbs.length - 1) : 0;
    } else {
      change_to_orb = (backward === true) ? current_orb - 1 : current_orb + 1;
      if (change_to_orb < 0 || change_to_orb >= _orbs.length) {
        change_to_orb = null;
      }
    }
    _board_data[_rowCol2index(row, col)] = change_to_orb;
    _drawBoard();
  }
  var _simplifyPath = function(xys) {
    // 1. Remove intermediate points.
    var simplified_xys = [xys[0]];
    var xys_length_1 = xys.length - 1;
    for (var i = 1; i < xys_length_1; ++ i) {
      var dx0 = xys[i].x - xys[i-1].x;
      var dx1 = xys[i+1].x - xys[i].x;
      if (dx0 === dx1) {
        var dy0 = xys[i].y - xys[i-1].y;
        var dy1 = xys[i+1].y - xys[i].y;
        if (dy0 === dy1) {
          continue;
        }
      }
      simplified_xys.push(xys[i]);
    }
    simplified_xys.push(xys[xys_length_1]);
    return simplified_xys;
  }
  var _resetCanvas = function(){
    _canvas.width = _width();
    _canvas.height = _height();
    _board_data = []; // reset data
  }
  var _drawSolutionFinalState = function(solution){
    var board_string = [].concat.apply([], solution.board).join('');
    _import(board_string);
  }
  var _drawSolution = function(solution){
    // init board with solution starting status.
    var board_string = [].concat.apply([], solution.init_board).join('');
    _import(board_string);
    // canvas
    // calc path xys
    var rc = {row: solution.init_cursor.row, col: solution.init_cursor.col}; // clone
    var xys = [_rowCol2xy(rc.row, rc.col)];
    solution.path.forEach(function(direction){
      switch (direction) {
        case 0:              rc.col += 1; break;
        case 1: rc.row += 1; rc.col += 1; break;
        case 2: rc.row += 1;              break;
        case 3: rc.row += 1; rc.col -= 1; break;
        case 4:              rc.col -= 1; break;
        case 5: rc.row -= 1; rc.col -= 1; break;
        case 6: rc.row -= 1;              break;
        case 7: rc.row -= 1; rc.col += 1; break;
      }
      xys.push(_rowCol2xy(rc.row, rc.col));
    });
    xys = _simplifyPath(xys);
    if ( _draw_style === "rounded" ) {
      xys = _avoidOverlap(xys);
    }
    // create a path animation.
    _path_animation.step = -1;
    _path_animation.xys = xys;
    _path_animation.x = xys[0].x;
    _path_animation.y = xys[0].y;
    _path_animation.frame_start_at = Date.now(); // http://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
    _path_animation.request_id = _requestAnimationFrame(_drawPathAnimation);
  }
  var _drawPath = function(xys){
    // draw path
    _ctx.lineWidth = 4;
    _ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    _ctx.beginPath();
    for (var i = 0; i < xys.length; ++ i) {
      var xy = xys[i];
      if (i === 0) {
        _ctx.moveTo(xy.x, xy.y);
      } else {
        var prev_xy = xys[i-1];
        if ( _draw_style === "rounded" ) {
          _drawLineTo2(prev_xy.x, prev_xy.y, xy.x, xy.y);
        } else {
          _drawLineTo(prev_xy.x, prev_xy.y, xy.x, xy.y);
        }
      }
    }
    _ctx.stroke();
    // darw start point
    var start_xy = xys[0];
    _ctx.lineWidth = 2;
    _ctx.fillStyle = '#f00';
    _ctx.strokeStyle = '#000';
    _ctx.beginPath();
    _ctx.rect(start_xy.x-(_PATH_SQUARE_SIZE/2), start_xy.y-(_PATH_SQUARE_SIZE/2), _PATH_SQUARE_SIZE, _PATH_SQUARE_SIZE);
    _ctx.fill();
    _ctx.stroke();
    // darw end point
    var end_xy = xys[xys.length-1];
    _ctx.fillStyle = 'lime';
    _ctx.beginPath();
    _ctx.rect(end_xy.x-(_PATH_SQUARE_SIZE/2), end_xy.y-(_PATH_SQUARE_SIZE/2), _PATH_SQUARE_SIZE, _PATH_SQUARE_SIZE);
    _ctx.fill();
    _ctx.stroke();
  }
  var _drawPathAnimation = function(){
    var current_time = Date.now();
    var elapsed = current_time - _path_animation.frame_start_at;
    var fps_interval = 1000/_FPS;
    if (elapsed <= fps_interval) {
      // not time for next frame yet.
      _path_animation.request_id = _requestAnimationFrame(_drawPathAnimation);
    } else {
      _path_animation.frame_start_at = current_time - (elapsed % fps_interval);
      // redraw whole board.
      _drawBoard(false);
      // darw path
      _drawPath(_path_animation.xys);
      // darw current position.
      _ctx.lineWidth = 2;
      _ctx.fillStyle = 'yellow';
      _ctx.strokeStyle = '#000';
      _ctx.beginPath();
      _ctx.rect(_path_animation.x-(_PATH_SQUARE_SIZE/2), _path_animation.y-(_PATH_SQUARE_SIZE/2), _PATH_SQUARE_SIZE, _PATH_SQUARE_SIZE);
      _ctx.fill();
      _ctx.stroke();
      // calculate next position.
      var target_xy = _path_animation.xys[_path_animation.step+1];
      if (typeof(target_xy) != 'undefined') {
        // console.log(_path_animation.step, _path_animation.x, target_xy.x, _path_animation.y, target_xy.y);
        // there is next step.
        var range_buffer = 2; // value 1 is not working in 8 direction mode.
        if (_path_animation.x <= target_xy.x + range_buffer &&
            _path_animation.x >= target_xy.x - range_buffer &&
            _path_animation.y <= target_xy.y + range_buffer &&
            _path_animation.y >= target_xy.y - range_buffer) {
          // we set a range (maybe +/-2), no need to 100% same. this can solve non-overlap problem, which the xy may be float.
          // we are there, so move to next one.
          _path_animation.step += 1;
          _path_animation.x = target_xy.x;
          _path_animation.y = target_xy.y;
          // next target
          var next_target_xy = _path_animation.xys[_path_animation.step+1];
          if (typeof(next_target_xy) != 'undefined') {
            _path_animation.move_distance_x = (target_xy.x > next_target_xy.x ? target_xy.x - next_target_xy.x : next_target_xy.x - target_xy.x) / _NUMBER_OF_STEP_BETWEEN_TWO_POINT;
            _path_animation.move_distance_y = (target_xy.y > next_target_xy.y ? target_xy.y - next_target_xy.y : next_target_xy.y - target_xy.y) / _NUMBER_OF_STEP_BETWEEN_TWO_POINT;
          }
        } else {
          // still not arrive target xy, keep moving.
          if (_path_animation.x !== target_xy.x) {
            _path_animation.x += (target_xy.x > _path_animation.x) ? _path_animation.move_distance_x : _path_animation.move_distance_x * -1;
          }
          if (_path_animation.y !== target_xy.y) {
            _path_animation.y += (target_xy.y > _path_animation.y) ? _path_animation.move_distance_y : _path_animation.move_distance_y * -1;
          }
        }
        _path_animation.request_id = _requestAnimationFrame(_drawPathAnimation);
      } else {
        // this is the end...
        // draw the square again with green color
        _ctx.lineWidth = 2;
        _ctx.fillStyle = 'lime';
        _ctx.strokeStyle = '#000';
        _ctx.beginPath();
        _ctx.rect(_path_animation.x-(_PATH_SQUARE_SIZE/2), _path_animation.y-(_PATH_SQUARE_SIZE/2), _PATH_SQUARE_SIZE, _PATH_SQUARE_SIZE);
        _ctx.fill();
        _ctx.stroke();
      }
    }
  }
  var _avoidOverlap = function(xys) {
    var rail_num = 5; // should be odd integer
    var rail_half = Math.floor(rail_num / 2);
    var dr = Math.max(0.08, 0.4 / rail_num);
    var rail_x = {};
    var rail_y = {};
    for (var i = 1; i < xys.length; ++ i) {
      if (xys[i].y === xys[i-1].y) {
        y = xys[i].y;
        rail_y[y] = rail_y[y] || 0;
        var dy = _ORB_SIZE * (rail_y[y] - rail_half) * dr;
        rail_y[y] = (rail_y[y] + rail_half) % rail_num;
        xys[i].y += dy;
        xys[i-1].y += dy;
      } else if (xys[i].x === xys[i-1].x) {
        x = xys[i].x;
        rail_x[x] = rail_x[x] || 0;
        var dx = _ORB_SIZE * (rail_x[x] - rail_half) * dr;
        rail_x[x] = (rail_x[x] + rail_half) % rail_num;
        xys[i].x += dx;
        xys[i-1].x += dx;
      }
    }
    return xys;
  }
  var _drawLineTo = function(px, py, x, y) {
    var mx = (px*2 + x) / 3;
    var my = (py*2 + y) / 3;
    _ctx.lineTo(mx, my);
    var dx = x - px;
    var dy = y - py;
    var dr = Math.sqrt(dx*dx + dy*dy) / 3;
    dx /= dr;
    dy /= dr;
    _ctx.lineTo(mx - (dx+dy), my + (dx-dy));
    _ctx.lineTo(mx - (dx-dy), my - (dx+dy));
    _ctx.lineTo(mx, my);
    _ctx.lineTo(x, y);
  }
  var _drawLineTo2 = function(px, py, x, y) {
    var dr = 0.1;
    var dx = _ORB_SIZE * dr * _sign(x - px);
    var dy = _ORB_SIZE * dr * _sign(y - py);
    _ctx.lineTo(px + dx, py + dy);
    _ctx.lineTo( x - dx,  y - dy);
  }
  var _sign = function(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }
  var _ready = function(){
    // no unknown orb?
    return _export().indexOf('.') === -1;
  }


  // monitor
  // left click
  _canvas.addEventListener('click', function(event) {
    var x = event.pageX - $(_canvas).offset().left,
        y = event.pageY - $(_canvas).offset().top;
    var grid_position = _coords2gridPosition(x,y);
    if (_debug) console.log('left click board', x, y, grid_position);
    _toggleOrb(grid_position[1], grid_position[0]);
  });
  // right click
  $(_canvas).on('contextmenu', function(event){
    var x = event.pageX - $(_canvas).offset().left,
        y = event.pageY - $(_canvas).offset().top;
    var grid_position = _coords2gridPosition(x,y);
    if (_debug) console.log('right click board', x, y, grid_position);
    _toggleOrb(grid_position[1], grid_position[0], true);
    return false; // disable right click content menu for canvas
  });
  var _changeDrawStyle = function(new_draw_style){
    _draw_style = new_draw_style;
  }


  // init
  ORB_IMAGE_DATA.forEach(function(data){
    var img = new Image();
    img.src = data.uri;
    _orbs.push(img);
  });
  _resetCanvas();
  _drawBoard();

  // public methods
  return {
    ready: _ready,
    changeGrid: _changeGrid,
    import: _import,
    export: _export,
    randomize: _randomize,
    drawSolution: _drawSolution,
    drawSolutionFinalState: _drawSolutionFinalState,
    changeDrawStyle: _changeDrawStyle,
    redraw: _drawBoard,
  }
}
