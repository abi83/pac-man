/** POC for https://github.com/abi83/interns/ **/
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./canvas";
import { renderMaze, drawGhosts, drawPlayer, drawScore } from "./render";
import { advanceGhostMode, createGhostModeState, createGhosts, updateGhost } from "./ghost";
import { TILE_SIZE } from "./maze";
import {
  createPlayer,
  eatDotUnderPlayer,
  setDesiredDirection,
  updatePlayer,
  type Direction,
} from "./player";
import { createScore } from "./score";

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
const ghosts = createGhosts();
const ghostModeState = createGhostModeState();
const score = createScore();

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

function tick(context: CanvasRenderingContext2D): void {
  updatePlayer(player);
  advanceGhostMode(ghostModeState);
  const playerRow = player.y / TILE_SIZE;
  const playerColumn = player.x / TILE_SIZE;
  ghosts.forEach((ghost) =>
    updateGhost(ghost, ghostModeState.mode, playerRow, playerColumn, player.direction)
  );
  eatDotUnderPlayer(player, score);
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  renderMaze(context);
  drawPlayer(context, player);
  drawGhosts(context, ghosts);
  drawScore(context, score.value);
  requestAnimationFrame(() => tick(context));
}

requestAnimationFrame(() => tick(context));
