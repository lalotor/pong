const game = new Phaser.Game(800, 600, Phaser.CANVAS, null, {
  preload,
  create,
  update,
});

let graphics;
let table;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = "#000";
}

function create() {
  graphics = game.add.graphics(0, 0);
  graphics.lineStyle(2, 0xffffff);
  graphics.drawRoundedRect(10, 10, 780, 580, 20);
  graphics.moveTo(400, 10);
  graphics.lineTo(400, 590);
}

function update() {}
