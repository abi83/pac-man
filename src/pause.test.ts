/** POC for https://github.com/abi83/interns/ **/
import { describe, expect, it } from "vitest";
import { createPauseState, togglePause } from "./pause";

describe("createPauseState", () => {
  it("starts unpaused", () => {
    expect(createPauseState().paused).toBe(false);
  });
});

describe("togglePause", () => {
  it("flips the paused state on each call", () => {
    const state = createPauseState();

    togglePause(state);
    expect(state.paused).toBe(true);

    togglePause(state);
    expect(state.paused).toBe(false);
  });
});
