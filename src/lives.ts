/** POC for https://github.com/abi83/interns/ **/
import type { Score } from "./score";

export const STARTING_LIVES = 3;
export const EXTRA_LIFE_SCORE_THRESHOLD = 10000;

export interface Lives {
  value: number;
  awarded: boolean;
}

export function createLives(): Lives {
  return { value: STARTING_LIVES, awarded: false };
}

export function loseLife(lives: Lives): void {
  lives.value -= 1;
}

export function isGameOver(lives: Lives): boolean {
  return lives.value <= 0;
}

export function maybeAwardExtraLife(lives: Lives, score: Score): void {
  if (lives.awarded || score.value < EXTRA_LIFE_SCORE_THRESHOLD) {
    return;
  }
  lives.value += 1;
  lives.awarded = true;
}
