/** POC for https://github.com/abi83/interns/ **/
import { describe, expect, it } from "vitest";
import { getCellType, MAZE_COLUMNS, TILE_SIZE } from "./maze";
import {
  advanceGhostMode,
  CHASE_MODE_TICKS,
  createGhostModeState,
  createGhosts,
  frightenGhosts,
  FRIGHTENED_MODE_TICKS,
  GHOST_COUNT,
  respawnGhost,
  SCATTER_MODE_TICKS,
  updateGhost,
  type Ghost,
} from "./ghost";

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
    // so continuing "down" is the only non-reversing option regardless of
    // mode or target.
    const ghost: Ghost = {
      id: 0,
      x: 1 * TILE_SIZE,
      y: 2 * TILE_SIZE,
      direction: "down",
    };

    updateGhost(ghost, "chase", 0, 0, "down");

    expect(ghost.x).toBe(1 * TILE_SIZE);
    expect(ghost.y).toBe(2 * TILE_SIZE + 2);
    expect(ghost.direction).toBe("down");
  });

  it("never enters a wall cell, turning instead at an intersection", () => {
    // Column 1, row 1 is walled to the north; only "right" avoids reversing.
    const ghost: Ghost = {
      id: 0,
      x: 1 * TILE_SIZE,
      y: 1 * TILE_SIZE,
      direction: "up",
    };
    expect(getCellType(0, 1)).toBe("wall");

    updateGhost(ghost, "chase", 0, 0, "down");

    expect(ghost.direction).toBe("right");
    expect(ghost.x).toBe(1 * TILE_SIZE + 2);
    expect(ghost.y).toBe(1 * TILE_SIZE);
  });

  it("does not reverse direction at a multi-way intersection", () => {
    // Row 1, column 6 is open down/left/right. Coming from the left (moving
    // right), "left" is the reversal and must be excluded, leaving
    // [down, right]. The player is far to the right on the same row, so
    // "right" is also the closest of those two — proving the reversal was
    // filtered rather than picked by chance.
    const ghost: Ghost = {
      id: 0,
      x: 6 * TILE_SIZE,
      y: 1 * TILE_SIZE,
      direction: "right",
    };

    updateGhost(ghost, "chase", 1, 20, "left");

    expect(ghost.direction).toBe("right");
  });

  it("wraps from the left edge of the tunnel row to the right edge", () => {
    const ghost: Ghost = {
      id: 0,
      x: 0,
      y: 15 * TILE_SIZE,
      direction: "left",
    };

    updateGhost(ghost, "chase", 15, 0, "left");

    expect(ghost.direction).toBe("left");
    expect(ghost.x).toBe(MAZE_COLUMNS * TILE_SIZE - 2);
    expect(ghost.y).toBe(15 * TILE_SIZE);
  });

  it("wraps from the right edge of the tunnel row to the left edge", () => {
    const ghost: Ghost = {
      id: 0,
      x: MAZE_COLUMNS * TILE_SIZE - 2,
      y: 15 * TILE_SIZE,
      direction: "right",
    };

    updateGhost(ghost, "chase", 15, 27, "right");

    expect(ghost.x).toBe(0);
    expect(ghost.y).toBe(15 * TILE_SIZE);
  });

  describe("chase mode", () => {
    it("picks the open direction whose resulting tile is closest to the player", () => {
      // At row 1, column 6, the non-reversing options are [down, right].
      // A player far down the same column makes "down" the closer choice.
      const ghost: Ghost = {
        id: 0,
        x: 6 * TILE_SIZE,
        y: 1 * TILE_SIZE,
        direction: "right",
      };

      updateGhost(ghost, "chase", 10, 6, "up");

      expect(ghost.direction).toBe("down");
    });

    it("lets a differentiated ghost target ahead of the player instead of its exact tile", () => {
      // Ghost id 1 targets a tile 4 tiles out in the player's facing
      // direction. With the player at (1, 9) facing left, that pulls the
      // ambush ghost's target to (1, 5) — past the intersection — while
      // ghost id 0 still targets the player's own tile at (1, 9). The two
      // targets favor different open directions from the same intersection.
      const ambushGhost: Ghost = {
        id: 1,
        x: 6 * TILE_SIZE,
        y: 1 * TILE_SIZE,
        direction: "right",
      };
      const directGhost: Ghost = {
        id: 0,
        x: 6 * TILE_SIZE,
        y: 1 * TILE_SIZE,
        direction: "right",
      };

      updateGhost(ambushGhost, "chase", 1, 9, "left");
      updateGhost(directGhost, "chase", 1, 9, "left");

      expect(directGhost.direction).toBe("right");
      expect(ambushGhost.direction).toBe("down");
    });
  });

  describe("scatter mode", () => {
    // Row 1, column 6 is a 3-way intersection (down/left/right all open),
    // and none of them reverse a ghost currently heading "down", so all
    // three stay in play as candidates for both ghosts below.
    it("picks the open direction whose resulting tile is closest to the ghost's corner", () => {
      // Ghost id 0 scatters to the top-right corner, so "right" beats both
      // "down" and "left".
      const ghost: Ghost = {
        id: 0,
        x: 6 * TILE_SIZE,
        y: 1 * TILE_SIZE,
        direction: "down",
      };

      updateGhost(ghost, "scatter", 0, 0, "down");

      expect(ghost.direction).toBe("right");
    });

    it("assigns each ghost id a different corner", () => {
      // Ghost id 1 scatters to the top-left corner instead, so from the
      // same intersection it prefers "left" over "right".
      const ghost: Ghost = {
        id: 1,
        x: 6 * TILE_SIZE,
        y: 1 * TILE_SIZE,
        direction: "down",
      };

      updateGhost(ghost, "scatter", 0, 0, "down");

      expect(ghost.direction).toBe("left");
    });
  });

  describe("frightened mode", () => {
    it("picks the open direction whose resulting tile is farthest from the player", () => {
      // Same setup as the chase-mode test above, where the non-reversing
      // options are [down, right] and "down" is closest to the player at
      // (10, 6). Frightened mode should pick the other one, "right".
      const ghost: Ghost = {
        id: 0,
        x: 6 * TILE_SIZE,
        y: 1 * TILE_SIZE,
        direction: "right",
      };

      updateGhost(ghost, "frightened", 10, 6, "up");

      expect(ghost.direction).toBe("right");
    });

    it("targets the player directly regardless of ghost id", () => {
      // Ghost id 1 would normally ambush ahead of the player in chase mode,
      // but frightened mode targets the player's own tile for every ghost.
      const ghost: Ghost = {
        id: 1,
        x: 6 * TILE_SIZE,
        y: 1 * TILE_SIZE,
        direction: "right",
      };

      updateGhost(ghost, "frightened", 10, 6, "up");

      expect(ghost.direction).toBe("right");
    });
  });
});

