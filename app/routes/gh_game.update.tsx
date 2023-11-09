import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { env } from "~/env";
import { getAllLegalMoves } from "~/gh_game/getAllLegalMoves";
import { prerenderGoban } from "~/gh_game/prerender";
import {
  getGhSgf,
  updateBoardSvg,
  updateValidMoves,
} from "~/gh_game/updateReadme";
import { parseSgf } from "~/goban/sgf/parse";
import { makeGobanState } from "~/goban/state/gobanState/state";
import {
  getMoveLegality,
  hasMoreMoves,
  nextMove,
  playMove,
} from "~/goban/state/gobanState/updates";

const bodySchema = z.object({
  move: z.string(),
  aiMove: z.string().optional(),
});

export const action = async ({ request }: DataFunctionArgs) => {
  const { move, aiMove } = bodySchema.parse(await request.json());
  if (aiMove && aiMove !== env.AI_MOVE_SECRET) {
    return json({ error: "Invalid AI move secret" }, { status: 403 });
  }

  const sgf = await getGhSgf();
  let state = makeGobanState(parseSgf(sgf));
  while (hasMoreMoves(state)) state = nextMove(state);

  const playerToPlay = state.gameState.moveState.playerToPlay ?? "b";
  const legality = getMoveLegality(state, move, playerToPlay);
  if (legality !== "legal") {
    const legalityMessage = () => {
      switch (legality) {
        case "ko":
          return "Ko (or superko) violation";
        case "occupied-black":
        case "occupied-white":
          return "Point is already occupied by a stone";
        case "suicide":
          return "Self-capturing move";
      }
    };

    return json(
      { error: `Illegal move: ${legalityMessage()}` },
      { status: 400 }
    );
  }

  state = playMove(state, move, playerToPlay);
  const newContent = prerenderGoban(state);
  await updateBoardSvg(newContent);
  await updateValidMoves(getAllLegalMoves(state));

  return json({ success: true });
};
