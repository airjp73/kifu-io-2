import { redirect, type DataFunctionArgs } from "@remix-run/node";
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
  const color = stone === "b" ? "black" : stone === "w" ? "white" : "empty";

  const getCacheKey = () => {
    if (x === 0 && y === 0) return "upperLeft";
    if (x === 0 && y === 18) return "lowerLeft";
    if (x === 18 && y === 0) return "upperRight";
    if (x === 18 && y === 18) return "lowerRight";
    if (x === 0) return `${color}_left`;
    if (x === 18) return `${color}_right`;
    if (y === 0) return `${color}_top`;
    if (y === 18) return `${color}_bottom`;
    return `${color}_center`;
  };

  return redirect(`/gh_game/svg/${getCacheKey()}`, {
    headers: {
      "content-type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
  });
};
