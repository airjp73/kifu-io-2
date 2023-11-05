import type { DataFunctionArgs } from "@remix-run/node";
import { renderToString } from "react-dom/server";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { parseSgf } from "~/goban/sgf/parse";
import snapshot8 from "~/goban/snapshots/snapshot8";
import { makeGobanState } from "~/goban/state/gobanState/state";
import { hasMoreMoves, nextMove } from "~/goban/state/gobanState/updates";

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

export const loader = ({ request }: DataFunctionArgs) => {
  const { point } = searchSchema.parse(new URL(request.url).searchParams);

  const [x, y] = point.split("").map((c) => c.charCodeAt(0) - 97);
  const stone = state.gameState.boardState[point];

  const content = renderToString(
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

  return new Response(content, {
    headers: {
      "content-type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
  });
};
