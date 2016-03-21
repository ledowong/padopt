'use strict';

$('body').on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
  e.preventDefault();
  e.stopPropagation();
})
// .on('dragover dragenter', function() {
//   $form.addClass('is-dragover');
// })
// .on('dragleave dragend drop', function() {
//   $form.removeClass('is-dragover');
// })
.on('drop', function(e) {
  // droppedFiles = e.originalEvent.dataTransfer.files;
  var elem = document.getElementById("screenshot_canvas");
  if (elem) elem.parentElement.removeChild(elem); // reset canvas
  var fr = new FileReader();
  fr.onload = createImage;   // onload fires after reading is complete
  fr.readAsDataURL(e.originalEvent.dataTransfer.files[0]);    // begin reading
});

// $("#upload_screenshot").on('change', function(){
//   var elem = document.getElementById("screenshot_canvas");
//   if (elem) elem.parentElement.removeChild(elem); // reset canvas
//   var fr = new FileReader();
//   fr.onload = createImage;   // onload fires after reading is complete
//   fr.readAsDataURL($(this)[0].files[0]);    // begin reading
// });

function createImage(p){
  var img = new Image();
  img.onload = imageLoaded;
  img.src = p.currentTarget.result;
}

function imageLoaded(p){
  var img = p.path[0];
  var canvas = document.createElement('canvas');
  canvas.width = img.width;      // set canvas size big enough for the image
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img,0,0);         // draw the image
  screenshot_url = canvas.toDataURL("image/png");  // get the data URL
  canvas = null; // clear
  preProcessScreenshotForFindingGridBorder();
}


//                    minH,maxH,  minV,  maxV
var fire_default =    [  5,  15, 15000, 26000];
var light_default =   [ 45,  60, 15000, 26000];
var wood_default =    [125, 150, 15000, 26000];
var water_default =   [195, 215, 18000, 26000];
var junk_default =    [205, 210, 13000, 19000];
var poison2_default = [268, 275, 15000, 25000];
var poison_default =  [276, 284, 15000, 21000];
var dark_default =    [285, 300, 15000, 26000];
var heart_default =   [315, 330, 15000, 26000];

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
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
};

