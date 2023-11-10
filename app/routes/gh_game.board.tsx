import { prerenderGoban } from "~/gh_game/prerender";
import { getCurrentGameState } from "~/gh_game/updateRepo";

export const loader = async () => {
  const state = await getCurrentGameState();
  const svg = prerenderGoban(state);
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
    },
  });
};
