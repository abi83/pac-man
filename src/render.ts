/** POC for https://github.com/abi83/interns/ **/
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./canvas";
import { getCellType, MAZE_COLUMNS, MAZE_ROWS, TILE_SIZE } from "./maze";
import type { Ghost, GhostMode } from "./ghost";
import type { Player } from "./player";

const WALL_COLOR = "#2121de";
const DOT_COLOR = "#ffb8ae";
const DOT_RADIUS = 2;
const POWER_PELLET_RADIUS = 6;
const PLAYER_COLOR = "#ffff00";
export const PLAYER_RADIUS = TILE_SIZE / 2 - 1;
const GHOST_COLORS = ["#ff0000", "#ffb8ff", "#00ffff", "#ffb851"];
const FRIGHTENED_GHOST_COLOR = "#0000ff";
export const GHOST_RADIUS = TILE_SIZE / 2 - 1;
const SCORE_COLOR = "#ffffff";
const SCORE_FONT = "12px sans-serif";
const SCORE_X = 4;
const SCORE_Y = 12;
const OVERLAY_TEXT_COLOR = "#ffffff";
const OVERLAY_FONT = "24px sans-serif";
const GAME_OVER_TEXT = "GAME OVER";
const WIN_TEXT = "YOU WIN";
const PAUSED_TEXT = "PAUSED";

export function renderMaze(context: CanvasRenderingContext2D): void {
  for (let row = 0; row < MAZE_ROWS; row++) {
    for (let column = 0; column < MAZE_COLUMNS; column++) {
      drawCell(context, row, column);
    }
  }
}

export function drawPlayer(
  context: CanvasRenderingContext2D,
  player: Player
): void {
  context.fillStyle = PLAYER_COLOR;
  drawCircle(
    context,
    player.x + TILE_SIZE / 2,
    player.y + TILE_SIZE / 2,
    PLAYER_RADIUS
  );
}

export function drawGhosts(
  context: CanvasRenderingContext2D,
  ghosts: readonly Ghost[],
  mode: GhostMode
): void {
  const color = (index: number) =>
    mode === "frightened" ? FRIGHTENED_GHOST_COLOR : GHOST_COLORS[index % GHOST_COLORS.length];
  ghosts.forEach((ghost, index) => drawGhost(context, ghost, color(index)));
}

function drawGhost(
  context: CanvasRenderingContext2D,
  ghost: Ghost,
  color: string
): void {
  context.fillStyle = color;
  drawCircle(
    context,
    ghost.x + TILE_SIZE / 2,
    ghost.y + TILE_SIZE / 2,
    GHOST_RADIUS
  );
}

export function drawScore(
  context: CanvasRenderingContext2D,
  score: number
): void {
  context.fillStyle = SCORE_COLOR;
  context.font = SCORE_FONT;
  context.fillText(`Score: ${score}`, SCORE_X, SCORE_Y);
}

export function drawGameOver(context: CanvasRenderingContext2D): void {
  drawOverlayText(context, GAME_OVER_TEXT);
}

export function drawWin(context: CanvasRenderingContext2D): void {
  drawOverlayText(context, WIN_TEXT);
}

export function drawPaused(context: CanvasRenderingContext2D): void {
  drawOverlayText(context, PAUSED_TEXT);
}

function drawOverlayText(context: CanvasRenderingContext2D, text: string): void {
  context.fillStyle = OVERLAY_TEXT_COLOR;
  context.font = OVERLAY_FONT;
  context.textAlign = "center";
  context.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  context.textAlign = "start";
}

function drawCell(
  context: CanvasRenderingContext2D,
  row: number,
  column: number
): void {
  const x = column * TILE_SIZE;
  const y = row * TILE_SIZE;
  const centerX = x + TILE_SIZE / 2;
  const centerY = y + TILE_SIZE / 2;

  switch (getCellType(row, column)) {
    case "wall":
      context.fillStyle = WALL_COLOR;
      context.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      return;
    case "dot":
      context.fillStyle = DOT_COLOR;
      drawCircle(context, centerX, centerY, DOT_RADIUS);
      return;
    case "power-pellet":
      context.fillStyle = DOT_COLOR;
      drawCircle(context, centerX, centerY, POWER_PELLET_RADIUS);
      return;
    case "path":
      return;
  }
}

function drawCircle(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
): void {
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
}
