// Firefly Catch: the deliberately small game the trainer prototype reviews.

const RULES = {
  width: 480,
  height: 360,
  playerSize: 16,
  playerSpeed: 4,
  fireflySize: 8,
  catchDistance: 16,
};

const canvas = document.createElement("canvas");
canvas.width = RULES.width;
canvas.height = RULES.height;
document.body.append(canvas);
const ctx = canvas.getContext("2d")!;

const held = new Set<string>();
addEventListener("keydown", (e) => held.add(e.key.toLowerCase()));
addEventListener("keyup", (e) => held.delete(e.key.toLowerCase()));

const maxX = RULES.width - RULES.playerSize;
const maxY = RULES.height - RULES.playerSize;
const player = { x: 240, y: 180 };
const firefly = { x: 100, y: 100 };
let caught = 0;

function frame() {
  const dx = (held.has("arrowright") || held.has("d") ? 1 : 0) -
    (held.has("arrowleft") || held.has("a") ? 1 : 0);
  const dy = (held.has("arrowdown") || held.has("s") ? 1 : 0) -
    (held.has("arrowup") || held.has("w") ? 1 : 0);
  player.x = Math.min(maxX, Math.max(0, player.x + dx * RULES.playerSpeed));
  player.y = Math.min(maxY, Math.max(0, player.y + dy * RULES.playerSpeed));

  const near = (a: number, b: number) => Math.abs(a - b) < RULES.catchDistance;
  if (near(player.x, firefly.x) && near(player.y, firefly.y)) {
    caught++;
    firefly.x = Math.random() * maxX;
    firefly.y = Math.random() * maxY;
  }

  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, RULES.width, RULES.height);
  ctx.fillStyle = "#ffe66d";
  const inset = (RULES.playerSize - RULES.fireflySize) / 2;
  ctx.fillRect(firefly.x + inset, firefly.y + inset, RULES.fireflySize, RULES.fireflySize);
  ctx.fillStyle = "#4ecdc4";
  ctx.fillRect(player.x, player.y, RULES.playerSize, RULES.playerSize);
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px sans-serif";
  ctx.fillText(`Caught: ${caught}`, 10, 22);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
