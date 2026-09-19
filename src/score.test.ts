/** POC for https://github.com/abi83/interns/ **/
import { describe, expect, it } from "vitest";
import { addDotScore, createScore, POINTS_PER_DOT } from "./score";

describe("createScore", () => {
  it("starts at zero", () => {
    expect(createScore().value).toBe(0);
  });
});

describe("addDotScore", () => {
  it("increases the score by the points-per-dot amount", () => {
    const score = createScore();

    addDotScore(score);

    expect(score.value).toBe(POINTS_PER_DOT);
  });

  it("accumulates across multiple dots", () => {
    const score = createScore();

    addDotScore(score);
    addDotScore(score);
    addDotScore(score);

    expect(score.value).toBe(POINTS_PER_DOT * 3);
  });
});
