/** POC for https://github.com/abi83/interns/ **/
import { describe, expect, it } from "vitest";
import { createLives, isGameOver, loseLife, STARTING_LIVES } from "./lives";

describe("createLives", () => {
  it("starts with the classic three lives", () => {
    expect(createLives().value).toBe(STARTING_LIVES);
    expect(createLives().value).toBe(3);
  });
});

describe("loseLife", () => {
  it("decrements the remaining lives by one", () => {
    const lives = createLives();

    loseLife(lives);

    expect(lives.value).toBe(STARTING_LIVES - 1);
  });
});

describe("isGameOver", () => {
  it("is false while lives remain", () => {
    const lives = createLives();

    expect(isGameOver(lives)).toBe(false);
  });

  it("is true once lives reach zero", () => {
    const lives = createLives();

    for (let i = 0; i < STARTING_LIVES; i++) {
      loseLife(lives);
    }

    expect(isGameOver(lives)).toBe(true);
  });
});
