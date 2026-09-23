/** POC for https://github.com/abi83/interns/ **/
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./canvas";
import {
  renderMaze,
  drawGameOver,
  drawGhosts,
  drawPaused,
  drawPlayer,
  drawScore,
  drawWin,
} from "./render";
import {
  advanceGhostMode,
  createGhostModeState,
  createGhosts,
  frightenGhosts,
  respawnGhost,
  updateGhost,
} from "./ghost";
import { findCatchingGhost } from "./collision";
import { createLives, isGameOver, loseLife } from "./lives";
import { hasRemainingDots, resetMaze, TILE_SIZE } from "./maze";
import { createPauseState, togglePause } from "./pause";
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

let player = createPlayer();
let ghosts = createGhosts();
const ghostModeState = createGhostModeState();
let score = createScore();
let lives = createLives();
const pauseState = createPauseState();

const PAUSE_KEY = "p";

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

function restart(): void {
  resetMaze();
  player = createPlayer();
  ghosts = createGhosts();
  score = createScore();
  lives = createLives();
}

document.addEventListener("keydown", (event) => {
  if (isGameOver(lives) || !hasRemainingDots()) {
    restart();
    return;
  }
  if (event.key.toLowerCase() === PAUSE_KEY) {
    togglePause(pauseState);
    return;
  }
  const direction = KEY_DIRECTIONS[event.key];
  if (direction) {
    setDesiredDirection(player, direction);
  }
});

function tick(context: CanvasRenderingContext2D): void {
  const gameOver = isGameOver(lives);
  const won = !hasRemainingDots();

  if (!gameOver && !won && !pauseState.paused) {
    updatePlayer(player);
    advanceGhostMode(ghostModeState);
    const playerRow = player.y / TILE_SIZE;
    const playerColumn = player.x / TILE_SIZE;
    ghosts.forEach((ghost) =>
      updateGhost(ghost, ghostModeState.mode, playerRow, playerColumn, player.direction)
    );
    if (eatDotUnderPlayer(player, score)) {
      frightenGhosts(ghostModeState);
    }
    const catchingGhost = findCatchingGhost(player, ghosts);
    if (catchingGhost) {
      if (ghostModeState.mode === "frightened") {
        respawnGhost(catchingGhost);
      } else {
        loseLife(lives);
        if (!isGameOver(lives)) {
          player = createPlayer();
          ghosts = createGhosts();
        }
      }
    }
  }
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  renderMaze(context);
  drawPlayer(context, player);
  drawGhosts(context, ghosts, ghostModeState.mode);
  drawScore(context, score.value);
  if (gameOver) {
    drawGameOver(context);
  } else if (won) {
    drawWin(context);
  } else if (pauseState.paused) {
    drawPaused(context);
  }
  requestAnimationFrame(() => tick(context));
}

requestAnimationFrame(() => tick(context));
