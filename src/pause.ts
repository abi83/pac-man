/** POC for https://github.com/abi83/interns/ **/
export interface PauseState {
  paused: boolean;
}

export function createPauseState(): PauseState {
  return { paused: false };
}

export function togglePause(state: PauseState): void {
  state.paused = !state.paused;
}
