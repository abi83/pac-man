/** POC for https://github.com/abi83/interns/ **/
import type { Ghost } from "./ghost";
import type { Player } from "./player";
import { GHOST_RADIUS, PLAYER_RADIUS } from "./render";

const CATCH_DISTANCE = PLAYER_RADIUS + GHOST_RADIUS;

export function isCaughtByGhost(player: Player, ghost: Ghost): boolean {
  const dx = player.x - ghost.x;
  const dy = player.y - ghost.y;
  return Math.sqrt(dx * dx + dy * dy) <= CATCH_DISTANCE;
}

export function findCatchingGhost(
  player: Player,
  ghosts: readonly Ghost[]
): Ghost | undefined {
  return ghosts.find((ghost) => isCaughtByGhost(player, ghost));
}
