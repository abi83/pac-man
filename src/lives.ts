/** POC for https://github.com/abi83/interns/ **/
export const STARTING_LIVES = 3;

export interface Lives {
  value: number;
}

export function createLives(): Lives {
  return { value: STARTING_LIVES };
}

export function loseLife(lives: Lives): void {
  lives.value -= 1;
}

export function isGameOver(lives: Lives): boolean {
  return lives.value <= 0;
}
