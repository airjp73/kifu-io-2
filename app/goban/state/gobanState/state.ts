import type { SgfId } from "../../sgf/parse";
import { makeGameState } from "../boardState/state";
import { normalizeSgf, type NormalizedSgf, type Sgf } from "../sgf";
import type { GameState } from "../types";

export type GobanState = {
  gameState: GameState;
  history: GameState[];
  currentMove: SgfId | null;
  sgf: NormalizedSgf;
  sgfHistory: NormalizedSgf[];
  sgfRedoStack: NormalizedSgf[];
};

export const makeGobanState = (sgf: Sgf): GobanState => {
  const normalized = normalizeSgf(sgf);
  return {
    gameState: makeGameState(),
    history: [],
    currentMove: null,
    sgf: normalized,
    sgfHistory: [],
    sgfRedoStack: [],
  };
};
