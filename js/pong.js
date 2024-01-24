const game = new Phaser.Game(800, 600, Phaser.CANVAS, null, {
  preload,
  create,
  update,
});

const paddleSpeed = 4;
const ballSpeed = 350;
const verticalPadding = 25;
const speedIncrement = 10;

let graphics;
let table;
let leftPaddle;
let rightPaddle;
let ball;
let leftScore = 0;
let rightScore = 0;

function preload() {
  game.world.setBounds(10, 10, 750, 550);

  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = "#000";

  game.load.image("paddle", "img/v-paddle.png");
  game.load.image("ball", "img/ball.png");
  game.load.spritesheet("ball", "img/wobble.png", 20, 20);
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  graphics = game.add.graphics(0, 0);
  graphics.lineStyle(2, 0xffffff);
  graphics.drawRoundedRect(20, 20, 780, 580, 20);
  graphics.moveTo(400, 20);
  graphics.lineTo(400, 600);

  leftPaddle = game.add.sprite(
    game.world.width * 0.045,
    game.world.height * 0.57,
    "paddle"
  );
  leftPaddle.anchor.set(0.5, 1);
  game.physics.enable(leftPaddle, Phaser.Physics.ARCADE);
  leftPaddle.body.immovable = true;

  rightPaddle = game.add.sprite(
    game.world.width * 0.98,
    game.world.height * 0.57,
    "paddle"
  );
  rightPaddle.anchor.set(0.5, 1);
  game.physics.enable(rightPaddle, Phaser.Physics.ARCADE);
  rightPaddle.body.immovable = true;

  ball = game.add.sprite(
    game.world.width * 0.5,
    game.world.height * 0.5,
    "ball"
  );
  ball.animations.add("wobble", [0, 1, 0, 2, 0, 1, 0, 2, 0], 24);
  ball.anchor.set(0.5);
  game.physics.enable(ball, Phaser.Physics.ARCADE);
  ball.body.collideWorldBounds = true;
  ball.body.bounce.set(1);
  game.physics.arcade.checkCollision.left = false;
  game.physics.arcade.checkCollision.right = false;
  ball.checkWorldBounds = true;
  ball.events.onOutOfBounds.add(ballLeaveScreen, this);
  ball.body.velocity.set(
    randomDirection() * ballSpeed,
    randomDirection() * ballSpeed
  );
}

function update() {
  game.physics.arcade.collide(ball, leftPaddle, ballHitLeftPaddle);
  game.physics.arcade.collide(ball, rightPaddle, ballHitRightPaddle);

  leftPaddleInputHandler();
}

function leftPaddleInputHandler() {
  // Enable / Disable mouse input
  //leftPaddle.y = game.input.y || game.world.height * 0.57;

  if (
    game.input.keyboard.isDown(Phaser.KeyCode.UP) ||
    game.input.keyboard.isDown(Phaser.KeyCode.W)
  ) {
    if (leftPaddle.y >= leftPaddle.height + verticalPadding) {
      leftPaddle.y -= paddleSpeed;
    }
  } else if (
    game.input.keyboard.isDown(Phaser.KeyCode.DOWN) ||
    game.input.keyboard.isDown(Phaser.KeyCode.S)
  ) {
    if (leftPaddle.y <= game.world.height - 5) {
      leftPaddle.y += paddleSpeed;
    }
  }
}

function ballHitLeftPaddle(ball, paddle) {
  ball.animations.play("wobble");
  setRandomBallDirection();
  increaseBallSpeed();
}

function ballHitRightPaddle(ball, paddle) {
  ball.animations.play("wobble");
  setRandomBallDirection();
  increaseBallSpeed();
}

function setRandomBallDirection() {
  ball.body.velocity.set(
    randomDirection() * ball.body.velocity.x,
    randomDirection() * ball.body.velocity.y
  );
}

function increaseBallSpeed() {
  let xSpeedIncrement =
    ball.body.velocity.x >= 0 ? speedIncrement : -1 * speedIncrement;
  let ySpeedIncrement =
    ball.body.velocity.y >= 0 ? speedIncrement : -1 * speedIncrement;

  ball.body.velocity.x += xSpeedIncrement;
  ball.body.velocity.y += ySpeedIncrement;
}

function randomDirection() {
  return Math.random() < 0.5 ? 1 : -1;
}

function ballLeaveScreen() {
  if (ball.body.velocity.x > 0) {
    leftScore++;
  } else {
    rightScore++;
  }

  let ballXVelocity = ball.body.velocity.x;
  let ballYVelocity = ball.body.velocity.y;
  ball.reset(game.world.width * 0.5, game.world.height * 0.5);
  ball.body.velocity.set(
    randomDirection() * ballXVelocity,
    randomDirection() * ballYVelocity
  );
}
