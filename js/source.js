
// enable bootstrap tooltip
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
})

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
  fr.onload = createImage;   // onload fires after reading is complete
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
  imageAnalysis(canvas.toDataURL("image/png"), COLS, ROWS, function(result_string){
    if (result_string) {
      $('#import-textarea').val(result_string);
      $('#import-import').click();
      if (result_string.indexOf('x') === -1) {
        // no x in the result, everything matched, solve the puzzle
        $('#solve').click();
      }
    } else {
      alert('Game board not found.')
    }
  });
  canvas = null; // clear
}


var board = new Board('6x5');

$('#grid_size').on('change', function(){
  board.changeGrid($(this).val());
});
