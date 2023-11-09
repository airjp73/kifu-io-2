import type { GobanState } from "~/goban/state/gobanState/state";
import { makeGobanState } from "~/goban/state/gobanState/state";
import { getGhSgf, updateBoardSvg, updateValidMoves } from "./updateReadme";
import { parseSgf } from "~/goban/sgf/parse";
import {
  getMoveLegality,
  hasMoreMoves,
  nextMove,
  playMove,
} from "~/goban/state/gobanState/updates";
import { json } from "@remix-run/node";
import { prerenderGoban } from "./prerender";
import { getAllLegalMoves } from "./getAllLegalMoves";

export const updateRepo = async (move: string) => {
  let state = await getCurrentGameState();
  const playerToPlay = state.gameState.moveState.playerToPlay ?? "b";
  const legality = getMoveLegality(state, move, playerToPlay);
  if (legality !== "legal") {
    const legalityMessage = () => {
      switch (legality) {
        case "ko":
          return "Ko (or superko) violation";
        case "occupied-black":
        case "occupied-white":
          return "Point is already occupied by a stone";
        case "suicide":
          return "Self-capturing move";
      }
    };

    throw json(
      { error: `Illegal move: ${legalityMessage()}` },
      { status: 400 }
    );
  }

  state = playMove(state, move, playerToPlay);
  await commitStateToRepo(state);
};

export const getCurrentGameState = async () => {
  const sgf = await getGhSgf();
  let state = makeGobanState(parseSgf(sgf));
  while (hasMoreMoves(state)) state = nextMove(state);
  return state;
};

export const commitStateToRepo = async (state: GobanState) => {
  const newContent = prerenderGoban(state);
  await updateBoardSvg(newContent);
  await updateValidMoves(getAllLegalMoves(state));
};
