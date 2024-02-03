// Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_IMAGE = "img/v-paddle.png";
const BALL_IMAGE = "img/ball.png";
const OPTIONS_BUTTON_IMAGE = "img/hamburger-button.png";
const BALL_SPRITESHEET = "img/wobble.png";
const BALL_ANIMATION_FRAMES = [0, 1, 0, 2, 0, 1, 0, 2, 0];
const BALL_X_VELOCITY_SEED = 400;
const BALL_Y_VELOCITY_SEED = 350;
const PADDLE_SPEED = 6;
const VERTICAL_PADDING = 25;
const BALL_SPEED_INCREMENT = 5;
const MODE_HUMAN_VS_COMPUTER = 1;
const MODE_HUMAN_VS_HUMAN = 2;
const MODE_COMPUTER_VS_COMPUTER = 3;
const TEXT_STYLE = {
  font: "24px Arial",
  fill: "#0A0",
};
const PADDLE_INITIAL_POSITION = {
  left: { x: GAME_WIDTH * 0.045, y: GAME_HEIGHT * 0.57 },
  right: { x: GAME_WIDTH * 0.98, y: GAME_HEIGHT * 0.57 },
};
game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, null, {
  preload,
  create,
  update,
});

// Game state
let graphics;
let leftPaddle;
let rightPaddle;
let ball;
let leftScore = 0;
let rightScore = 0;
let leftScoreText;
let rightScoreText;
let optionsButton;
let currentStateText;

// Game configuration
let winningScore = 5;
let mode = 1;
let modeDesc;
let leftWinningMessage;
let rightWinningMessage;
let leftPaddleBehavior;
let rightPaddleBehavior;

function preload() {
  game.world.setBounds(10, 10, GAME_WIDTH - 50, GAME_HEIGHT - 50);
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = "#000";

  game.load.image("paddle", PADDLE_IMAGE);
  game.load.image("ball", BALL_IMAGE);
  game.load.image("options-button", OPTIONS_BUTTON_IMAGE);
  game.load.spritesheet("ball", BALL_SPRITESHEET, 20, 20);

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

  createGameGraphics();
  createPaddles();
  createBall();
  createScoreTexts();
  createOptionsButton();
  createCurrentStateText();
}

function createGameGraphics() {
  graphics = game.add.graphics(0, 0);
  graphics.lineStyle(2, 0xffffff);
  graphics.drawRoundedRect(20, 20, GAME_WIDTH - 20, GAME_HEIGHT - 20, 20);
  graphics.moveTo(GAME_WIDTH / 2, 20);
  graphics.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
}

function createPaddles() {
  leftPaddle = createPaddle(PADDLE_INITIAL_POSITION.left);
  rightPaddle = createPaddle(PADDLE_INITIAL_POSITION.right);
}

function createPaddle(position) {
  const paddle = game.add.sprite(position.x, position.y, "paddle");
  paddle.anchor.set(0.5, 1);
  game.physics.enable(paddle, Phaser.Physics.ARCADE);
  paddle.body.immovable = true;

  return paddle;
}

function createBall() {
  ball = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT * Math.random(), "ball");
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
    randomDirection(createArrayWithNearValues(BALL_X_VELOCITY_SEED)),
    randomDirection(createArrayWithNearValues(BALL_Y_VELOCITY_SEED))
  );
}

function createScoreTexts() {
  leftScoreText = createScoreText(GAME_WIDTH / 4, GAME_HEIGHT / 15, leftScore);
  rightScoreText = createScoreText(
    (GAME_WIDTH / 4) * 3,
    GAME_HEIGHT / 15,
    rightScore
  );
}

function createScoreText(x, y, score) {
  return game.add.text(x, y, `${score}`, TEXT_STYLE);
}

function createOptionsButton() {
  optionsButton = game.add.button(
    (GAME_WIDTH / 25) * 24.4,
    (GAME_HEIGHT / 25) * 24.2,
    "options-button",
    showOptions,
    this,
    0,
    0,
    0
  );
  optionsButton.anchor.set(0.5);
  optionsButton.alpha = 0.5;
}

