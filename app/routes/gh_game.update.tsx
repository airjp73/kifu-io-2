import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { env } from "~/env";
import { commitStateToRepo, updateRepoGameState } from "~/gh_game/updateRepo";
import { displayToPoint } from "~/goban/point";
import {
  addCommentToCurrentMove,
  setMoveName,
} from "~/goban/state/gobanState/updates";

const bodySchema = z.object({
  move: z.string(),
  stone: z.enum(["b", "w"]),
  aiMove: z.string().refine((val) => val === env.AI_MOVE_SECRET),
});

export const action = async ({ request }: DataFunctionArgs) => {
  const { move, stone } = bodySchema.parse(await request.json());
  let state = await updateRepoGameState(displayToPoint(move), stone ?? "b");
  const now = new Date();
  state = setMoveName(state, "AI move");
  state = addCommentToCurrentMove(
    state,
    `KataGo on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`
  );
  await commitStateToRepo(state);
  return json({ success: true });
};
