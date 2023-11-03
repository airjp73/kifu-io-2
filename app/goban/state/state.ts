import type { GameState } from "./types";

export const makeGameState = (): GameState => ({
  boardState: {},
  captureCounts: { b: 0, w: 0 },
  moveState: {
    circles: [],
    lines: [],
    squares: [],
    triangles: [],
    xMarks: [],
    labels: [],
    validationErrors: [],
  },
  properties: {},
});
