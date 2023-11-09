import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { env } from "~/env";
import { updateRepo } from "~/gh_game/updateRepo";

const bodySchema = z.object({
  move: z.string(),
  stone: z.enum(["b", "w"]),
  aiMove: z.string().refine((val) => val === env.AI_MOVE_SECRET),
});

export const action = async ({ request }: DataFunctionArgs) => {
  const { move, stone } = bodySchema.parse(await request.json());
  await updateRepo(move, stone ?? "b");
  return json({ success: true });
};
