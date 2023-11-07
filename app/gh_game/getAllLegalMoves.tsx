import type { GobanState } from "~/goban/state/gobanState/state";

const A = "a".charCodeAt(0);

export const getAllLegalMoves = (state: GobanState): (string | null)[][] => {
  const boardState = state.gameState.boardState;

  const allEmptyIntersections = Array.from({ length: 19 }).map((_, y) =>
    Array.from({ length: 19 }).map((_, x) => {
      const point = `${String.fromCharCode(x + A)}${String.fromCharCode(
        y + A
      )}`;
      return boardState[point] ?? null;
    })
  );

  // filter out suicide moves
  // filter out Ko-restricted moves

  return allEmptyIntersections;
};
