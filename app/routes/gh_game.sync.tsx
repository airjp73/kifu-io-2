import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { env } from "~/env";
import { commitStateToRepo, getCurrentGameState } from "~/gh_game/updateRepo";

const schema = z.object({
  secret: z.string().refine((val) => val === env.AI_MOVE_SECRET),
});

export const action = async ({ request }: DataFunctionArgs) => {
  schema.parse(await request.json());
  const state = await getCurrentGameState();
  await commitStateToRepo(state);
  return json({ success: true });
};
