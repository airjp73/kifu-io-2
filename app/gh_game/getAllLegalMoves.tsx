import type { GobanState } from "~/goban/state/gobanState/state";
import type { MoveLegality } from "~/goban/state/gobanState/updates";
import { getMoveLegality } from "~/goban/state/gobanState/updates";

const A = "a".charCodeAt(0);

export const getAllLegalMoves = (state: GobanState): MoveLegality[][] => {
  return Array.from({ length: 19 }).map((_, y) =>
    Array.from({ length: 19 }).map((_, x) => {
      const point = `${String.fromCharCode(x + A)}${String.fromCharCode(
        y + A
      )}`;
      // TODO: put player to play in the goban
      return getMoveLegality(
        state,
        point,
        state.gameState.moveState.playerToPlay ?? "b"
      );
    })
  );
};
