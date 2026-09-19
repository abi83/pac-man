/** POC for https://github.com/abi83/interns/ **/
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCellType, MAZE_COLUMNS, TILE_SIZE } from "./maze";
import { createGhosts, GHOST_COUNT, updateGhost, type Ghost } from "./ghost";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createGhosts", () => {
  it("spawns GHOST_COUNT ghosts on open path cells", () => {
    const ghosts = createGhosts();

    expect(ghosts).toHaveLength(GHOST_COUNT);
    for (const ghost of ghosts) {
      expect(getCellType(ghost.y / TILE_SIZE, ghost.x / TILE_SIZE)).not.toBe(
        "wall"
      );
    }
  });
});

describe("updateGhost", () => {
  it("advances position when the path ahead is open", () => {
    // Column 1, row 2 is a vertical corridor walled to the left and right,
    // so continuing "down" is the only non-reversing option.
    const ghost: Ghost = {
      x: 1 * TILE_SIZE,
      y: 2 * TILE_SIZE,
      direction: "down",
    };

    updateGhost(ghost);

    expect(ghost.x).toBe(1 * TILE_SIZE);
    expect(ghost.y).toBe(2 * TILE_SIZE + 2);
    expect(ghost.direction).toBe("down");
  });

  it("never enters a wall cell, turning instead at an intersection", () => {
    // Column 1, row 1 is walled to the north; only "right" avoids reversing.
    const ghost: Ghost = {
      x: 1 * TILE_SIZE,
      y: 1 * TILE_SIZE,
      direction: "up",
    };
    expect(getCellType(0, 1)).toBe("wall");

    updateGhost(ghost);

    expect(ghost.direction).toBe("right");
    expect(ghost.x).toBe(1 * TILE_SIZE + 2);
    expect(ghost.y).toBe(1 * TILE_SIZE);
  });

  it("does not reverse direction at a multi-way intersection", () => {
    // Row 1, column 6 is open down/left/right. Coming from the left (moving
    // right), "left" is the reversal and must be excluded from the choices,
    // leaving [down, right]. A midpoint random value would select "left" out
    // of the unfiltered [down, left, right], so picking "right" proves the
    // reversal was filtered out rather than picked by chance.
    const ghost: Ghost = {
      x: 6 * TILE_SIZE,
      y: 1 * TILE_SIZE,
      direction: "right",
    };
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    updateGhost(ghost);

    expect(ghost.direction).toBe("right");
  });

  it("wraps from the left edge of the tunnel row to the right edge", () => {
    const ghost: Ghost = {
      x: 0,
      y: 15 * TILE_SIZE,
      direction: "left",
    };

    updateGhost(ghost);

    expect(ghost.direction).toBe("left");
    expect(ghost.x).toBe(MAZE_COLUMNS * TILE_SIZE - 2);
    expect(ghost.y).toBe(15 * TILE_SIZE);
  });

  it("wraps from the right edge of the tunnel row to the left edge", () => {
    const ghost: Ghost = {
      x: MAZE_COLUMNS * TILE_SIZE - 2,
      y: 15 * TILE_SIZE,
      direction: "right",
    };

    updateGhost(ghost);

    expect(ghost.x).toBe(0);
    expect(ghost.y).toBe(15 * TILE_SIZE);
  });
});
