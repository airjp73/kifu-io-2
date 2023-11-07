import { json } from "@remix-run/node";
import { getAllLegalMoves } from "~/gh_game/getAllLegalMoves";
import { prerenderGoban } from "~/gh_game/prerender";
import {
  getGhSgf,
  updateBoardSvg,
  updateValidMoves,
} from "~/gh_game/updateReadme";
import { parseSgf } from "~/goban/sgf/parse";
import { makeGobanState } from "~/goban/state/gobanState/state";
import { hasMoreMoves, nextMove } from "~/goban/state/gobanState/updates";

export const action = async () => {
  const sgf = await getGhSgf();
  let state = makeGobanState(parseSgf(sgf));
  while (hasMoreMoves(state)) state = nextMove(state);
  const newContent = prerenderGoban(state);
  await updateBoardSvg(newContent);
  await updateValidMoves(getAllLegalMoves(state));

  return json({ success: true });
};
