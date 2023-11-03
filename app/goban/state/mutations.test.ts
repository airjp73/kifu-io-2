import { describe, expect, it } from "vitest";
import snapshot1 from "../snapshots/snapshot1";
import snapshot4 from "../snapshots/snapshot4";
import snapshot2 from "../snapshots/snapshot2";
import snapshot3 from "../snapshots/snapshot3";
import snapshot5 from "../snapshots/snapshot5";
import snapshot6 from "../snapshots/snapshot6";
import snapshot7 from "../snapshots/snapshot7";
import snapshot8 from "../snapshots/snapshot8";
import { parseSgf } from "../sgf/parse";
import { createStringFromGameState } from "./boardState/boardStateTestHelpers";
import { makeGobanState } from "./gobanState/state";
import { hasMoreMoves, nextMove } from "./gobanState/mutations";

const allSnapshots = [
  "(;FF[4]GM[1]SZ[19];B[aa];W[bb])",
  "(;FF[4]GM[1]SZ[19];B[aa](;W[bb])(;W[cc];B[ff])(;W[dd]))",
  snapshot1,
  snapshot2,
  snapshot3,
  snapshot4,
  snapshot5,
  snapshot6,
  snapshot7,
  snapshot8,
];

describe("GameState", () => {
  it.each(allSnapshots)("should process game state", (snap) => {
    const sgf = parseSgf(snap);
    const state = makeGobanState(sgf);

    let i = 0;

    const doSnapshot = (move: number) => {
      for (; i < move && hasMoreMoves(state); i++) {
        nextMove(state);
      }
      expect(
        `Move: ${i}\n` + createStringFromGameState(state.gameState)
      ).toMatchSnapshot();
    };

    for (let target = 50; i === target - 50; target += 50) {
      doSnapshot(target);
      if (i < target) return;
    }
  });
});