describe("respawnGhost", () => {
  it("moves the ghost back to its own spawn tile", () => {
    const ghosts = createGhosts();
    const ghost = ghosts[0];
    const spawnX = ghost.x;
    const spawnY = ghost.y;
    ghost.x = 3 * TILE_SIZE;
    ghost.y = 20 * TILE_SIZE;

    respawnGhost(ghost);

    expect(ghost.x).toBe(spawnX);
    expect(ghost.y).toBe(spawnY);
    expect(getCellType(ghost.y / TILE_SIZE, ghost.x / TILE_SIZE)).not.toBe(
      "wall"
    );
  });
});

describe("ghost mode alternation", () => {
  it("starts in scatter mode", () => {
    const state = createGhostModeState();

    expect(state.mode).toBe("scatter");
  });

  it("switches from scatter to chase once the scatter duration elapses", () => {
    const state = createGhostModeState();

    for (let tick = 0; tick < SCATTER_MODE_TICKS - 1; tick++) {
      advanceGhostMode(state);
      expect(state.mode).toBe("scatter");
    }
    advanceGhostMode(state);

    expect(state.mode).toBe("chase");
  });

  it("switches back to scatter once the chase duration elapses", () => {
    const state = createGhostModeState();

    for (let tick = 0; tick < SCATTER_MODE_TICKS; tick++) {
      advanceGhostMode(state);
    }
    expect(state.mode).toBe("chase");

    for (let tick = 0; tick < CHASE_MODE_TICKS - 1; tick++) {
      advanceGhostMode(state);
      expect(state.mode).toBe("chase");
    }
    advanceGhostMode(state);

    expect(state.mode).toBe("scatter");
  });
});

describe("frightenGhosts", () => {
  it("switches to frightened mode for the frightened duration", () => {
    const state = createGhostModeState();

    frightenGhosts(state);

    expect(state.mode).toBe("frightened");
    expect(state.ticksRemaining).toBe(FRIGHTENED_MODE_TICKS);
  });

  it("suspends the scatter/chase alternation while frightened, resuming it afterward", () => {
    const state = createGhostModeState();
    for (let tick = 0; tick < 10; tick++) {
      advanceGhostMode(state);
    }
    const ticksLeftInScatter = state.ticksRemaining;

    frightenGhosts(state);
    for (let tick = 0; tick < FRIGHTENED_MODE_TICKS - 1; tick++) {
      advanceGhostMode(state);
      expect(state.mode).toBe("frightened");
    }
    advanceGhostMode(state);

    expect(state.mode).toBe("scatter");
    expect(state.ticksRemaining).toBe(ticksLeftInScatter);
  });

  it("refreshes the timer without losing the resume point when eaten again while frightened", () => {
    const state = createGhostModeState();
    for (let tick = 0; tick < 10; tick++) {
      advanceGhostMode(state);
    }
    const ticksLeftInScatter = state.ticksRemaining;

    frightenGhosts(state);
    for (let tick = 0; tick < 100; tick++) {
      advanceGhostMode(state);
    }
    frightenGhosts(state);

    expect(state.mode).toBe("frightened");
    expect(state.ticksRemaining).toBe(FRIGHTENED_MODE_TICKS);

    for (let tick = 0; tick < FRIGHTENED_MODE_TICKS; tick++) {
      advanceGhostMode(state);
    }

    expect(state.mode).toBe("scatter");
    expect(state.ticksRemaining).toBe(ticksLeftInScatter);
  });
});
