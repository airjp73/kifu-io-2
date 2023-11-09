import { coordsToPoint } from "~/goban/point";
import type { GobanState } from "~/goban/state/gobanState/state";
import type { MoveLegality } from "~/goban/state/gobanState/updates";
import { getMoveLegality } from "~/goban/state/gobanState/updates";

export const getAllLegalMoves = (state: GobanState): MoveLegality[][] => {
  return Array.from({ length: 19 }).map((_, y) =>
    Array.from({ length: 19 }).map((_, x) => {
      const point = coordsToPoint(x, y);
      return getMoveLegality(
        state,
        point,
        state.gameState.moveState.playerToPlay ?? "b"
      );
    })
  );
};
