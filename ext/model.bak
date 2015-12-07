/**
 * 
 */
var gSolutionId = 0; //global variable used to generate solution IDs consistent across mutiple runs.
function resetSolutionIds() {
  gSolutionId = 0;
}

function Coordinate(row, col){
  this.row = row || 0;
  this.col = col || 0;
}

Coordinate.prototype.getXY = function(){
  var x = this.col * ORB_X_SEP + ORB_WIDTH/2;
  var y = this.row * ORB_Y_SEP + ORB_HEIGHT/2;
  return {x: x, y: y};
};

Coordinate.prototype.compareTo = function(coordinate){
  //rows take precedence over columns
  if (this.row > coordinate.row) {
    return -1;
  } else if (this.row < coordinate.row) {
    return 1;
  }
  if (this.col < coordinate.col) {
    return -1;
  } else if (this.col > coordinate.col) {
    return 1;
  }
  return 0;
};

//Orb inherits Coordinate
function Orb(type, row, col){
  Coordinate.call(this, row, col);
  this.type = type || "X";
}

Orb.prototype = Object.create(Coordinate.prototype);
Orb.prototype.constructor = Orb;

//override Coordinate compareTo
Orb.prototype.compareTo = function(orb){
  //type takes precedence over coordinates
  if (this.type < orb.type) {
    return -1;
  } else if (this.type > orb.type) {
    return 1;
  }
  //we don't care about position when comparing orbs
  return 0;
};

//type is a number between 0 and 6.
function Match(type, count){
  this.type = type;
  this.count = count;
}

Match.prototype.compareTo = function(match){
  //count takes precedence before type
  if (this.count > match.count) {
    return -1;
  } else if (this.count < match.count) {
    return 1;
  }
  if (this.type < match.type) {
    return -1;
  } else if (this.type > match.type) {
    return 1;
  }
  return 0;
};

function Solution(board, path, is_done, cursor, init_cursor, weight, matches){
  this.board = new Board(board.grid); //required
  this.path = path? path.slice() : new Array();
  this.is_done = is_done || false;
  this.cursor = cursor? new Coordinate(cursor.row,cursor.col) : new Coordinate();
  this.init_cursor = init_cursor? new Coordinate(init_cursor.row,init_cursor.col) : new Coordinate();;
  this.weight = weight || 0;
  this.matches = matches? matches.slice() : new Array();
  this.id = gSolutionId++;
}

Solution.prototype.insertMatch = function(match){
  this.matches = this.matches.splice(locationOf(match, this.matches)+1, 0, match);
};

Solution.prototype.solutionString = function(){
  return self.board.stateString();
};

function Board(grid){
  //grid is a Two-dimensional array of Orbs.
  this.grid = new Array(ROWS);
  var copy = (grid != null && typeof grid == "object");
  for (var i = 0; i < ROWS; ++ i) {
    this.grid[i] = new Array(COLS);
    for (var k = 0; k < COLS; ++ k) {
      if (!copy) {
        this.grid[i][k] = new Orb("X",i,k);
      } else {
        this.grid[i][k] = new Orb(grid[i][k].type,grid[i][k].row,grid[i][k].col);
      }
    }
  }
  
}

Board.prototype.clear = function(){
  this.grid = new Array(ROWS);
  for (var i = 0; i < ROWS; ++ i) {
    this.grid[i] = new Array(COLS);
    for (var k = 0; k < COLS; ++ k) {
      this.grid[i][k] = new Orb("X",i,k);
    }
  }
};

Board.prototype.refresh = function(){
  this.clear();
  var self = this;
  $('#grid > div').each(function() {
    var row = this.id.charAt(1);
    var col = this.id.charAt(2);
    var type = get_type(this);
    self.grid[row][col] = new Orb(type, row, col);
  });
};

Board.prototype.stateString = function(){
  var row, result = "";
  var self = this;
  for(var k=0;k<ROWS;++k){
    row = self.grid[k];
    for(var i=0;i<ROWS;++i){
      result += row[i].type + "";
      if( (i+1) >= ROWS && (k+1) < COLS) {
          result += "\n";
      }
    }
  }
  return result;
};
