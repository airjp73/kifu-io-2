import type { DataFunctionArgs } from "@remix-run/node";
import { renderToString } from "react-dom/server";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { parseSgf } from "~/goban/sgf/parse";
import snapshot8 from "~/goban/snapshots/snapshot8";
import { makeGobanState } from "~/goban/state/gobanState/state";
import { hasMoreMoves, nextMove } from "~/goban/state/gobanState/updates";
import type { StoneColor } from "~/goban/state/types";

const searchSchema = zfd.formData({
  point: z
    .string()
    .min(2)
    .max(2)
    .regex(/^[a-s]+$/i),
});

const getGameState = (game: string) => {
  const sgf = parseSgf(game);
  let state = makeGobanState(sgf);

  while (hasMoreMoves(state)) {
    state = nextMove(state);
  }

  return state;
};

const state = getGameState(snapshot8);

const makeSvg = (x: number, y: number, stone: StoneColor | null) =>
  renderToString(
    <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
      <rect height={100} width={100} fill="#DDBB83" />
      <line
        x1={x === 0 ? 15 : 0}
        x2={x === 18 ? 15 : 30}
        y1={15}
        y2={15}
        stroke="#000"
        strokeWidth={2}
      />
      <line
        x1={15}
        x2={15}
        y1={y === 0 ? 15 : 0}
        y2={y === 18 ? 15 : 30}
        stroke="#000"
        strokeWidth={2}
      />
      {stone && (
        <circle
          fill={stone === "b" ? "#000" : "#fff"}
          cx={15}
          cy={15}
          r={12}
          stroke="#777"
          strokeWidth={2}
        />
      )}
    </svg>
  );

const cache = {
  upperLeft: makeSvg(0, 0, state.gameState.boardState.a1),
  lowerLeft: makeSvg(0, 18, state.gameState.boardState.a19),
  upperRight: makeSvg(18, 0, state.gameState.boardState.s1),
  lowerRight: makeSvg(18, 18, state.gameState.boardState.s19),
  black: {
    top: makeSvg(9, 0, "b"),
    left: makeSvg(0, 9, "b"),
    right: makeSvg(18, 9, "b"),
    bottom: makeSvg(9, 18, "b"),
    center: makeSvg(9, 9, "b"),
  },
  white: {
    top: makeSvg(9, 0, "w"),
    left: makeSvg(0, 9, "w"),
    right: makeSvg(18, 9, "w"),
    bottom: makeSvg(9, 18, "w"),
    center: makeSvg(9, 9, "w"),
  },
  empty: {
    top: makeSvg(9, 0, null),
    left: makeSvg(0, 9, null),
    right: makeSvg(18, 9, null),
    bottom: makeSvg(9, 18, null),
    center: makeSvg(9, 9, null),
  },
};

export const loader = ({ request }: DataFunctionArgs) => {
  const { point } = searchSchema.parse(new URL(request.url).searchParams);
  const [x, y] = point.split("").map((c) => c.charCodeAt(0) - 97);

  const stone = state.gameState.boardState[point];

  const getCache = () => {
    if (x === 0 && y === 0) return cache.upperLeft;
    if (x === 0 && y === 18) return cache.lowerLeft;
    if (x === 18 && y === 0) return cache.upperRight;
    if (x === 18 && y === 18) return cache.lowerRight;

    const color = stone === "b" ? "black" : stone === "w" ? "white" : "empty";
    if (x === 0) return cache[color].left;
    if (x === 18) return cache[color].right;
    if (y === 0) return cache[color].top;
    if (y === 18) return cache[color].bottom;
    return cache[color].center;
  };

  const content = getCache();

  return new Response(content, {
    headers: {
      "content-type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
  });
};
