import type { GobanState } from "./state";
import * as board from "../boardState/mutations";
import { produce } from "immer";

export const hasMoreMoves = (state: GobanState) => {
  return (
    !state.currentMove || state.sgf.nodes[state.currentMove].children.length > 0
  );
};

export const isAtStart = (state: GobanState) => {
  return !state.currentMove;
};

export const nextMove = (state: GobanState, variation = 0): GobanState => {
  if (!hasMoreMoves(state)) return state;

  const nextId =
    state.currentMove != null
      ? state.sgf.nodes[state.currentMove].children[variation]
      : state.sgf.root[variation];
  const nextNode = state.sgf.nodes[nextId];

  return {
    ...state,
    currentMove: nextId,
    gameState: produce(state.gameState, (draft) =>
      board.processMove(draft, nextNode)
    ),
    history: [...state.history, state.gameState],
  };
};

export const prevMove = (state: GobanState): GobanState => {
  if (isAtStart(state)) return state;

  return {
    ...state,
    currentMove: state.sgf.nodes[state.currentMove!].parentId,
    gameState: state.history[state.history.length - 1],
    history: state.history.slice(0, -1),
  };
};
