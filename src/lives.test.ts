/** POC for https://github.com/abi83/interns/ **/
import { describe, expect, it } from "vitest";
import {
  createLives,
  EXTRA_LIFE_SCORE_THRESHOLD,
  isGameOver,
  loseLife,
  maybeAwardExtraLife,
  STARTING_LIVES,
} from "./lives";
import { createScore } from "./score";

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

describe("maybeAwardExtraLife", () => {
  it("does nothing while the score is below the threshold", () => {
    const lives = createLives();
    const score = createScore();
    score.value = EXTRA_LIFE_SCORE_THRESHOLD - 1;

    maybeAwardExtraLife(lives, score);

    expect(lives.value).toBe(STARTING_LIVES);
    expect(lives.awarded).toBe(false);
  });

  it("awards one extra life the first time the score reaches the threshold", () => {
    const lives = createLives();
    const score = createScore();
    score.value = EXTRA_LIFE_SCORE_THRESHOLD;

    maybeAwardExtraLife(lives, score);

    expect(lives.value).toBe(STARTING_LIVES + 1);
    expect(lives.awarded).toBe(true);
  });

  it("does not award again on later calls once already awarded", () => {
    const lives = createLives();
    const score = createScore();
    score.value = EXTRA_LIFE_SCORE_THRESHOLD;

    maybeAwardExtraLife(lives, score);
    score.value = EXTRA_LIFE_SCORE_THRESHOLD + 500;
    maybeAwardExtraLife(lives, score);

    expect(lives.value).toBe(STARTING_LIVES + 1);
    expect(lives.awarded).toBe(true);
  });
});
