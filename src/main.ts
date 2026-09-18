/** POC for https://github.com/abi83/interns/ **/
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./canvas";
import { renderMaze, drawPlayer } from "./render";
import {
  createPlayer,
  setDesiredDirection,
  updatePlayer,
  type Direction,
} from "./player";

const canvas = document.querySelector<HTMLCanvasElement>("#game");

if (!canvas) {
  throw new Error("Missing #game canvas element");
}

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const context = canvas.getContext("2d");

if (!context) {
  throw new Error("Could not get 2D context for #game canvas");
}

const player = createPlayer();

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

document.addEventListener("keydown", (event) => {
  const direction = KEY_DIRECTIONS[event.key];
  if (direction) {
    setDesiredDirection(player, direction);
  }
});

function tick(): void {
  updatePlayer(player);
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  renderMaze(context);
  drawPlayer(context, player);
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
