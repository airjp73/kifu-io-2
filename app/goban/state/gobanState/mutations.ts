import type { SgfId } from "~/goban/sgf/parse";
import type { GobanState } from "./state";
import * as board from "../boardState/mutations";

export const hasMoreMoves = (state: GobanState) => {
  return (
    !state.currentMove || state.sgf.nodes[state.currentMove].children.length > 0
  );
};

export const nextMove = (state: GobanState, variation = 0) => {
  if (!hasMoreMoves(state)) return;

  const nextId =
    state.currentMove != null
      ? state.sgf.nodes[state.currentMove].children[variation]
      : state.sgf.root[variation];
  const nextNode = state.sgf.nodes[nextId];
  board.processMove(state.gameState, nextNode);
  state.currentMove = nextId;
};

export const prevMove = (state: GobanState) => {};
export const goToMove = (state: GobanState, move: SgfId) => {};
export const goToMoveAtPoint = (state: GobanState, point: string) => {};
