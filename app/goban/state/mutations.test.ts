import { describe, expect, it } from "vitest";
import snapshot1 from "../snapshots/snapshot1";
import snapshot4 from "../snapshots/snapshot4";
import snapshot2 from "../snapshots/snapshot2";
import snapshot3 from "../snapshots/snapshot3";
import snapshot5 from "../snapshots/snapshot5";
import snapshot6 from "../snapshots/snapshot6";
import snapshot7 from "../snapshots/snapshot7";
import snapshot8 from "../snapshots/snapshot8";
import { parseSgf, toSgf } from "../sgf/parse";
import { createStringFromGameState } from "./boardState/boardStateTestHelpers";
import type { GobanState } from "./gobanState/state";
import { makeGobanState } from "./gobanState/state";
import {
  hasMoreMoves,
  isAtStart,
  isLegalMove,
  nextMove,
  playMove,
  prevMove,
} from "./gobanState/updates";
import { denormalizeSgf } from "./sgf";

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
    let state = makeGobanState(sgf);
    let i = 0;

    const doSnapshot = (move: number) => {
      for (; i < move && hasMoreMoves(state); i++) {
        state = nextMove(state);
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

  it.each(allSnapshots)("should process game state in reverse", (snap) => {
    const sgf = parseSgf(snap);
    let state = makeGobanState(sgf);
    const intermediate: GobanState[] = [];

    let i = 0;
    for (; hasMoreMoves(state); i++) {
      state = nextMove(state);
      if (i % 34 === 0) {
        intermediate.push(state);
      }
    }

    // above for loop naturally overshoots by 1
    i--;
    for (; !isAtStart(state) && i >= 0; i--) {
      if (i % 34 === 0) {
        expect(
          `Move: ${i}\n` +
            createStringFromGameState(intermediate.pop()!.gameState!)
        ).toEqual(`Move: ${i}\n` + createStringFromGameState(state.gameState));
      }
      state = prevMove(state);
    }
  });

  it("should play a move", () => {
    const sgf = parseSgf(`(;FF[4]GM[1]SZ[19];B[aa];W[bb])`);
    let state = makeGobanState(sgf);
    while (hasMoreMoves(state)) state = nextMove(state);
    state = playMove(state, "cc", "b");
    state = playMove(state, "dd", "w");
    expect(toSgf(denormalizeSgf(state.sgf))).toMatchInlineSnapshot(`
      "(;FF[4]GM[1]SZ[19]
      ;B[aa]
      ;W[bb]
      ;B[cc]
      ;W[dd])"
    `);
  });

  it("should self capture or occupied spaces as illegal", () => {
    const sgf = parseSgf(`(;FF[4]GM[1]SZ[19];B[ab];B[bb];B[ca];W[aa])`);
    let state = makeGobanState(sgf);
    while (hasMoreMoves(state)) state = nextMove(state);
    expect(isLegalMove(state, "ba", "b")).toBe(true);
    expect(isLegalMove(state, "ba", "w")).toBe(false);
    expect(isLegalMove(state, "aa", "b")).toBe(false);
    expect(isLegalMove(state, "aa", "b")).toBe(false);
  });

  it.only("should identify ko as illegal", () => {
    const sgf = parseSgf(`(;FF[4]GM[1]SZ[19];B[ab];B[ba];W[bb];W[ca])`);
    let state = makeGobanState(sgf);
    while (hasMoreMoves(state)) state = nextMove(state);
    expect(isLegalMove(state, "aa", "b")).toBe(true);
    expect(isLegalMove(state, "aa", "w")).toBe(true);
    state = playMove(state, "aa", "w");
    expect(isLegalMove(state, "ba", "w")).toBe(true);
    expect(isLegalMove(state, "ba", "b")).toBe(false);
  });
});
