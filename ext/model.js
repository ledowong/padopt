/**
 * 
 */
function Coordinate(row, col){
  this.row = row || 0;
  this.col = col || 0;
}

Coordinate.prototype.getXY = function(){
  var x = this.col * ORB_X_SEP + ORB_WIDTH/2;
  var y = this.row * ORB_Y_SEP + ORB_HEIGHT/2;
  return {x: x, y: y};
};
