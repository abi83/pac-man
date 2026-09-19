/** POC for https://github.com/abi83/interns/ **/
export const POINTS_PER_DOT = 10;

export interface Score {
  value: number;
}

export function createScore(): Score {
  return { value: 0 };
}

export function addDotScore(score: Score): void {
  score.value += POINTS_PER_DOT;
}
