/** POC for https://github.com/abi83/interns/ **/
export type CellType = "wall" | "path" | "dot" | "power-pellet";

export const TILE_SIZE = 16;
export const MAZE_COLUMNS = 28;
export const MAZE_ROWS = 31;

// "#" wall, "." dot, "o" power pellet, " " path (no dot).
const LAYOUT: readonly string[] = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.#####.##.#####.######",
  "######.##############.######",
  "######.##          ##.######",
  "######.##          ##.######",
  "######.##############.######",
  "######................######",
  "                            ",
  "######................######",
  "######.##############.######",
  "######.##          ##.######",
  "######.##          ##.######",
  "######.##############.######",
  "######.#####.##.#####.######",
  "#......##....##....##......#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#..........................#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#............##............#",
  "############################",
];

function charToCellType(char: string): CellType {
  switch (char) {
    case "#":
      return "wall";
    case ".":
      return "dot";
    case "o":
      return "power-pellet";
    case " ":
      return "path";
    default:
      throw new Error(`Unknown maze character: "${char}"`);
  }
}

const MAZE: readonly CellType[][] = LAYOUT.map((row) =>
  row.split("").map(charToCellType)
);

export function getCellType(row: number, column: number): CellType {
  if (row < 0 || row >= MAZE_ROWS || column < 0 || column >= MAZE_COLUMNS) {
    throw new RangeError(`Cell (${row}, ${column}) is outside the maze`);
  }
  return MAZE[row][column];
}

export function eatDot(row: number, column: number): void {
  if (getCellType(row, column) !== "dot") {
    return;
  }
  MAZE[row][column] = "path";
}
