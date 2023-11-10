import type { GobanState } from "~/goban/state/gobanState/state";
import { makeGobanState } from "~/goban/state/gobanState/state";
import {
  getGhSgf,
  updateBoardSvg,
  updateSgfFile,
  updateReadme,
  cleanupOldBoards,
} from "./updateReadme";
import { parseSgf, toSgf } from "~/goban/sgf/parse";
import {
  getMoveLegality,
  hasMoreMoves,
  nextMove,
  playMove,
} from "~/goban/state/gobanState/updates";
import { redirect } from "@remix-run/node";
import { prerenderGoban } from "./prerender";
import { getAllLegalMoves } from "./getAllLegalMoves";
import { denormalizeSgf } from "~/goban/state/sgf";
import { env } from "~/env";

export const updateRepoGameState = async (move: string, player: string) => {
  let state = await getCurrentGameState();
  const playerToPlay = state.gameState.moveState.playerToPlay ?? "b";

  if (playerToPlay !== player) {
    throw redirect(`${env.SERVER_LOCATION}/gh_game/race-condition`);
  }

  const legality = getMoveLegality(state, move, playerToPlay);
  if (legality !== "legal") {
    throw redirect(
      `${env.SERVER_LOCATION}/gh_game/illegal?legality=${legality}`
    );
  }

  state = playMove(state, move, playerToPlay);
  return state;
};

export const getCurrentGameState = async () => {
  const sgf = await getGhSgf();
  let state = makeGobanState(parseSgf(sgf));
  while (hasMoreMoves(state)) state = nextMove(state);
  return state;
};

export const commitStateToRepo = async (state: GobanState) => {
  const boardId = String(Date.now());
  await Promise.all([
    updateBoardSvg(prerenderGoban(state), boardId),
    updateReadme(getAllLegalMoves(state), state, boardId),
    updateSgfFile(toSgf(denormalizeSgf(state.sgf))),
  ]);
  cleanupOldBoards(boardId);
};
