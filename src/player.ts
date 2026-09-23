/** POC for https://github.com/abi83/interns/ **/
import { eatDot, eatPowerPellet, getCellType, MAZE_COLUMNS, TILE_SIZE } from "./maze";
import { addDotScore, type Score } from "./score";

export type Direction = "up" | "down" | "left" | "right";

export interface Player {
  x: number;
  y: number;
  direction: Direction;
  desiredDirection: Direction;
}

export const PLAYER_SPEED = 2;

const SPAWN_ROW = 25;
const SPAWN_COLUMN = 14;
const SPAWN_DIRECTION: Direction = "left";

const DIRECTION_VECTORS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export function createPlayer(): Player {
  return {
    x: SPAWN_COLUMN * TILE_SIZE,
    y: SPAWN_ROW * TILE_SIZE,
    direction: SPAWN_DIRECTION,
    desiredDirection: SPAWN_DIRECTION,
  };
}

export function setDesiredDirection(player: Player, direction: Direction): void {
  player.desiredDirection = direction;
}

export function updatePlayer(player: Player): void {
  if (isTileAligned(player)) {
    if (canEnterTileAhead(player, player.desiredDirection)) {
      player.direction = player.desiredDirection;
    }
    if (!canEnterTileAhead(player, player.direction)) {
      return;
    }
  }
  move(player, player.direction);
}

function isTileAligned(player: Player): boolean {
  return player.x % TILE_SIZE === 0 && player.y % TILE_SIZE === 0;
}

// Returns true when a power pellet was eaten, so main.ts's tick() can
// trigger frightened mode.
export function eatDotUnderPlayer(player: Player, score: Score): boolean {
  if (!isTileAligned(player)) {
    return false;
  }
  const row = player.y / TILE_SIZE;
  const column = player.x / TILE_SIZE;
  const cellType = getCellType(row, column);
  if (cellType === "dot") {
    eatDot(row, column);
    addDotScore(score);
    return false;
  }
  if (cellType === "power-pellet") {
    eatPowerPellet(row, column);
    return true;
  }
  return false;
}

function canEnterTileAhead(player: Player, direction: Direction): boolean {
  const { row, column } = tileAhead(player, direction);
  return getCellType(row, column) !== "wall";
}

function tileAhead(
  player: Player,
  direction: Direction
): { row: number; column: number } {
  const { dx, dy } = DIRECTION_VECTORS[direction];
  return {
    row: player.y / TILE_SIZE + dy,
    column: wrapColumn(player.x / TILE_SIZE + dx),
  };
}

function wrapColumn(column: number): number {
  if (column < 0) {
    return MAZE_COLUMNS - 1;
  }
  if (column >= MAZE_COLUMNS) {
    return 0;
  }
  return column;
}

function move(player: Player, direction: Direction): void {
  const { dx, dy } = DIRECTION_VECTORS[direction];
  player.x = wrapX(player.x + dx * PLAYER_SPEED);
  player.y += dy * PLAYER_SPEED;
}

function wrapX(x: number): number {
  const canvasWidth = MAZE_COLUMNS * TILE_SIZE;
  if (x < 0) {
    return x + canvasWidth;
  }
  if (x >= canvasWidth) {
    return x - canvasWidth;
  }
  return x;
}
