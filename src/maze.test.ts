/** POC for https://github.com/abi83/interns/ **/
import { describe, expect, it } from "vitest";
import {
  getCellType,
  MAZE_COLUMNS,
  MAZE_ROWS,
  TILE_SIZE,
} from "./maze";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./canvas";

describe("maze dimensions", () => {
  it("matches the canvas size at 16px tiles", () => {
    expect(MAZE_COLUMNS * TILE_SIZE).toBe(CANVAS_WIDTH);
    expect(MAZE_ROWS * TILE_SIZE).toBe(CANVAS_HEIGHT);
  });
});

describe("getCellType", () => {
  it("reports the outer border as walls", () => {
    for (let column = 0; column < MAZE_COLUMNS; column++) {
      expect(getCellType(0, column)).toBe("wall");
      expect(getCellType(MAZE_ROWS - 1, column)).toBe("wall");
    }
    for (let row = 0; row < MAZE_ROWS; row++) {
      if (row === 15) {
        continue; // the tunnel row is open at both edges
      }
      expect(getCellType(row, 0)).toBe("wall");
      expect(getCellType(row, MAZE_COLUMNS - 1)).toBe("wall");
    }
  });

  it("reports dots along the top corridor", () => {
    expect(getCellType(1, 1)).toBe("dot");
    expect(getCellType(1, 26)).toBe("dot");
  });

  it("reports the four power pellets in the corners of their rows", () => {
    expect(getCellType(3, 1)).toBe("power-pellet");
    expect(getCellType(3, 26)).toBe("power-pellet");
    expect(getCellType(27, 1)).toBe("power-pellet");
    expect(getCellType(27, 26)).toBe("power-pellet");
  });

  it("reports open path with no dot inside the ghost house", () => {
    expect(getCellType(11, 10)).toBe("path");
  });

  it("leaves the tunnel row open at both edges", () => {
    expect(getCellType(15, 0)).toBe("path");
    expect(getCellType(15, MAZE_COLUMNS - 1)).toBe("path");
  });

  it("throws for a cell outside the grid", () => {
    expect(() => getCellType(-1, 0)).toThrow(RangeError);
    expect(() => getCellType(0, -1)).toThrow(RangeError);
    expect(() => getCellType(MAZE_ROWS, 0)).toThrow(RangeError);
    expect(() => getCellType(0, MAZE_COLUMNS)).toThrow(RangeError);
  });
});
