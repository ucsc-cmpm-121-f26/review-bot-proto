// Firefly Catch: the deliberately small game the review bot prototype reviews.
// It meets SPEC.md items 1–3 and leaves 4 and 5 for the player of the repo.

const canvas = document.createElement("canvas");
canvas.width = 480;
canvas.height = 360;
document.body.append(canvas);
const ctx = canvas.getContext("2d")!;

const held = new Set<string>();
addEventListener("keydown", (e) => held.add(e.key.toLowerCase()));
addEventListener("keyup", (e) => held.delete(e.key.toLowerCase()));

const player = { x: 240, y: 180 };
const firefly = { x: 100, y: 100 };
let caught = 0;

function frame() {
  const dx = (held.has("arrowright") || held.has("d") ? 1 : 0) -
    (held.has("arrowleft") || held.has("a") ? 1 : 0);
  const dy = (held.has("arrowdown") || held.has("s") ? 1 : 0) -
    (held.has("arrowup") || held.has("w") ? 1 : 0);
  player.x = Math.min(464, Math.max(0, player.x + dx * 4));
  player.y = Math.min(344, Math.max(0, player.y + dy * 4));

  if (Math.abs(player.x - firefly.x) < 16 && Math.abs(player.y - firefly.y) < 16) {
    caught++;
    firefly.x = Math.random() * 464;
    firefly.y = Math.random() * 344;
  }

  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, 480, 360);
  ctx.fillStyle = "#ffe66d";
  ctx.fillRect(firefly.x + 4, firefly.y + 4, 8, 8);
  ctx.fillStyle = "#4ecdc4";
  ctx.fillRect(player.x, player.y, 16, 16);
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px sans-serif";
  ctx.fillText(`Caught: ${caught}`, 10, 22);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
