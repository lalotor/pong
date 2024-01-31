const game = new Phaser.Game(800, 600, Phaser.CANVAS, null, {
  preload,
  create,
  update,
});

const ballXVelocitySeed = 400;
const ballYVelocitySeed = 350;
const paddleSpeed = 6;
const verticalPadding = 25;
const ballSpeedIncrement = 5;
const textStyle = {
  font: "24px Arial",
  fill: "#0A0",
};
const MODE_HUMAN_VS_COMPUTER = 1;
const MODE_HUMAN_VS_HUMAN = 2;
const MODE_COMPUTER_VS_COMPUTER = 3;

let graphics;
let table;
let leftPaddle;
let rightPaddle;
let ball;
let leftScore = 0;
let rightScore = 0;
let leftScoreText;
let rightScoreText;
let winningScore = 10;
let optionsButton;
let pongState;
let mode;
let modeDesc;
let currentStateText;
let leftWinningMessage;
let rightWinningMessage;
let leftPaddleBehavior = leftPaddleInputHandler;
let rightPaddleBehavior = rightPaddleComputerPlay;

function preload() {
  game.world.setBounds(10, 10, 750, 550);

  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = "#000";

  game.load.image("paddle", "img/v-paddle.png");
  game.load.image("ball", "img/ball.png");
  game.load.image("options-button", "img/hamburger-button.png");
  game.load.spritesheet("ball", "img/wobble.png", 20, 20);

  pongState = JSON.parse(localStorage.getItem("pong"));
  if (pongState) {
    winningScore = pongState.winningScore;
    mode = pongState.mode;
  }

  setMode();
}

function setMode() {
  switch (mode) {
    case MODE_HUMAN_VS_HUMAN:
      leftPaddleBehavior = leftPaddleInputHandler;
      rightPaddleBehavior = rightPaddleInputHandler;
      modeDesc = "Human vs human";
      leftWinningMessage = "Left player won the game :), congratulations!";
      rightWinningMessage = "Right player won the game :), congratulations!";
      break;
    case MODE_COMPUTER_VS_COMPUTER:
      leftPaddleBehavior = leftPaddleComputerPlay;
      rightPaddleBehavior = rightPaddleComputerPlay;
      modeDesc = "Computer vs computer";
      leftWinningMessage = "Lefty won the game!";
      rightWinningMessage = "Righty won the game!";
      break;
    default:
      leftPaddleBehavior = leftPaddleInputHandler;
      rightPaddleBehavior = rightPaddleComputerPlay;
      modeDesc = "Human vs computer";
      leftWinningMessage = "You won the game :), congratulations!";
      rightWinningMessage = "Computer won the game :(, keep trying!";
      break;
  }
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
    game.world.height * Math.random(),
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
    randomDirection(createArrayWithNearValues(ballXVelocitySeed)),
    randomDirection(createArrayWithNearValues(ballYVelocitySeed))
  );

  leftScoreText = game.add.text(
    game.world.width / 4,
    game.world.height / 15,
    `${leftScore}`,
    textStyle
  );
  rightScoreText = game.add.text(
    (game.world.width / 4) * 3,
    game.world.height / 15,
    `${rightScore}`,
    textStyle
  );
  optionsButton = game.add.button(
    (game.world.width / 25) * 24.4,
    (game.world.height / 25) * 24.2,
    "options-button",
    showOptions,
    this,
    0,
    0,
    0
  );
  optionsButton.anchor.set(0.5);
  optionsButton.alpha = 0.5;
  currentStateText = game.add.text(
    (game.world.width / 25) * 1,
    (game.world.height / 25) * 23,
    `Winning score: ${winningScore}\n` + `Game mode:  ${modeDesc}\n`,
    {
      font: "15px Arial",
      fill: "#0A0",
    }
  );
  currentStateText.alpha = 0.4;
}

function update() {
  game.physics.arcade.collide(ball, leftPaddle, ballHitLeftPaddle);
  game.physics.arcade.collide(ball, rightPaddle, ballHitRightPaddle);

  leftPaddleBehavior();
  rightPaddleBehavior();
}

function leftPaddleInputHandler() {
  // Enable / Disable mouse input
  //leftPaddle.y = game.input.y || game.world.height * 0.57;
  paddleInputHandler(leftPaddle, Phaser.KeyCode.W, Phaser.KeyCode.S);
}

function rightPaddleInputHandler() {
  paddleInputHandler(rightPaddle, Phaser.KeyCode.UP, Phaser.KeyCode.DOWN);
}

