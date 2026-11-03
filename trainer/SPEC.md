# Spec: Firefly Catch

What the software should do. The trainer compares the code with this list.

1. A player square moves with the arrow keys or WASD and cannot leave the
   playfield.
2. One firefly appears at a random position. Touching it adds one to the
   catch count and moves the firefly somewhere new.
3. The catch count is always visible.
4. After 30 seconds the round ends, the final count is shown, and pressing
   Space starts a new round with the count at zero.
5. Game rules (speeds, sizes, round length) live in one place, separate from
   drawing code, so they can be tuned without reading rendering logic.
6. `deno task ci` passes.
