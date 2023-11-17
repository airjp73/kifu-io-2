import type { GobanState } from "./state";
import * as board from "../boardState/mutations";
import { produce } from "immer";
import type { BoardState, StoneColor } from "../types";
import type { NormalizedSgfNode } from "../sgf";

export const hasMoreMoves = (state: GobanState) => {
  return (
    state.currentMove == null ||
    state.sgf.nodes[state.currentMove].children.length > 0
  );
};

export const isAtStart = (state: GobanState) => {
  return !state.currentMove;
};

const areBoardStatesEqual = (a: BoardState, b: BoardState) => {
  if (Object.keys(a).length !== Object.keys(b).length) return false;
  for (const key in a) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};

export type MoveLegality =
  | "occupied-black"
  | "occupied-white"
  | "ko"
  | "suicide"
  | "legal";

export const getMoveLegality = (
  state: GobanState,
  point: string,
  color: StoneColor
): MoveLegality => {
  if (state.gameState.boardState[point] === "b") return "occupied-black";
  if (state.gameState.boardState[point] === "w") return "occupied-white";
  const nextState = playMove(state, point, color);

  // Self-capture
  if (!nextState.gameState.boardState[point]) return "suicide";
  // Ko
  const isRepeatPosition = [...nextState.history]
    .reverse()
    .some((historical) =>
      areBoardStatesEqual(historical.boardState, nextState.gameState.boardState)
    );
  if (isRepeatPosition) return "ko";

  return "legal";
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

export const playMove = (
  state: GobanState,
  point: string,
  color: StoneColor
): GobanState => {
  const nextId = Math.max(...Object.keys(state.sgf.nodes).map(Number)) + 1;
  const value = point === "pass" ? [] : [point];
  const nextNode: NormalizedSgfNode = {
    id: nextId,
    children: [],
    data: color === "b" ? { B: value } : { W: value },
    parentId: state.currentMove,
  };

  return {
    ...state,
    currentMove: nextId,
    gameState: produce(state.gameState, (draft) =>
      board.processMove(draft, nextNode)
    ),
    history: [...state.history, state.gameState],
    sgf: produce(state.sgf, (draft) => {
      if (nextNode.parentId)
        draft.nodes[nextNode.parentId].children.push(nextId);
      else draft.root.push(nextId);
      draft.nodes[nextId] = nextNode;
    }),
  };
};

export const setMoveName = (state: GobanState, comment: string) => {
  return {
    ...state,
    gameState: produce(state.gameState, (draft) =>
      board.addComment(draft, [comment])
    ),
    sgf: produce(state.sgf, (draft) => {
      draft.nodes[state.currentMove!].data.N = [comment];
    }),
  };
};

export const addCommentToCurrentMove = (
  state: GobanState,
  name: string
): GobanState => {
  return {
    ...state,
    gameState: produce(state.gameState, (draft) =>
      board.addName(draft, [name])
    ),
    sgf: produce(state.sgf, (draft) => {
      draft.nodes[state.currentMove!].data.C = [name];
    }),
  };
};

export const setResult = (state: GobanState, result: string) => {
  return {
    ...state,
    gameState: produce(state.gameState, (draft) =>
      board.setProperty(draft, [result], "result")
    ),
    sgf: produce(state.sgf, (draft) => {
      draft.nodes[draft.root[0]].data.RE = [result];
    }),
  };
};