function paddleInputHandler(paddle, upKeyCode, downKeyCode) {
  if (game.input.keyboard.isDown(upKeyCode)) {
    if (paddle.y >= paddle.height + verticalPadding) {
      paddle.y -= paddleSpeed;
    }
  } else if (game.input.keyboard.isDown(downKeyCode)) {
    if (paddle.y <= game.world.height - 5) {
      paddle.y += paddleSpeed;
    }
  }
}

function rightPaddleComputerPlay() {
  if (
    ball.body.velocity.x > 0 &&
    ball.y >= rightPaddle.height + verticalPadding
  ) {
    rightPaddle.y = ball.y;
  }
}

function leftPaddleComputerPlay() {
  if (
    ball.body.velocity.x < 0 &&
    ball.y >= leftPaddle.height + verticalPadding
  ) {
    leftPaddle.y = ball.y;
  }
}

function ballHitLeftPaddle(ball, paddle) {
  ball.animations.play("wobble");
  setRandomBallDirection();
  increaseBallVelocity();
}

function ballHitRightPaddle(ball, paddle) {
  ball.animations.play("wobble");
  setRandomBallDirection();
  increaseBallVelocity();
}

function setRandomBallDirection() {
  ball.body.velocity.set(
    randomDirection(createArrayWithNearValues(Math.abs(ball.body.velocity.x))),
    randomDirection(createArrayWithNearValues(Math.abs(ball.body.velocity.y)))
  );
}

function increaseBallVelocity() {
  let xSpeedIncrement =
    ball.body.velocity.x >= 0 ? ballSpeedIncrement : -1 * ballSpeedIncrement;
  let ySpeedIncrement =
    ball.body.velocity.y >= 0 ? ballSpeedIncrement : -1 * ballSpeedIncrement;

  ball.body.velocity.x += xSpeedIncrement;
  ball.body.velocity.y += ySpeedIncrement;
}

function randomSign() {
  return Math.random() < 0.5 ? 1 : -1;
}

function ballLeaveScreen() {
  if (ball.body.velocity.x > 0) {
    leftScore++;
  } else {
    rightScore++;
  }

  leftScoreText.setText(`${leftScore}`);
  rightScoreText.setText(`${rightScore}`);

  if (leftScore == winningScore) {
    alert(leftWinningMessage);
    location.reload();
  } else if (rightScore == winningScore) {
    alert(rightWinningMessage);
    location.reload();
  }

  ball.reset(game.world.width * 0.5, game.world.height * Math.random());
  leftPaddle.reset(game.world.width * 0.045, game.world.height * 0.57);
  rightPaddle.reset(game.world.width * 0.98, game.world.height * 0.57);
  ball.body.velocity.set(
    randomDirection(createArrayWithNearValues(ballXVelocitySeed)),
    randomDirection(createArrayWithNearValues(ballYVelocitySeed))
  );
}

function showOptions() {
  let input = prompt(
    "Change game options: <Winning score>|<Game mode>\n" +
      "* Winning score: positive integer\n" +
      "* Game mode:\n" +
      "1 - Human vs computer\n" +
      "2 - Human vs human\n" +
      "3 - Computer vs computer",
    `${winningScore}|${mode}`
  );

  if (!input) {
    return;
  } else if (!input.split("|") || !Array.isArray(input.split("|"))) {
    alert("Please try again");
    return;
  }

  let optionsArr = input.split("|");
  if (
    parseInt(optionsArr[0]) > 0 &&
    (parseInt(optionsArr[1]) === MODE_HUMAN_VS_COMPUTER ||
      parseInt(optionsArr[1]) === MODE_HUMAN_VS_HUMAN ||
      parseInt(optionsArr[1]) === MODE_COMPUTER_VS_COMPUTER)
  ) {
    winningScore = parseInt(optionsArr[0]);
    mode = parseInt(optionsArr[1]);
    pongState = {
      winningScore: winningScore,
      mode: mode,
    };
    localStorage.setItem("pong", JSON.stringify(pongState));
    location.reload();
  } else {
    alert("Please try again");
  }
}

function randomDirection(array) {
  return randomSign() * array[Math.floor(Math.random() * array.length)];
}

function createArrayWithNearValues(seed) {
  const elements = 7;
  const increment = 30;
  const array = Array(elements).fill(0);
  let delta = -50;
  for (let i = 0; i < 7; i++) {
    array[i] = seed + delta;
    delta += increment;
  }

  return array;
}
