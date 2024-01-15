function draw() {
  const canvas = document.getElementById("myCanvas");
  if (!canvas.getContext) {
    return;
  }
  const ctx = canvas.getContext("2d");

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  // Draw table - External rounded rectangle
  ctx.beginPath();
  ctx.roundRect(10, 10, 1000, 650, 20);
  ctx.stroke();
  ctx.closePath();

  // Draw table - Middle line
  ctx.beginPath();
  ctx.moveTo(500, 10);
  ctx.lineTo(500, 660);
  ctx.stroke();
  ctx.closePath();
}

window.addEventListener("load", draw);
