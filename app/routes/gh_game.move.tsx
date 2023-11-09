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
  stone: z.enum(["b", "w"]).optional(),
});

export const loader = async ({ request }: DataFunctionArgs) => {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const { point, stone } = searchSchema.parse(params);
  await updateRepo(point, stone ?? "b");
  return redirect("https://github.com/airjp73/readme-test");
};
