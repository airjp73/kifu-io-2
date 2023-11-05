import type { DataFunctionArgs } from "@remix-run/node";
import { renderToString } from "react-dom/server";
import { z } from "zod";
import { zfd } from "zod-form-data";
import type { StoneColor } from "~/goban/state/types";

const searchSchema = zfd.formData({
  color: z.string(),
});

const makeSvg = (x: number, y: number, stone: StoneColor | null) =>
  renderToString(
    <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
      <rect height={100} width={100} fill="#DDBB83" />
      <line
        x1={x === 0 ? 15 : 0}
        x2={x === 18 ? 15 : 30}
        y1={15}
        y2={15}
        stroke="#000"
        strokeWidth={2}
      />
      <line
        x1={15}
        x2={15}
        y1={y === 0 ? 15 : 0}
        y2={y === 18 ? 15 : 30}
        stroke="#000"
        strokeWidth={2}
      />
      {stone && (
        <circle
          fill={stone === "b" ? "#000" : "#fff"}
          cx={15}
          cy={15}
          r={12}
          stroke="#777"
          strokeWidth={2}
        />
      )}
    </svg>
  );

const cache = {
  black_upperLeft: makeSvg(0, 0, "b"),
  black_lowerLeft: makeSvg(0, 18, "b"),
  black_upperRight: makeSvg(18, 0, "b"),
  black_lowerRight: makeSvg(18, 18, "b"),
  black_top: makeSvg(9, 0, "b"),
  black_left: makeSvg(0, 9, "b"),
  black_right: makeSvg(18, 9, "b"),
  black_bottom: makeSvg(9, 18, "b"),
  black_center: makeSvg(9, 9, "b"),
  white_upperLeft: makeSvg(0, 0, "w"),
  white_lowerLeft: makeSvg(0, 18, "w"),
  white_upperRight: makeSvg(18, 0, "w"),
  white_lowerRight: makeSvg(18, 18, "w"),
  white_top: makeSvg(9, 0, "w"),
  white_left: makeSvg(0, 9, "w"),
  white_right: makeSvg(18, 9, "w"),
  white_bottom: makeSvg(9, 18, "w"),
  white_center: makeSvg(9, 9, "w"),
  empty_upperLeft: makeSvg(0, 0, null),
  empty_lowerLeft: makeSvg(0, 18, null),
  empty_upperRight: makeSvg(18, 0, null),
  empty_lowerRight: makeSvg(18, 18, null),
  empty_top: makeSvg(9, 0, null),
  empty_left: makeSvg(0, 9, null),
  empty_right: makeSvg(18, 9, null),
  empty_bottom: makeSvg(9, 18, null),
  empty_center: makeSvg(9, 9, null),
};

export const loader = ({ request, params }: DataFunctionArgs) => {
  const { color } = searchSchema.parse(params);
  return new Response(cache[color as keyof typeof cache], {
    headers: {
      "content-type": "image/svg+xml",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
};
