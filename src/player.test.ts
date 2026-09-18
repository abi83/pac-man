/** POC for https://github.com/abi83/interns/ **/
import { describe, expect, it } from "vitest";
import { getCellType, MAZE_COLUMNS, TILE_SIZE } from "./maze";
import { createPlayer, updatePlayer, type Player } from "./player";

describe("createPlayer", () => {
  it("spawns on an open path cell", () => {
    const player = createPlayer();
    expect(getCellType(player.y / TILE_SIZE, player.x / TILE_SIZE)).not.toBe(
      "wall"
    );
  });
});

describe("updatePlayer", () => {
  it("advances position when the path ahead is open", () => {
    const player: Player = {
      x: 1 * TILE_SIZE,
      y: 1 * TILE_SIZE,
      direction: "right",
      desiredDirection: "right",
    };

    updatePlayer(player);

    expect(player.x).toBe(1 * TILE_SIZE + 2);
    expect(player.y).toBe(1 * TILE_SIZE);
  });

  it("does not move into a wall cell", () => {
    const player: Player = {
      x: 1 * TILE_SIZE,
      y: 1 * TILE_SIZE,
      direction: "up",
      desiredDirection: "up",
    };

    updatePlayer(player);

    expect(player.x).toBe(1 * TILE_SIZE);
    expect(player.y).toBe(1 * TILE_SIZE);
  });

  it("applies a buffered turn as soon as the perpendicular path opens up", () => {
    const player: Player = {
      x: 5 * TILE_SIZE,
      y: 1 * TILE_SIZE,
      direction: "right",
      desiredDirection: "down",
    };

    // Column 5 has a wall to the south; keeps heading right until column 6.
    for (let i = 0; i < 8; i++) {
      updatePlayer(player);
      expect(player.direction).toBe("right");
    }
    expect(player.x).toBe(6 * TILE_SIZE);
    expect(player.y).toBe(1 * TILE_SIZE);

    // Column 6 is open to the south, so the buffered turn now applies.
    updatePlayer(player);

    expect(player.direction).toBe("down");
    expect(player.x).toBe(6 * TILE_SIZE);
    expect(player.y).toBe(1 * TILE_SIZE + 2);
  });

  it("wraps from the left edge of the tunnel row to the right edge", () => {
    const player: Player = {
      x: 0,
      y: 15 * TILE_SIZE,
      direction: "left",
      desiredDirection: "left",
    };

    updatePlayer(player);

    expect(player.x).toBe(MAZE_COLUMNS * TILE_SIZE - 2);
    expect(player.y).toBe(15 * TILE_SIZE);
  });

  it("wraps from the right edge of the tunnel row to the left edge", () => {
    const player: Player = {
      x: MAZE_COLUMNS * TILE_SIZE - 2,
      y: 15 * TILE_SIZE,
      direction: "right",
      desiredDirection: "right",
    };

    updatePlayer(player);

    expect(player.x).toBe(0);
    expect(player.y).toBe(15 * TILE_SIZE);
  });
});
