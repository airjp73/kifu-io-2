import { redirect, type DataFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { zfd } from "zod-form-data";

const searchSchema = zfd.formData({
  point: z
    .string()
    .min(2)
    .max(2)
    .regex(/^[a-s]+$/i),
});

export const loader = ({ request }: DataFunctionArgs) => {
  const { point } = searchSchema.parse(new URL(request.url).searchParams);
  console.log("Made a move at point: ", point);
  return redirect(`/gh_game/images`);
};
