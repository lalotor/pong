const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Cache canvas properties
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const canvasOffsetLeft = canvas.offsetLeft;

// Ball variables
const ballRadius = 10;
const ballSpeedIncrement = 0.15;
let ballSpeed = 2.5;
let x, y, dx, dy;

// Paddle variables
const paddleHeight = 10;
const paddleWidth = 75;
const paddleSpeed = 4;
let paddleX;
let rightPressed = false;
let leftPressed = false;

resetPaddleAndBall();

// Brick variables
const brickRowCount = 4;
const brickColumnCount = 6;
const brickWidth = 60;
const brickHeight = 15;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
    bricks[c][r] = { x: brickX, y: brickY, status: 1 };
  }
}

// Score and lives variables
let score = 0;
let lives = 3;

// Initial context style properties
ctx.font = "16px Arial";

document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);
document.addEventListener("mousemove", mouseMoveHandler);

function keyHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = e.type === "keydown";
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = e.type === "keydown";
  }
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvasOffsetLeft;
  if (relativeX > 0 && relativeX < canvasWidth) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = `#FF0000`;
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.fillStyle = `#000000`;
  ctx.fillRect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight);
  ctx.closePath();
}

function drawBricks() {
  ctx.fillStyle = `#0095DD`;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const { x, y, status } = bricks[c][r];
      if (status === 1) {
        ctx.fillRect(x, y, brickWidth, brickHeight);
      }
    }
  }
}

function bricksCollisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (
        b.status === 1 &&
        x > b.x &&
        x < b.x + brickWidth &&
        y > b.y &&
        y < b.y + brickHeight
      ) {
        dy = -dy;
        b.status = 0;
        score++;
        if (score === brickColumnCount * brickRowCount) {
          showWinningMessage();
        }
      }
    }
  }
}

function ballCollisionDetection() {
  if (x + dx > canvasWidth - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvasHeight - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      ballSpeed += ballSpeedIncrement;
      dy = dy >= 0 ? -ballSpeed : ballSpeed;
    } else {
      lostBall();
    }
  }
  x += dx;
  y += dy;
}

function paddleMovement() {
  if (rightPressed && paddleX < canvasWidth - paddleWidth) {
    paddleX += paddleSpeed;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= paddleSpeed;
  }
}

function drawScore() {
  ctx.fillStyle = `#000000`;
  ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
  ctx.fillStyle = `#000000`;
  ctx.fillText(`Lives: ${lives}`, canvasWidth - 65, 20);
}

function lostBall() {
  lives--;
  if (!lives) {
    window.alert(
      `GAME OVER. You scored: ${score} points. Do you want to restart?`
    );
    window.location.reload();
  } else {
    resetPaddleAndBall();
  }
}

function resetPaddleAndBall() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = ballSpeed;
  dy = -ballSpeed;
  paddleX = (canvasWidth - paddleWidth) / 2;
}

function showWinningMessage() {
  window.alert(
    `YOU WIN, CONGRATULATIONS! You scored: ${score} points with ${lives} lives left.`
  );
  window.location.reload();
}

// Draw canvas and handle game logic
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  drawBricks();

  bricksCollisionDetection();

  ballCollisionDetection();

  paddleMovement();

  // Request next animation frame
  requestAnimationFrame(draw);
}

// Start game loop
requestAnimationFrame(draw);
