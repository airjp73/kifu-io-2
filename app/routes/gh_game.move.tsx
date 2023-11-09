import { redirect, type DataFunctionArgs } from "@remix-run/node";
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
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const { point } = searchSchema.parse(params);
  await updateRepo(point);
  return redirect(request.referrer);
};
