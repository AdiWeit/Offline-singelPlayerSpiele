const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "WHITE"; // color of an empty square

// draw a square
function drawSquare(x,y,color, board){
  console.log("next scrare");
  try {
    ctx[board].fillStyle = color;
    ctx[board].fillRect(x*SQ,y*SQ,SQ,SQ);

    ctx[board].strokeStyle = "BLACK";
    ctx[board].strokeRect(x*SQ,y*SQ,SQ,SQ);
  } catch (e) {
    console.log("abc");
  }
  }

// create the board

let board = [[], []];
for (var i = 0; i < board.length; i++) {
for( r = 0; r <ROW; r++){
    board[i][r] = [];
    for(c = 0; c < COL; c++){
        board[i][r][c] = VACANT;
    }
  }
}

const ctx = [];
for (var i = 0; i < board.length; i++) {
  ctx[i] = document.getElementById("tetris " + i).getContext("2d");
}
const scoreElement = document.getElementById("score");

// draw the board
function drawBoard(){
  console.log("draw board");
  for (var i = 0; i < board.length; i++) {
    for( r = 0; r <ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[i][r][c], i);
        }
    }
  }
}

drawBoard();

// the pieces and their colors

const PIECES = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];

// generate random pieces

function randomPiece(board){
  // for (var i = 0; i < board.length; i++) {
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece( PIECES[r][0],PIECES[r][1], board);
  // }
}

let p = [];
for (var i = 0; i < board.length; i++) {
  p[i] = randomPiece(i);
}

// The Object Piece

function Piece(tetromino,color, board){
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0; // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // we need to control the pieces
    this.x = 3;
    this.y = -2;
    this.board = board;
    this.locked = false;
    this.waitingForNewPiece = false;
}

// fill function

Piece.prototype.fill = function(color){
  console.log("fill");
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we draw only occupied squares
            if( this.activeTetromino[r][c]){
                drawSquare(this.x + c,this.y + r, color, this.board);
            }
        }
    }
}

// draw a piece to the board

Piece.prototype.draw = function(){
  console.log("draw");
    this.fill(this.color);
}

// undraw a piece


Piece.prototype.unDraw = function(){
  console.log("unDraw");
    this.fill(VACANT);
}

// move Down the piece

Piece.prototype.moveDown = function(){
  console.log("moveDown");
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else if (!this.locked){
        // we lock the piece and generate a new one
        this.lock();
        console.log("new for " + this.board);
        var waiting = 0;
        for (var i = 0; i < board.length; i++) {
          if (p[p.length - 1 - i].waitingForNewPiece) waiting++;
        }
        if (waiting == board.length) {
          for (var i = 0; i < board.length; i++) {
            p.push(randomPiece(i));
            addedI++;
          }
          // update the board
          drawBoard();
        }
    }

}

// move Right the piece
Piece.prototype.moveRight = function(){
  console.log("moveRight");
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// move Left the piece
Piece.prototype.moveLeft = function(){
  console.log("moveLeft");
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// rotate the piece
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;

    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }

    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function(){
  console.log("lock");
  this.locked = true;
  this.waitingForNewPiece = true;
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the vacant squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 0){
                alert("Game Over");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the piece
            board[this.board][this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[this.board][r][c] != VACANT);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[this.board][y][c] = board[this.board][y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < COL; c++){
                board[this.board][0][c] = VACANT;
            }
            // increment the score
            score += 10;
        }
    }

    // update the score
    scoreElement.innerHTML = score;
}

// collision fucntion

Piece.prototype.collision = function(x,y,piece){
  console.log("collision");
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // if the square is empty, we skip it
            if(!piece[r][c]){
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // conditions
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            // skip newY < 0; board[-1] will crush our game
            if(newY < 0){
                continue;
            }
            // check if there is a locked piece alrady in place
            try {
              if( board[this.board][newY][newX] != VACANT){
                return true;
              }
            } catch (e) {
              console.log("debug");
            }
        }
    }
    return false;
}

// CONTROL the piece

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
  for (var i = 0; i < board.length; i++) {
    if(event.keyCode == 37){
        p[p.length - 1 - i].moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p[p.length - 1 - i].rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p[p.length - 1 - i].moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p[p.length - 1 - i].moveDown();
    }
  }
}

// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
var addedI = 0;
function drop(){
  console.log("drop");
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
      for (var i = 0; i < board.length; i++) {
        // var activeP = [];
        // for (var pNow of p) {
        //   if (pNow.y >= 0 || p.length == board.length) activeP.push(pNow);
        // }
        p[/*activeP*/p.length - i - 1 - addedI].moveDown();
      }
      addedI = 0;
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();
