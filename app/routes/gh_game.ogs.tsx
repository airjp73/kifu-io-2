import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { env } from "~/env";
import type { StoneColor } from "~/goban/state/types";

const asFormData = (obj: Record<string, string>) => {
  const data = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    data.append(key, value);
  });
  return data;
};

const authResponse = z.object({
  access_token: z.string(),
  scope: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
});

const gameResponse = z.object({
  // There's quite a bit more info, but we only care about this
  moves: z.array(z.tuple([z.number(), z.number(), z.number()])),
});

export const loader = async () => {
  // const response = await fetch("https://online-go.com/oauth2/token/", {
  //   method: "POST",
  //   body: asFormData({
  //     grant_type: "password",
  //     client_id: env.OGS_CLIENT_ID,
  //     client_secret: env.OGS_CLIENT_SECRET,
  //     username: env.OGS_USERNAME,
  //     password: env.OGS_PASSWORD,
  //   }),
  // });

  // if (!response.ok)
  //   return new Response(
  //     `<html>
  //       <body>
  //         <h1>Something went wrong</h1>
  //         <p>Status: ${response.status}</p>
  //         <pre>${await response.text()}</pre>
  //       </body>
  //     </html>`,
  //     {
  //       status: response.status,
  //       headers: {
  //         "Content-Type": "text/html",
  //       },
  //     }
  //   );

  // const auth = ogsResponse.parse(await response.json());

  // This is just a random game from the homepage being played today
  const res = await fetch(
    "http://online-go.com/termination-api/game/58627247/"
  );
  const data = gameResponse.parse(await res.json());

  const boardState: Record<string, StoneColor> = {};
  data.moves.forEach(([x, y], i) => {
    boardState[String.fromCharCode(x + 97) + String.fromCharCode(y + 97)] =
      i % 2 === 0 ? "b" : "w";
  });
  return json(boardState);
};

const A = "a".charCodeAt(0);

export default function OgsGame() {
  const data = useLoaderData<typeof loader>();
  const boardSize = 19;

  const getCacheKey = (x: number, y: number, stone?: StoneColor) => {
    const color = stone === "b" ? "black" : stone === "w" ? "white" : "empty";
    if (x === 0 && y === 0) return `${color}_upperLeft`;
    if (x === 0 && y === 18) return `${color}_lowerLeft`;
    if (x === 18 && y === 0) return `${color}_upperRight`;
    if (x === 18 && y === 18) return `${color}_lowerRight`;
    if (x === 0) return `${color}_left`;
    if (x === 18) return `${color}_right`;
    if (y === 0) return `${color}_top`;
    if (y === 18) return `${color}_bottom`;
    return `${color}_center`;
  };

  return (
    <div>
      <h1>OGS Game</h1>
      {Array.from({ length: boardSize })
        .fill(0)
        .map((_, y) => (
          <div key={y} style={{ display: "flex" }}>
            {Array.from({ length: boardSize })
              .fill(0)
              .map((_, x) => {
                const yLetter = String.fromCharCode(y + A + (y >= 8 ? 1 : 0));
                const point =
                  String.fromCharCode(x + A) + String.fromCharCode(y + A);
                return (
                  <a key={x} href={`/gh_game/move?point=${point}`}>
                    <img
                      height={25}
                      width={25}
                      alt={`Point ${yLetter}-${x + 1}`}
                      src={`/gh_game/svg/${getCacheKey(x, y, data[point])}`}
                    />
                  </a>
                );
              })}
          </div>
        ))}
    </div>
  );
}
