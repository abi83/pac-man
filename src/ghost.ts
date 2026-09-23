/** POC for https://github.com/abi83/interns/ **/
import { getCellType, MAZE_COLUMNS, MAZE_ROWS, TILE_SIZE } from "./maze";
import type { Direction } from "./player";

export interface Ghost {
  id: number;
  x: number;
  y: number;
  direction: Direction;
}

export type GhostMode = "chase" | "scatter" | "frightened";
type ScatterOrChaseMode = "chase" | "scatter";

export interface GhostModeState {
  mode: GhostMode;
  ticksRemaining: number;
  // Snapshot of the scatter/chase alternation taken when frightened mode
  // starts, so it can resume exactly where it was interrupted.
  resumeMode: ScatterOrChaseMode;
  resumeTicksRemaining: number;
}

interface Tile {
  row: number;
  column: number;
}

export const GHOST_SPEED = 2;
export const GHOST_COUNT = 4;

// Classic Pac-Man cadence: 7s scattering to a corner, then 20s chasing, at
// the 60fps tick rate driven by main.ts's requestAnimationFrame loop.
export const SCATTER_MODE_TICKS = 420;
export const CHASE_MODE_TICKS = 1200;

// 7s of frightened movement before ghosts return to the scatter/chase cycle.
export const FRIGHTENED_MODE_TICKS = 420;

const SPAWN_ROW = 11;
const SPAWN_COLUMNS = [11, 13, 15, 17];

// One corner per ghost id, matching the red/pink/cyan/orange order in
// render.ts's GHOST_COLORS so each ghost scatters to its own corner.
const CORNER_TARGETS: readonly Tile[] = [
  { row: 0, column: MAZE_COLUMNS - 1 },
  { row: 0, column: 0 },
  { row: MAZE_ROWS - 1, column: MAZE_COLUMNS - 1 },
  { row: MAZE_ROWS - 1, column: 0 },
];

// Ghost id 1 (pink) leads the player instead of targeting its exact tile,
// giving the pack at least one differentiated chase behaviour.
const AMBUSH_GHOST_ID = 1;
const AMBUSH_OFFSET = 4;

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
  return SPAWN_COLUMNS.map((column, id) => ({
    id,
    x: column * TILE_SIZE,
    y: SPAWN_ROW * TILE_SIZE,
    direction: pickRandomDirection(openDirections(SPAWN_ROW, column)),
  }));
}

export function createGhostModeState(): GhostModeState {
  return {
    mode: "scatter",
    ticksRemaining: SCATTER_MODE_TICKS,
    resumeMode: "scatter",
    resumeTicksRemaining: SCATTER_MODE_TICKS,
  };
}

export function advanceGhostMode(state: GhostModeState): void {
  state.ticksRemaining -= 1;
  if (state.ticksRemaining > 0) {
    return;
  }
  if (state.mode === "frightened") {
    state.mode = state.resumeMode;
    state.ticksRemaining = state.resumeTicksRemaining;
    return;
  }
  state.mode = state.mode === "scatter" ? "chase" : "scatter";
  state.ticksRemaining =
    state.mode === "scatter" ? SCATTER_MODE_TICKS : CHASE_MODE_TICKS;
}

// Suspends the scatter/chase alternation for FRIGHTENED_MODE_TICKS, saving
// its current point so advanceGhostMode can resume it afterward. Eating a
// pellet while already frightened just refreshes the timer.
export function frightenGhosts(state: GhostModeState): void {
  if (state.mode !== "frightened") {
    state.resumeMode = state.mode;
    state.resumeTicksRemaining = state.ticksRemaining;
    state.mode = "frightened";
  }
  state.ticksRemaining = FRIGHTENED_MODE_TICKS;
}

export function updateGhost(
  ghost: Ghost,
  mode: GhostMode,
  playerRow: number,
  playerColumn: number,
  playerDirection: Direction
): void {
  if (isTileAligned(ghost)) {
    const row = ghost.y / TILE_SIZE;
    const column = ghost.x / TILE_SIZE;
    const target = targetTile(ghost, mode, playerRow, playerColumn, playerDirection);
    ghost.direction = chooseDirection(row, column, ghost.direction, target, mode);
  }
  move(ghost, ghost.direction);
}

export function respawnGhost(ghost: Ghost): void {
  const column = SPAWN_COLUMNS[ghost.id];
  ghost.x = column * TILE_SIZE;
  ghost.y = SPAWN_ROW * TILE_SIZE;
  ghost.direction = pickRandomDirection(openDirections(SPAWN_ROW, column));
}

function targetTile(
  ghost: Ghost,
  mode: GhostMode,
  playerRow: number,
  playerColumn: number,
  playerDirection: Direction
): Tile {
  if (mode === "scatter") {
    return CORNER_TARGETS[ghost.id % CORNER_TARGETS.length];
  }
  if (mode === "frightened") {
    return { row: playerRow, column: playerColumn };
  }
  if (ghost.id === AMBUSH_GHOST_ID) {
    const { dx, dy } = DIRECTION_VECTORS[playerDirection];
    return {
      row: playerRow + dy * AMBUSH_OFFSET,
      column: playerColumn + dx * AMBUSH_OFFSET,
    };
  }
  return { row: playerRow, column: playerColumn };
}

function chooseDirection(
  row: number,
  column: number,
  currentDirection: Direction,
  target: Tile,
  mode: GhostMode
): Direction {
  const options = openDirections(row, column);
  const nonReversing = options.filter(
    (direction) => direction !== OPPOSITE_DIRECTION[currentDirection]
  );
  const candidates = nonReversing.length > 0 ? nonReversing : options;
  return mode === "frightened"
    ? farthestDirection(row, column, candidates, target)
    : closestDirection(row, column, candidates, target);
}

function closestDirection(
  row: number,
  column: number,
  directions: readonly Direction[],
  target: Tile
): Direction {
  return directions.reduce((closest, direction) =>
    tileDistance(resultingTile(row, column, direction), target) <
    tileDistance(resultingTile(row, column, closest), target)
      ? direction
      : closest
  );
}

function farthestDirection(
  row: number,
  column: number,
  directions: readonly Direction[],
  target: Tile
): Direction {
  return directions.reduce((farthest, direction) =>
    tileDistance(resultingTile(row, column, direction), target) >
    tileDistance(resultingTile(row, column, farthest), target)
      ? direction
      : farthest
  );
}

function resultingTile(row: number, column: number, direction: Direction): Tile {
  const { dx, dy } = DIRECTION_VECTORS[direction];
  return { row: row + dy, column: column + dx };
}

function tileDistance(a: Tile, b: Tile): number {
  return (a.row - b.row) ** 2 + (a.column - b.column) ** 2;
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
