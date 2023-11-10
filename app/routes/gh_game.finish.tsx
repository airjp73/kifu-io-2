import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { env } from "~/env";
import { getTemplateSgf, saveToHistory } from "~/gh_game/updateReadme";
import { commitStateToRepo, getCurrentGameState } from "~/gh_game/updateRepo";
import { parseSgf, toSgf } from "~/goban/sgf/parse";
import { makeGobanState } from "~/goban/state/gobanState/state";
import { playMove, setResult } from "~/goban/state/gobanState/updates";
import { denormalizeSgf } from "~/goban/state/sgf";

const bodySchema = z.object({
  aiMove: z.string().refine((val) => val === env.AI_MOVE_SECRET),
  result: z.string(),
  reason: z.enum(["pass", "resign"]),
});

export const action = async ({ request }: DataFunctionArgs) => {
  const { result, reason } = bodySchema.parse(await request.json());

  const freshPromise = getTemplateSgf();
  let state = await getCurrentGameState();

  if (reason === "pass") {
    state = playMove(
      state,
      "pass",
      state.gameState.moveState.playerToPlay ?? "b"
    );
    state = playMove(
      state,
      "pass",
      state.gameState.moveState.playerToPlay ?? "b"
    );
  }

  state = setResult(state, result);

  await saveToHistory(toSgf(denormalizeSgf(state.sgf)));
  const frehSgf = makeGobanState(parseSgf(await freshPromise));
  await commitStateToRepo(frehSgf);

  return json({ success: true });
};
