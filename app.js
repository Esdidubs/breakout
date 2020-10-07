// global ball variables
let ballX = 75;
let ballSpeedX = 5;
let ballY = 75;
let ballSpeedY = 7;
let ballSize = 10;
let startGame;


// global brick variables
const BRICK_W = 80;
const BRICK_H = 30;
const BRICK_GAP = 5;
const BRICK_COLS = 10;
const BRICK_ROWS = 7;
let brickGrid = new Array(BRICK_COLS * BRICK_ROWS)
let bricksLeft = 0;

// global paddle variables
const PADDLE_WIDTH = 150;
const PADDLE_THICKNESS = 20;
const PADDLE_DIST_FROM_EDGE = 35;
let paddleX = 400;

// other global variables
let canvas, canvasContext;
let mouseX = -100;
let mouseY = -100;
let score = 0;
let level = 1;

// mouse position for debugging
function updateMousePos(event){
    let rect = canvas.getBoundingClientRect();
    let root = document.documentElement;

    mouseX = event.clientX - rect.left - root.scrollLeft;
    mouseY = event.clientY - rect.top - root.scrollTop;

    paddleX = mouseX - PADDLE_WIDTH/2;
}

function brickReset() {
    bricksLeft = 0;
    let i;
    for(i=0; i<BRICK_COLS * 2; i++){
        brickGrid[i] = false;
    }
    for(; i<BRICK_COLS * BRICK_ROWS; i++){
        brickGrid[i] = true;
        bricksLeft++;
    }
}

window.onload = function(){
    canvas = document.getElementById('gameCanvas'); // so we can get width and height
    canvasContext = canvas.getContext('2d'); // this is the actual canvas 

    let framesPerSecond = 30;
    startGame = setInterval(updateAll, 1000/framesPerSecond);   

    canvas.addEventListener('mousemove', updateMousePos)
    brickReset();
    ballReset();
}

function setScore(){
    document.getElementById("score").innerHTML = "Score: " + score;

}

function updateAll(){
    moveAll();
    drawAll();
    setScore();
}

function ballReset(){
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
}

function ballMove(){
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // ball hits the right screen
    if(ballX > canvas.width - ballSize && ballSpeedX > 0){
        ballSpeedX = -ballSpeedX;
    }

    // ball hits the left screen
    if(ballX < 0 + ballSize && ballSpeedX < 0){
        ballSpeedX = -ballSpeedX;
    }

    // ball hits the top screen
    if(ballY < 0 + ballSize && ballSpeedY < 0){
        ballSpeedY = -ballSpeedY;
    }

    // ball goes off bottom screen
    if(ballY > canvas.height - ballSize){
       // ballReset();
       // brickReset();
       // score = 0;
      //  level = 1;
      clearInterval(startGame); 
      startGame = setInterval(gameOver, 100);   
 
    }
}

function gameOver(){
    colorRect(0,0, canvas.clientWidth, canvas.height, 'black');
    canvasContext.font = "140px Arial";
    canvasContext.fillStyle = "red";
    canvasContext.fillText("Game Over", 20, canvas.height/2);
}

function ballBrickHandling(){
     // ball collisions
     let ballBrickCol = Math.floor(ballX / BRICK_W);
     let ballBrickRow = Math.floor(ballY / BRICK_H);
     let brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow)   
     
    if(ballBrickCol >= 0 && ballBrickCol < BRICK_COLS &&
        ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS){
         if(brickGrid[brickIndexUnderBall]){
             brickGrid[brickIndexUnderBall] = false;
             bricksLeft--;
             score += level;
             
            let prevBallX = ballX - ballSpeedX;
            let prevBallY = ballY - ballSpeedY;
            let prevBrickCol = Math.floor(prevBallX/BRICK_W);
            let prevBrickRow = Math.floor(prevBallY/BRICK_H);

            let bothTestsFailed = true;
            
            if(prevBrickCol != ballBrickCol){
                let adjBrickSide = rowColToArrayIndex(prevBrickCol, ballBrickRow);

                // make sure no brick the ball is overlapping before this collision
                if(!brickGrid[adjBrickSide]){
                    ballSpeedX = -ballSpeedX;
                    bothTestsFailed = false;
                }
                
            }
            if(prevBrickRow != ballBrickRow){
                let adjBrickTopBot = rowColToArrayIndex(ballBrickCol, prevBrickRow);

                // make sure no brick the ball is overlapping before this collision
                if(!brickGrid[adjBrickTopBot]){
                    ballSpeedY = -ballSpeedY;
                    bothTestsFailed = false;
                }
            }
            // stops ball from going in between two bricks
            if(bothTestsFailed){
                ballSpeedX = -ballSpeedX;
                ballSpeedY = -ballSpeedY;
            }
             
         } // end of brick found      
     } // end of col/row validation
}

function ballPaddleHandling(){
    let paddleTopEdge = canvas.height - PADDLE_DIST_FROM_EDGE;
    let paddleBottomEdge = paddleTopEdge + PADDLE_THICKNESS;
    let paddleLeftEdge = paddleX;
    let paddleRightEdge = paddleLeftEdge + PADDLE_WIDTH;

    if(ballY > paddleTopEdge - ballSize && 
       ballY < paddleBottomEdge && 
       ballX > paddleLeftEdge && 
       ballX < paddleRightEdge && 
       ballSpeedY > 0){
        ballSpeedY = -ballSpeedY;
        let centerOfPaddle = paddleX + PADDLE_WIDTH/2;
        let ballDistFromPaddleCenter = ballX - centerOfPaddle;
        ballSpeedX = ballDistFromPaddleCenter * 0.35;

        if(bricksLeft == 0){
            brickReset();
            level++;
        }
    }

    
}

function moveAll(){
    ballMove();
    ballBrickHandling();
    ballPaddleHandling();
};

function drawAll(){
    // canvas background
    colorRect(0,0, canvas.clientWidth, canvas.height, 'black');

    // ball
    colorCircle(ballX, ballY, ballSize, 'white');

    // paddle
    colorRect(paddleX, canvas.height - PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'white');

    //bricks
    drawBricks();    
};

function rowColToArrayIndex(col, row){
    return col + BRICK_COLS * row;
}

function drawBricks(){
    for(let eachRow = 0; eachRow < BRICK_ROWS; eachRow++){
        for(let eachCol=0; eachCol<BRICK_COLS; eachCol++){

            let arrayIndex = rowColToArrayIndex(eachCol, eachRow);

            if(brickGrid[arrayIndex]){
                colorRect(BRICK_W * eachCol, BRICK_H * eachRow, BRICK_W - BRICK_GAP, BRICK_H - BRICK_GAP, 'blue');
            } // end of is brick true
        } // end of brick for loop
    } // end of row for loop
} // end of drawBricks()

function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor){
    canvasContext.fillStyle = fillColor;
    canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function colorCircle(centerX, centerY, radius, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
    canvasContext.fill();
}

function colorText(showWords, textX, textY, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX, textY);
}
