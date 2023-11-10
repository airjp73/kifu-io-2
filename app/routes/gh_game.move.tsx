import { redirect, type DataFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { env } from "~/env";
import { commitStateToRepo, updateRepoGameState } from "~/gh_game/updateRepo";
import {
  addCommentToCurrentMove,
  setMoveName,
} from "~/goban/state/gobanState/updates";

const searchSchema = zfd.formData({
  point: z
    .string()
    .min(2)
    .max(2)
    .regex(/^[a-s]+$/i),
  stone: z.enum(["b", "w"]).optional(),
});

export const loader = async ({ request }: DataFunctionArgs) => {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const { point, stone } = searchSchema.parse(params);
  let state = await updateRepoGameState(point, stone ?? "b");
  const now = new Date();
  state = setMoveName(state, "User move");
  state = addCommentToCurrentMove(
    state,
    `GitHub user on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`
  );
  await commitStateToRepo(state);
  const target =
    env.REPO_NAME === "airjp73"
      ? `https://github.com/airjp73`
      : `https://github.com/airjp73/${env.REPO_NAME}`;
  return redirect(target);
};
