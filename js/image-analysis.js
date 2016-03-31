/*!
* Author: Leonardo Wong (https://github.com/ledowong)
*/

'use strict';

Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

var imageAnalysis = function(screenshot_url, cols, rows, callback){
  /*****************************************************************************
  * Variables
  *****************************************************************************/
  var debug = false;
  var debug_grid = false;
  var debug_shape_dark = false;
  var debug_shape_light = true;
  var grid = [cols, rows];
  var grid_position;
  var end_results;
  var shape_results;
  var dark_mode = false;
  var screenshot_canvas = null;
  var resize_board_to = 800;

  // GEM color profile
  //                            Normal              Transparent Light BG     Transparent Dark BG
  //                     minH,maxH,  minV,  maxV  minH,maxH,  minV,  maxV  minH,maxH,  minV,  maxV
  var fire_default =    [[  5,  20, 15000, 26000],[  1,  15, 11701, 25000],[  2,  15,  5000, 15000]];
  var light_default =   [[ 45,  60, 15000, 26000],[ 30,  40, 10000, 25000],[ 30,  40,  5000, 15000]];
  var wood_default =    [[125, 150, 15000, 26000],[ 45,  85,  5000, 15000],[ 85, 130,  5000, 15000]];
  var water_default =   [[195, 215, 18000, 26000],[225, 295,  5000, 15000],[215, 255,  5000, 15000]];
  var junk_default =    [[195, 235,  8000, 17999],[  1,  15,  7000, 10000],[330, 345,  4000,  7999]];
  var poison2_default = [[268, 275, 15000, 25000],[  5,  15, 30000, 30000],[  3,  15, 30000, 30000]];
  var poison_default =  [[276, 281, 15000, 21000],[  3,  15,  9000, 11700],[340, 360,  5000, 10000]];
  var dark_default =    [[282, 300, 15000, 26000],[325, 345, 10000, 15000],[305, 329,  5000, 15000]];
  var heart_default =   [[310, 330, 15000, 26000],[340, 350, 10000, 25000],[330, 345,  8000, 15000]];
  //  {h: 344, s: 22, v: 4900}

  /*****************************************************************************
  * Helper functions
  *****************************************************************************/
  function rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b).toString(16);
  }
  function rgb2hsv(r,g,b) {
    var rr, gg, bb, h, s,
    v = Math.max(r, g, b),
    diff = v - Math.min(r, g, b),
    diffc = function (c) {
      return (v - c) / 6 / diff + 1 / 2;
    };
    if (diff === 0) {
      h = s = 0;
    } else {
      s = diff / v;
      rr = diffc(r);
      gg = diffc(g);
      bb = diffc(b);
      if (r === v) {h = bb - gg}
      else if (g === v) {h = (1 / 3) + rr - bb}
      else if (b === v) {h = (2 / 3) + gg - rr};
      if (h < 0) {h += 1}
      else if (h > 1) {h -= 1}
    }
    return {
      h: (h * 360 + 0.5) |0,
      s: (s * 100 + 0.5) |0,
      v: (v * 100 + 0.5) |0
    }
  }
  function drawFinalResult(){ // for debug
    console.log('drawFinalResult');
    console.log(end_results.join(''));
    screenshot_canvas = document.createElement('canvas');
    screenshot_canvas.id = 'screenshot_canvas';
    document.body.appendChild(screenshot_canvas);
    Caman(screenshot_canvas, screenshot_url, function () {
      // greyscale > threshold // stackBlur(10).
      this.crop(
        grid_position[2] - grid_position[0],
        grid_position[3] - grid_position[1],
        grid_position[0],
        grid_position[1]
      ).resize({
        width: resize_board_to
      }).render(function(){
        var canvas = document.getElementById('screenshot_canvas');
        var ctx = canvas.getContext("2d");
        var block_size = resize_board_to / grid[0];
        var half_block_size = block_size / 2;
        // border
        // ctx.strokeStyle="#FFFF00";
        // ctx.lineWidth=5;
        // ctx.strokeRect(0, 0, resize_board_to, block_size * grid[1]);
        // grid line
        ctx.fillStyle="#FF0000";
        for (var y=1; y < grid[1]; y++) {
          ctx.fillRect(0,
                       block_size * y,
                       resize_board_to,
                       2);
        }
        for (var x=1; x < grid[0]; x++) {
          ctx.fillRect(block_size * x,
                       0,
                       2,
                       block_size * grid[1]);
        }
        // gem color result
        for (var y=0; y < grid[1]; y++) {
          for (var x=0; x < grid[0]; x++) {
            var tx = x * half_block_size * 2 + half_block_size;
            var ty = y * half_block_size * 2 + half_block_size;
            var index = (grid[1]*y)+x+y;
            ctx.fillStyle = "#ffffff";
            ctx.font = "36px Arial";
            ctx.fillText(end_results[index],tx,ty);
            ctx.strokeStyle="#FF0000";
            ctx.lineWidth=1;
            ctx.strokeText(end_results[index],tx,ty);
          }
        }
      });
    });
  }
  function preProcessScreenshotForGemSampling(){
    if (debug) {
      console.log('preProcessScreenshotForGemSampling');
    }
    screenshot_canvas = document.createElement('canvas');
    screenshot_canvas.id = 'screenshot_canvas';
    if (!debug) {
      screenshot_canvas.style.display = 'none';
    }
    document.body.appendChild(screenshot_canvas);
    var blur = dark_mode ? 30 : 40;
    Caman(screenshot_canvas, screenshot_url, function () {
      this.crop(
        grid_position[2] - grid_position[0],
        grid_position[3] - grid_position[1],
        grid_position[0],
        grid_position[1]
      ).resize({
        width: resize_board_to
      }).stackBlur(blur).render(sampleEachGem);
    });
  }
  function preProcessScreenshotForFindingGridBorder(){
    if (debug) {
      console.log('preProcessScreenshotForFindingGridBorder');
    }
    screenshot_canvas = document.createElement('canvas');
    screenshot_canvas.id = 'screenshot_canvas';
    if (!debug) {
      screenshot_canvas.style.display = 'none';
    }
    document.body.appendChild(screenshot_canvas);
    Caman(screenshot_canvas, screenshot_url, function () {
      this.threshold(20).render(findGrid);
    });
  }
  function findShape(light_background){
    if (light_background !== true) light_background = false; // default false
    if (debug) {
      console.log('findShape', light_background === true ? 'light' : 'dark');
    }
    var block_size = resize_board_to / grid[0];
    screenshot_canvas = document.getElementById('screenshot_canvas'); // need to get again, otherwise draw not working...
    var ctx = screenshot_canvas.getContext("2d");
    if (debug) {
      ctx.strokeStyle="#FFFF00";
      ctx.lineWidth=5;
      ctx.strokeRect(0, 0, resize_board_to, block_size * grid[1]);
      ctx.fillStyle="#FF0000";
      for (var y=1; y < grid[1]; y++) {
        ctx.fillRect(0,
                     block_size * y,
                     resize_board_to,
                     2);
      }
      for (var x=1; x < grid[0]; x++) {
        ctx.fillRect(block_size * x,
                     0,
                     2,
                     block_size * grid[1]);
      }
    }
    var shape_result, p, tx, ty, sample1, sample2, sample3, sample4, d, dark_bg;
    var result_index = 0;
    for (var y=0; y < grid[1]; y++) {
      dark_bg = (y % 2 === 0);
      for (var x=0; x < grid[0]; x++) {
        if ((light_background && !dark_bg) || (!light_background && dark_bg)) {
          if (rows == 6) {
            d = 16; // 7x6
          } else {
            d = 17.5; // 6x5 / 5x4
          }
          // if this point is...
          // black: it can be Heart/Junk/Poison
          // white: it can be Circle/Poison/Poison2
          sample1 = isBlack(x * block_size + (block_size/2),
                            y * block_size + (block_size/d),
                            true);
          //******************************************************
          // if this point is...
          // black, it can be Circle/Heart/Junk/Poison/Poison2
          // white: it can be Poison/Poison2
          sample2 = isBlack(x * block_size + (block_size/19),
                            y * block_size + (block_size/19),
                            true);
          //******************************************************
          // if this point is...
          // black, it can be Circle/Heart/Junk/Poison/Poison2
          // white: it can be Poison/Poison2
          sample3 = isBlack(x * block_size + (block_size/11),
                            y * block_size + (block_size/11),
                            true);
          //******************************************************
          // we just try to make sure which gem is circle. This logic can't confirm other sharpe yet.
          if (!sample1 && sample2 && sample3) {
            shape_results[result_index] = 'o';
          } else {
            // so it is not circle. If sample 4 & 5 is white, it must be square (heart)
            sample1 = isBlack(x * block_size + (block_size/10*8),
                              y * block_size + (block_size/10*8),
                              true);
            sample2 = isBlack(x * block_size + (block_size/10*2),
                              y * block_size + (block_size/10*8),
                              true);
            if (!sample1 && !sample2) {
              // if both is white, it is heart.
              shape_results[result_index] = 's';
              if (debug && (debug_shape_dark || debug_shape_light)) {
                ctx.fillStyle = "#00ff00";
                ctx.font = "36px Arial";
                ctx.fillText("s",x * block_size+block_size/2 ,y * block_size+block_size/2);
              }
            } else {
              // oh shit, not circle and not heart?
              // sample more point...
              sample1 = isBlack(x * block_size + (block_size/30*19),
                                y * block_size + (block_size/30*16),
                                true);
              sample2 = isBlack(x * block_size + (block_size/30*11),
                                y * block_size + (block_size/30*16),
                                true);
              sample3 = isBlack(x * block_size + (block_size/30*15),
                                y * block_size + (block_size/30*13),
                                true);
              if (!sample1 && !sample2 && sample3) {
                // junk !!!
                shape_results[result_index] = 'j';
              } else {
                // still no idea what shape it is...
                // it might be poison, but it might also because above logic fail.
                // so we should not asume this is poison.
                shape_results[result_index] = '?';
              }
            }
          }
          if (debug && (debug_shape_dark || debug_shape_light)) {
            ctx.fillStyle = (shape_results[result_index] === '?') ? "#ff0000" : "#00ff00";
            ctx.font = "36px Arial";
            ctx.fillText(shape_results[result_index], x * block_size+block_size/2 , y * block_size+block_size/2);
          }
        } // if ((light_background && !dark_bg) || (!light_background && dark_bg)) {
        result_index += 1;
        dark_bg = !dark_bg; // toggle
      }
    }
    if (light_background) {
      // finish shape detection, go to color detection.
      if (debug && debug_shape_light) {
        throw('debug shape');
      }
      removeCanvas();
      preProcessScreenshotForGemSampling();
    } else {
      // only finish dark background gem, now go to gem with light background
      if (debug && debug_shape_dark) {
        throw('debug shape');
      }
      removeCanvas();
      preProcessScreenshotForFindingShape(true);
    }
  }
  function preProcessScreenshotForFindingShape(light_background){
    if (light_background !== true) light_background = false; // default false
    var threshold = 72;
    if (light_background) threshold = 82;
    if (debug) {
      console.log('preProcessScreenshotForFindingShape', threshold, light_background === true ? 'light' : 'dark');
    }
    screenshot_canvas = document.createElement('canvas');
    screenshot_canvas.id = 'screenshot_canvas';
    if (!debug) {
      screenshot_canvas.style.display = 'none';
    }
    document.body.appendChild(screenshot_canvas);
    Caman(screenshot_canvas, screenshot_url, function() {
      this.crop(
        grid_position[2] - grid_position[0],
        grid_position[3] - grid_position[1],
        grid_position[0],
        grid_position[1]
      ).resize({
        width: resize_board_to
      }).stackBlur(6).threshold(threshold).render(function(){ // best config, to make sure the background of gem is removed.
        findShape(light_background);
      }); // caman.js render
    });
  }
  function removeCanvas(){
    var elem = document.getElementById("screenshot_canvas");
    if (elem) elem.parentElement.removeChild(elem);
  }
  function isBlack(x,y, draw){
    screenshot_canvas = document.getElementById('screenshot_canvas'); // need to get again, otherwise draw not working...
    var ctx = screenshot_canvas.getContext("2d");
    var p = ctx.getImageData(x, y, 1, 1).data;
    var hex = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    if (hex == "000000") {
      if (debug && draw) {
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(x,y,1,1);
      }
      return true;
    } else {
      if (debug) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(x,y,1,1);
      }
      return false;
    }
  }
  function findGrid(){
    if (debug) {
      console.log('findGrid');
    }
    function findTopX(x, y, w, h){
      if (debug) console.log('findTopX', x, y, w, h);
      while (x > 0) {
        if (isBlack(x,y)) {
          // check the right side, see if all white, it should be HP bar if it does.
          var shifted_y = y - one_block;
          var all_black = true;
          while (y > shifted_y) {
            if (!isBlack(x,shifted_y)) {
              all_black = false;
              break;
            }
            shifted_y += sample_per_pixel;
          }
          if (all_black) {
            return x + 2; // adjustment
            break;
          }
        }
        x -= sample_per_pixel;
      }
      return 0; // if not found, return image left border.
    }
    function findBottomX(x, y, w, h){
      while (x < w) {
        if (isBlack(x,y)) {
          // check the right side, see if all white, it should be HP bar if it does.
          var shifted_y = y - one_block;
          var all_black = true;
          while (y > shifted_y) {
            if (!isBlack(x,shifted_y)) {
              all_black = false;
              break;
            }
            shifted_y += sample_per_pixel;
          }
          if (all_black) {
            return x;
            break;
          }
        }
        x += sample_per_pixel;
      }
      return w; // if not found, return image right border.
    }
    function findBottomY(topX, topY, bottomX){
      // calculate base on top XY, bottom X, and grid [6,5]
      var block_size = (bottomX - topX) / grid[0];
      // console.log(block_size, block_size * grid[1], (block_size * grid[1]) + topY);
      return (block_size * grid[1]) + topY;
    }
    function findTopY(x, y, w, h){
      while (y > 0) {
        if (isBlack(x,y)) {
          // check the right side, see if all white, it should be HP bar if it does.
          var shifted_x = x - one_block;
          var all_black = true;
          while (x > shifted_x) {
            if (!isBlack(shifted_x,y)) {
              all_black = false;
              break;
            }
            shifted_x += sample_per_pixel;
          }
          if (all_black) {
            return y + 1; // adjustment
            break;
          }
        }
        y -= sample_per_pixel;
      }
      return null;
    }
    var sample_per_pixel = 1; // must be 1, otherwise shape detection is not accurate enough.
    screenshot_canvas = document.getElementById('screenshot_canvas'); // need to get again, otherwise draw not working...
    var width = screenshot_canvas.width;
    var height = screenshot_canvas.height;
    var one_block = width / 4;
    // the position we begin with.
    var x = one_block * 2; // middle
    var y = height / 4 * 3; // not starting at the bottom, to prevent android menu bar.
    var topX = findTopX(x, y, width, height);
    var bottomX = findBottomX(x, y, width, height);
    var topY = findTopY(topX+one_block, y, width, height);
    grid_position = [topX,
                     topY,
                     bottomX,
                     findBottomY(topX, topY, bottomX)];
    if (debug && debug_grid) {
      throw('debug grid', grid_position);
    }
    removeCanvas();
    if (grid_position[0] == null || grid_position[1] == null || grid_position[2] == null || grid_position[3] == null) {
      callback(false);
    } else {
      preProcessScreenshotForGemSampling();
    }
  }
  function sampleGemToKey(hsv, result_index, dark_bg){
    var it_can_be = [];
    var mode_index = 0; // normal
    if (dark_mode) {
      mode_index = 1; // Transparent mode with light background
      if (dark_bg) {
        mode_index = 2; // Transparent mode with dark background
      }
    }
    // fire
    if (hsv.h >= fire_default[mode_index][0] && fire_default[mode_index][1] >= hsv.h &&
        hsv.v >= fire_default[mode_index][2] && fire_default[mode_index][3] >= hsv.v &&
        (!dark_mode || (dark_mode && shape_results[result_index] === 'o'))) {
      it_can_be.push('r');
    }
    // water
    if (hsv.h >= water_default[mode_index][0] && water_default[mode_index][1] >= hsv.h &&
        hsv.v >= water_default[mode_index][2] && water_default[mode_index][3] >= hsv.v &&
        (!dark_mode || (dark_mode && shape_results[result_index] === 'o'))) {
      it_can_be.push('b');
    }
    // wood
    if (hsv.h >= wood_default[mode_index][0] && wood_default[mode_index][1] >= hsv.h &&
        hsv.v >= wood_default[mode_index][2] && wood_default[mode_index][3] >= hsv.v &&
        (!dark_mode || (dark_mode && shape_results[result_index] === 'o'))) {
      it_can_be.push('g');
    }
    // light
    if (hsv.h >= light_default[mode_index][0] && light_default[mode_index][1] >= hsv.h &&
        hsv.v >= light_default[mode_index][2] && light_default[mode_index][3] >= hsv.v &&
        (!dark_mode || (dark_mode && shape_results[result_index] === 'o'))) {
      it_can_be.push('y');
    }
    // dark
    if (hsv.h >= dark_default[mode_index][0] && dark_default[mode_index][1] >= hsv.h &&
        hsv.v >= dark_default[mode_index][2] && dark_default[mode_index][3] >= hsv.v &&
        (!dark_mode || (dark_mode && shape_results[result_index] === 'o'))) {
      it_can_be.push('p');
    }
    // heart
    if (hsv.h >= heart_default[mode_index][0] && heart_default[mode_index][1] >= hsv.h &&
        hsv.v >= heart_default[mode_index][2] && heart_default[mode_index][3] >= hsv.v &&
        (!dark_mode || (dark_mode && shape_results[result_index] === 's'))) {
      it_can_be.push('h');
    }
    // junk
    if (hsv.h >= junk_default[mode_index][0] && junk_default[mode_index][1] >= hsv.h &&
        hsv.v >= junk_default[mode_index][2] && junk_default[mode_index][3] >= hsv.v &&
        (!dark_mode || (dark_mode && shape_results[result_index] === 'j'))) {
      it_can_be.push('j');
    }
    // poison
    if (hsv.h >= poison_default[mode_index][0] && poison_default[mode_index][1] >= hsv.h &&
        hsv.v >= poison_default[mode_index][2] && poison_default[mode_index][3] >= hsv.v &&
        (!dark_mode || (dark_mode && shape_results[result_index] === '?'))) {
      it_can_be.push('q');
    }
    // poison2
    if (hsv.h >= poison2_default[mode_index][0] && poison2_default[mode_index][1] >= hsv.h &&
        hsv.v >= poison2_default[mode_index][2] && poison2_default[mode_index][3] >= hsv.v &&
        (!dark_mode || (dark_mode && shape_results[result_index] === '?'))) {
      it_can_be.push('w');
    }
    if (it_can_be.length === 0 || it_can_be.length > 1) {
      return 'x' // unknown
    } else {
      return it_can_be[0];
    }
  }
  function sampleEachGem(){
    if (debug) {
      console.log('sampleEachGem');
    }
    var results = [];
    var result_index = 0;
    screenshot_canvas = document.getElementById('screenshot_canvas'); // need to get again, otherwise draw not working...
    var ctx = screenshot_canvas.getContext("2d");
    var half_block = (resize_board_to / grid[0]) / 2;
    var tx, ty, p, key, dark_bg;
    for (var y=0; y < grid[1]; y++) {
      dark_bg = (y % 2 === 0);
      for (var x=0; x < grid[0]; x++) {
        if (dark_mode) {
          // in dark mode, sample a bit lower left, not center. it will be easier for poison, heart and junk.
          tx = x * half_block * 2 + (half_block * 2 / 3);
          ty = y * half_block * 2 + (half_block * 2 / 3 * 2);
        } else {
          tx = x * half_block * 2 + half_block;
          ty = y * half_block * 2 + half_block;
        }
        p = ctx.getImageData(tx, ty, 1, 1).data;
        key = sampleGemToKey(rgb2hsv(p[0], p[1], p[2]), result_index, dark_bg);
        if (debug || key === 'x') {
          console.log(y+1, x+1, rgb2hsv(p[0], p[1], p[2]), key,( shape_results ? shape_results[result_index] : null), dark_bg);
        }
        if (debug) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "30px Arial";
          ctx.fillText(key,tx,ty);
        }
        results.push(key);
        result_index += 1;
        dark_bg = !dark_bg; // toggle
      }
    }
    end_results = results;
    removeCanvas();
    var unique_result = end_results.getUnique().sort();
    if (!dark_mode &&
        ((unique_result.length === 1 && unique_result[0] === 'x') ||
         (unique_result.length === 2 && unique_result[0] === 'j' && unique_result[1] === 'x'))) {
      // can found the board border, but all gem is X... maybe dark mode?
      // (sometimes blue will detected as Junk too...)
      if (debug) {
        console.log('go dark mode');
      }
      dark_mode = true;
      shape_results = []; // reset, just incase
      preProcessScreenshotForFindingShape(); // dark mode need detect the gem shape a little bit.
    } else {
      if (debug) {
        drawFinalResult();
      } else {
        // $('#import-textarea').val(results.join(''));
        // $('#import-import').click();
        callback(end_results.join(''));
      }
    }
  }

  /*****************************************************************************
  * Main logic
  *****************************************************************************/
  removeCanvas();
  preProcessScreenshotForFindingGridBorder();

}
