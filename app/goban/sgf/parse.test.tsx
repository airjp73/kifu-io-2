import { describe, expect, it } from "vitest";
import snapshot1 from "../snapshots/snapshot1";
import { parseSgf, toSgf } from "./parse";
import snapshot4 from "../snapshots/snapshot4";
import snapshot2 from "../snapshots/snapshot2";
import snapshot3 from "../snapshots/snapshot3";
import snapshot5 from "../snapshots/snapshot5";
import snapshot6 from "../snapshots/snapshot6";
import snapshot7 from "../snapshots/snapshot7";
import snapshot8 from "../snapshots/snapshot8";

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
  "(;GM[1]FF[4]CA[UTF-8]AP[Kifu.io]ST[2]RU[Tromp-Taylor]SZ[19]KM[6.50])",
  "(;GM[1]FF[4]CA[UTF-8]AP[Kifu.io]ST[2]RU[Tromp-Taylor]SZ[19]KM[6.50];B[];W[])",
];

describe("parse", () => {
  it.each(allSnapshots)("should parse and format", (snap) => {
    const res = parseSgf(snap);
    const sgf = toSgf(res);
    expect(sgf).toMatchSnapshot();
    expect(parseSgf(sgf)).toEqual(res);
  });
});