function createCurrentStateText() {
  currentStateText = game.add.text(
    (GAME_WIDTH / 25) * 1,
    (GAME_HEIGHT / 25) * 23,
    `Winning score: ${winningScore}\n` + `Game mode:  ${modeDesc}\n`,
    {
      font: "15px Arial",
      fill: "#0A0",
    }
  );
  currentStateText.alpha = 0.4;
}

function update() {
  game.physics.arcade.collide(ball, leftPaddle, ballHitPaddle);
  game.physics.arcade.collide(ball, rightPaddle, ballHitPaddle);

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
    if (paddle.y >= paddle.height + VERTICAL_PADDING) {
      paddle.y -= PADDLE_SPEED;
    }
  } else if (game.input.keyboard.isDown(downKeyCode)) {
    if (paddle.y <= game.world.height - 5) {
      paddle.y += PADDLE_SPEED;
    }
  }
}

function rightPaddleComputerPlay() {
  if (
    ball.body.velocity.x > 0 &&
    ball.y >= rightPaddle.height + VERTICAL_PADDING
  ) {
    rightPaddle.y = ball.y;
  }
}

function leftPaddleComputerPlay() {
  if (
    ball.body.velocity.x < 0 &&
    ball.y >= leftPaddle.height + VERTICAL_PADDING
  ) {
    leftPaddle.y = ball.y;
  }
}

function ballHitPaddle(ball, paddle) {
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
    ball.body.velocity.x >= 0
      ? BALL_SPEED_INCREMENT
      : -1 * BALL_SPEED_INCREMENT;
  let ySpeedIncrement =
    ball.body.velocity.y >= 0
      ? BALL_SPEED_INCREMENT
      : -1 * BALL_SPEED_INCREMENT;

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

  updateScoreText();

  if (leftScore == winningScore) {
    showWinningMessage(leftWinningMessage);
  } else if (rightScore == winningScore) {
    showWinningMessage(rightWinningMessage);
  }

  resetGame();
}

function updateScoreText() {
  leftScoreText.setText(`${leftScore}`);
  rightScoreText.setText(`${rightScore}`);
}

function showWinningMessage(message) {
  alert(message);
  location.reload();
}

function resetGame() {
  ball.reset(game.world.width * 0.5, game.world.height * Math.random());
  leftPaddle.reset(game.world.width * 0.045, game.world.height * 0.57);
  rightPaddle.reset(game.world.width * 0.98, game.world.height * 0.57);
  ball.body.velocity.set(
    randomDirection(createArrayWithNearValues(BALL_X_VELOCITY_SEED)),
    randomDirection(createArrayWithNearValues(BALL_Y_VELOCITY_SEED))
  );
}

function resetGame() {
  resetBall();
  resetPaddles();
  resetBallVelocity();
}

function resetBall() {
  ball.reset(GAME_WIDTH / 2, GAME_HEIGHT * Math.random());
}

function resetPaddles() {
  leftPaddle.reset(
    PADDLE_INITIAL_POSITION.left.x,
    PADDLE_INITIAL_POSITION.left.y
  );
  rightPaddle.reset(
    PADDLE_INITIAL_POSITION.right.x,
    PADDLE_INITIAL_POSITION.right.y
  );
}

function resetBallVelocity() {
  ball.body.velocity.set(
    randomDirection(createArrayWithNearValues(BALL_X_VELOCITY_SEED)),
    randomDirection(createArrayWithNearValues(BALL_Y_VELOCITY_SEED))
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
    saveGameOptions(optionsArr);
    location.reload();
  } else {
    alert("Please try again");
  }
}

function saveGameOptions(optionsArr) {
  winningScore = parseInt(optionsArr[0]);
  mode = parseInt(optionsArr[1]);
  pongState = {
    winningScore: winningScore,
    mode: mode,
  };
  localStorage.setItem("pong", JSON.stringify(pongState));
}

function randomDirection(array) {
  return randomSign() * array[Math.floor(Math.random() * array.length)];
}

function createArrayWithNearValues(seed) {
  const elements = 7;
  const increment = 30;
  const array = [];
  let delta = -70;
  for (let i = 0; i < elements; i++) {
    array.push(seed + delta);
    delta += increment;
  }

  return array;
}
