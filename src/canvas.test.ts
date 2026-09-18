/** POC for https://github.com/abi83/interns/ **/
import { describe, expect, it } from "vitest";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./canvas";

describe("canvas size", () => {
  it("is positive in both dimensions", () => {
    expect(CANVAS_WIDTH).toBeGreaterThan(0);
    expect(CANVAS_HEIGHT).toBeGreaterThan(0);
  });
});
