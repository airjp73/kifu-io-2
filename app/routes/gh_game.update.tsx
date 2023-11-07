import { json, type DataFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { prerenderGoban } from "~/gh_game/prerender";
import { updateBoardSvg, updateReadme } from "~/gh_game/updateReadme";
import { parseSgf } from "~/goban/sgf/parse";
import { makeGobanState } from "~/goban/state/gobanState/state";
import { hasMoreMoves, nextMove } from "~/goban/state/gobanState/updates";

const querySchema = z.object({
  sgf: z.string(),
});

export const action = async ({ request }: DataFunctionArgs) => {
  const { sgf } = querySchema.parse(await request.json());
  let state = makeGobanState(parseSgf(sgf));
  while (hasMoreMoves(state)) state = nextMove(state);
  const newContent = prerenderGoban(state);
  console.log(await updateBoardSvg(newContent));

  return json({ success: true });
};
