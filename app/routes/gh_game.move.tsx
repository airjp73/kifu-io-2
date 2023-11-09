import { redirect, type DataFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { updateRepo } from "~/gh_game/updateRepo";

const searchSchema = zfd.formData({
  point: z
    .string()
    .min(2)
    .max(2)
    .regex(/^[a-s]+$/i),
});

export const loader = async ({ request }: DataFunctionArgs) => {
  const { point } = searchSchema.parse(new URL(request.url).searchParams);
  await updateRepo(point);
  return redirect(`/gh_game/images`);
};
