/** POC for https://github.com/abi83/interns/ **/
import { getCellType, MAZE_COLUMNS, TILE_SIZE } from "./maze";
import type { Direction } from "./player";

export interface Ghost {
  x: number;
  y: number;
  direction: Direction;
}

export const GHOST_SPEED = 2;
export const GHOST_COUNT = 4;

const SPAWN_ROW = 11;
const SPAWN_COLUMNS = [11, 13, 15, 17];

const DIRECTIONS: readonly Direction[] = ["up", "down", "left", "right"];

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const DIRECTION_VECTORS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export function createGhosts(): Ghost[] {
  return SPAWN_COLUMNS.map((column) => ({
    x: column * TILE_SIZE,
    y: SPAWN_ROW * TILE_SIZE,
    direction: pickRandomDirection(openDirections(SPAWN_ROW, column)),
  }));
}

export function updateGhost(ghost: Ghost): void {
  if (isTileAligned(ghost)) {
    const row = ghost.y / TILE_SIZE;
    const column = ghost.x / TILE_SIZE;
    ghost.direction = chooseDirection(row, column, ghost.direction);
  }
  move(ghost, ghost.direction);
}

function chooseDirection(
  row: number,
  column: number,
  currentDirection: Direction
): Direction {
  const options = openDirections(row, column);
  const nonReversing = options.filter(
    (direction) => direction !== OPPOSITE_DIRECTION[currentDirection]
  );
  return pickRandomDirection(nonReversing.length > 0 ? nonReversing : options);
}

function openDirections(row: number, column: number): Direction[] {
  return DIRECTIONS.filter((direction) => canEnterTile(row, column, direction));
}

function canEnterTile(row: number, column: number, direction: Direction): boolean {
  const { dx, dy } = DIRECTION_VECTORS[direction];
  return getCellType(row + dy, wrapColumn(column + dx)) !== "wall";
}

function pickRandomDirection(directions: readonly Direction[]): Direction {
  return directions[Math.floor(Math.random() * directions.length)];
}

function isTileAligned(ghost: Ghost): boolean {
  return ghost.x % TILE_SIZE === 0 && ghost.y % TILE_SIZE === 0;
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

function move(ghost: Ghost, direction: Direction): void {
  const { dx, dy } = DIRECTION_VECTORS[direction];
  ghost.x = wrapX(ghost.x + dx * GHOST_SPEED);
  ghost.y += dy * GHOST_SPEED;
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
