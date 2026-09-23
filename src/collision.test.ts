/** POC for https://github.com/abi83/interns/ **/
import { describe, expect, it } from "vitest";
import { findCatchingGhost, isCaughtByGhost } from "./collision";
import type { Ghost } from "./ghost";
import { TILE_SIZE } from "./maze";
import type { Player } from "./player";

function makePlayer(x: number, y: number): Player {
  return { x, y, direction: "right", desiredDirection: "right" };
}

function makeGhost(id: number, x: number, y: number): Ghost {
  return { id, x, y, direction: "right" };
}

describe("isCaughtByGhost", () => {
  it("is true when the player and ghost occupy the same position", () => {
    const player = makePlayer(5 * TILE_SIZE, 5 * TILE_SIZE);
    const ghost = makeGhost(0, 5 * TILE_SIZE, 5 * TILE_SIZE);

    expect(isCaughtByGhost(player, ghost)).toBe(true);
  });

  it("is true for a near miss within the combined radii, off tile alignment", () => {
    const player = makePlayer(5 * TILE_SIZE + 3, 5 * TILE_SIZE);
    const ghost = makeGhost(0, 6 * TILE_SIZE - 3, 5 * TILE_SIZE);

    expect(isCaughtByGhost(player, ghost)).toBe(true);
  });

  it("is false once the ghost is a full tile away", () => {
    const player = makePlayer(5 * TILE_SIZE, 5 * TILE_SIZE);
    const ghost = makeGhost(0, 6 * TILE_SIZE, 5 * TILE_SIZE);

    expect(isCaughtByGhost(player, ghost)).toBe(false);
  });
});

describe("findCatchingGhost", () => {
  it("returns the ghost that caught the player", () => {
    const player = makePlayer(5 * TILE_SIZE, 5 * TILE_SIZE);
    const farGhost = makeGhost(0, 20 * TILE_SIZE, 20 * TILE_SIZE);
    const catchingGhost = makeGhost(1, 5 * TILE_SIZE, 5 * TILE_SIZE);

    expect(findCatchingGhost(player, [farGhost, catchingGhost])).toBe(catchingGhost);
  });

  it("returns undefined when no ghost is close enough", () => {
    const player = makePlayer(5 * TILE_SIZE, 5 * TILE_SIZE);
    const ghosts = [makeGhost(0, 20 * TILE_SIZE, 20 * TILE_SIZE)];

    expect(findCatchingGhost(player, ghosts)).toBeUndefined();
  });
});