function drawFinalResult(){ // for debug
  // console.log('preProcessScreenshotForGemSampling');
  console.log(end_results.join(''));
  screenshot_canvas = document.createElement('canvas');
  screenshot_canvas.id = 'screenshot_canvas';
  document.body.appendChild(screenshot_canvas);
  Caman(screenshot_canvas, screenshot_url, function () {
    // greyscale > threshold // stackBlur(10).
    this.resize({
      width: 1024
    }).render(function(){
      var canvas = document.getElementById('screenshot_canvas');
      var ctx = canvas.getContext("2d");
      ctx.strokeStyle="#FFFF00";
      ctx.lineWidth=5;
      ctx.strokeRect(grid_position[0], grid_position[1], grid_position[2] - grid_position[0], grid_position[3] - grid_position[1]);
      var half_width = ((grid_position[2] - grid_position[0]) / grid[0]) / 2;
      var half_height = ((grid_position[3] - grid_position[1]) / grid[1]) / 2;
      for (var y=0; y < grid[1]; y++) {
        for (var x=0; x < grid[0]; x++) {
          var tx = x * half_width * 2 + half_width + grid_position[0];
          var ty = y * half_height * 2 + half_width + grid_position[1];
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
  // console.log('preProcessScreenshotForGemSampling');
  screenshot_canvas = document.createElement('canvas');
  screenshot_canvas.id = 'screenshot_canvas';
  screenshot_canvas.style = 'display:none';
  document.body.appendChild(screenshot_canvas);
  Caman(screenshot_canvas, screenshot_url, function () {
    // greyscale > threshold // stackBlur(10).
    this.resize({
      width: 1024
    }).stackBlur(60).render(sampleEachGem);
  });
}

function preProcessScreenshotForFindingGridBorder(){
  // console.log('preProcessScreenshotForFindingGridBorder');
  screenshot_canvas = document.createElement('canvas');
  screenshot_canvas.id = 'screenshot_canvas';
  screenshot_canvas.style = 'display:none';
  document.body.appendChild(screenshot_canvas);
  Caman(screenshot_canvas, screenshot_url, function () {
    // greyscale > threshold // stackBlur(10).
    this.resize({
      width: 1024
    }).threshold(20).render(findGrid);
  });
}

function findGrid(){
  // console.log('findGrid');
  function isBlack(x,y){
    var p = ctx.getImageData(x, y, 1, 1).data;
    var hex = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    if (hex == "000000") {
      ctx.fillStyle = "#FFFF00";
      ctx.fillRect(x,y,1,1);
      return true;
    } else {
      ctx.fillStyle = "#FF0000";
      ctx.fillRect(x,y,1,1);
      return false;
    }
  }
  function findTopX(x, y, w, h){
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
          return x;
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
        var shifted_x = one_block * 2;
        var all_black = true;
        while (x < shifted_x) {
          if (!isBlack(shifted_x,y)) {
            all_black = false;
            break;
          }
          shifted_x -= sample_per_pixel;
        }
        if (all_black) {
          return y;
          break;
        }
      }
      y -= sample_per_pixel;
    }
    return null;
  }
  var sample_per_pixel = 2;
  screenshot_canvas = document.getElementById('screenshot_canvas'); // need to get again, otherwise draw not working...
  var ctx = screenshot_canvas.getContext("2d");
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
  var elem = document.getElementById("screenshot_canvas");
  elem.parentElement.removeChild(elem); // reset canvas
  if (grid_position[0] == null || grid_position[1] == null || grid_position[2] == null || grid_position[3] == null) {
    // TODO, show error message
  } else {
    preProcessScreenshotForGemSampling();
  }
}
function sampleGemToKey(hsv){
  // fire
  if (hsv.h >= fire_default[0] && fire_default[1] >= hsv.h &&
      hsv.v >= fire_default[2] && fire_default[3] >= hsv.v) {
    return 'r';
  }
  // water
  if (hsv.h >= water_default[0] && water_default[1] >= hsv.h &&
      hsv.v >= water_default[2] && water_default[3] >= hsv.v) {
    return 'b';
  }
  // wood
  if (hsv.h >= wood_default[0] && wood_default[1] >= hsv.h &&
      hsv.v >= wood_default[2] && wood_default[3] >= hsv.v) {
    return 'g';
  }
  // light
  if (hsv.h >= light_default[0] && light_default[1] >= hsv.h &&
      hsv.v >= light_default[2] && light_default[3] >= hsv.v) {
    return 'y';
  }
  // dark
  if (hsv.h >= dark_default[0] && dark_default[1] >= hsv.h &&
      hsv.v >= dark_default[2] && dark_default[3] >= hsv.v) {
    return 'p';
  }
  // heart
  if (hsv.h >= heart_default[0] && heart_default[1] >= hsv.h &&
      hsv.v >= heart_default[2] && heart_default[3] >= hsv.v) {
    return 'h';
  }
  // junk
  if (hsv.h >= junk_default[0] && junk_default[1] >= hsv.h &&
      hsv.v >= junk_default[2] && junk_default[3] >= hsv.v) {
    return 'j';
  }
  // poison
  if (hsv.h >= poison_default[0] && poison_default[1] >= hsv.h &&
      hsv.v >= poison_default[2] && poison_default[3] >= hsv.v) {
    return 'q';
  }
  // poison2
  if (hsv.h >= poison2_default[0] && poison2_default[1] >= hsv.h &&
      hsv.v >= poison2_default[2] && poison2_default[3] >= hsv.v) {
    return 'w';
  }
  return 'x'; // unknown
}
function sampleEachGem(){
  var results = [];
  screenshot_canvas = document.getElementById('screenshot_canvas'); // need to get again, otherwise draw not working...
  var ctx = screenshot_canvas.getContext("2d");
  var half_width = ((grid_position[2] - grid_position[0]) / grid[0]) / 2;
  var half_height = ((grid_position[3] - grid_position[1]) / grid[1]) / 2;
  for (var y=0; y < grid[1]; y++) {
    for (var x=0; x < grid[0]; x++) {
      var tx = x * half_width * 2 + half_width + grid_position[0];
      var ty = y * half_height * 2 + half_width + grid_position[1];
      var p = ctx.getImageData(tx, ty, 1, 1).data;
      var key = sampleGemToKey(rgb2hsv(p[0], p[1], p[2]));
      ctx.fillStyle = "#ffffff";
      ctx.font = "30px Arial";
      ctx.fillText(key,tx,ty);
      // console.log(y+1, x+1, rgb2hsv(p[0], p[1], p[2]), key);
      results.push(key);
    }
  }
  var elem = document.getElementById("screenshot_canvas");
  elem.parentElement.removeChild(elem); // reset canvas
  // TODO, push results to input.
  //end_results = results;
  $('#import-textarea').val(results.join(''));
  $('#import-import').click();
  //drawFinalResult();
}

var grid = [COLS, ROWS]; // 6x5
var grid_position;
//var end_results;
var screenshot_url = "";
var screenshot_canvas = null;
//preProcessScreenshotForFindingGridBorder();
