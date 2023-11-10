import { getCurrentGameState } from "~/gh_game/updateRepo";

// We could easily do this locally inside the github action,
// but we would need to extract the SGF parsing code first.
export const loader = async () => {
  const state = await getCurrentGameState();
  return new Response(state.gameState.moveState.playerToPlay ?? "b");
};
