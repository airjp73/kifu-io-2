import * as fs from "fs";
import * as path from "path";
import { octokit } from "./octokit";
import { renderToString } from "react-dom/server";
import type { MoveLegality } from "~/goban/state/gobanState/updates";
import { env } from "~/env";
import {
  coordToDisplayLetter,
  coordsToPoint,
  pointToDisplay,
} from "~/goban/point";
import type { GobanState } from "~/goban/state/gobanState/state";
import type { StoneColor } from "~/goban/state/types";

const SGF_FILENAME = "game.sgf";

export const getGhSgf = async () => {
  const res = await octokit.request(
    `GET /repos/airjp73/readme-test/contents/${encodeURIComponent(
      SGF_FILENAME
    )}`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );
  return Buffer.from(res.data.content, "base64").toString("utf-8");
};

export const updateBoardSvg = async (svg: string) => {
  const existingResponse = await octokit.request(
    `GET /repos/{owner}/{repo}/contents/{path}`,
    {
      owner: "airjp73",
      repo: "readme-test",
      path: "board.svg",
    }
  );

  const res = await octokit.request(
    `PUT /repos/{owner}/{repo}/contents/{path}`,
    {
      content: Buffer.from(svg).toString("base64"),
      message: "automated: update board svg",
      committer: { name: "Kifu.io", email: "pettengill.aaron@gmail.com" },
      owner: "airjp73",
      path: "board.svg",
      repo: "readme-test",
      sha: (existingResponse.data as any).sha,
      branch: "main",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return res.data;
};

export const updateSgfFile = async (sgf: string) => {
  const existingResponse = await octokit.request(
    `GET /repos/{owner}/{repo}/contents/{path}`,
    {
      owner: "airjp73",
      repo: "readme-test",
      path: SGF_FILENAME,
    }
  );

  const res = await octokit.request(
    `PUT /repos/{owner}/{repo}/contents/{path}`,
    {
      content: Buffer.from(sgf).toString("base64"),
      message: "automated: update sgf",
      committer: { name: "Kifu.io", email: "pettengill.aaron@gmail.com" },
      owner: "airjp73",
      path: SGF_FILENAME,
      repo: "readme-test",
      sha: (existingResponse.data as any).sha,
      branch: "main",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return res.data;
};

export const updateValidMoves = async (
  moves: MoveLegality[][],
  gobanState: GobanState
) => {
  const existingResponse = await octokit.request(
    `GET /repos/airjp73/readme-test/contents/${encodeURIComponent(
      "README.md"
    )}`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );
  const existingContent = Buffer.from(
    existingResponse.data.content,
    "base64"
  ).toString("utf-8");

  const renderCell = (move: MoveLegality) => {
    switch (move) {
      case "ko":
        return "⭕️";
      case "legal":
        return "";
      case "occupied-black":
        return "⚫️";
      case "occupied-white":
        return "⚪️";
      case "suicide":
        return "💀";
    }
  };

  const playerToPlay = gobanState.gameState.moveState.playerToPlay ?? "b";
  const playerName = (stoneColor: StoneColor) =>
    stoneColor === "b" ? "⚫️ Black" : "⚪️ White";

  const moveList = renderToString(
    <>
      <p>{playerName(playerToPlay)} to play</p>
      <table>
        <summary>Captures</summary>
        <tr>
          <td>{playerName("b")}</td>
          <td>{gobanState.gameState.captureCounts.b}</td>
        </tr>
        <tr>
          <td>{playerName("w")}</td>
          <td>{gobanState.gameState.captureCounts.w}</td>
        </tr>
      </table>
      <details>
        <summary>Make a move</summary>
        <table>
          <caption>Key</caption>
          <tr>
            <td>A1, B2, C3, etc...</td>
            <td>Valid move (click to make a move)</td>
          </tr>
          <tr>
            <td>⚫️</td>
            <td>Occupied by Black</td>
          </tr>
          <tr>
            <td>⚪️</td>
            <td>Occupied by White</td>
          </tr>
          <tr>
            <td>⭕️</td>
            <td>
              Illegal move due to <a href="https://senseis.xmp.net/?Ko">Ko</a>
            </td>
          </tr>
          <tr>
            <td>💀</td>
            <td>
              Illegal move due to{" "}
              <a href="https://senseis.xmp.net/?Suicide">self-capture</a>
            </td>
          </tr>
        </table>

        <table>
          <caption>Choose a spot to move</caption>
          <tr>
            <td></td>
            {Array.from({ length: 19 }).map((_, i) => (
              <td key={i}>{coordToDisplayLetter(i)}</td>
            ))}
          </tr>
          {moves.map((row, y) => {
            return (
              <tr key={y}>
                <td>{y + 1}</td>
                {row.map((move, x) => {
                  const point = coordsToPoint(x, y);
                  const content = renderCell(move);
                  if (move === "legal")
                    return (
                      <td key={x}>
                        <a
                          href={`${env.SERVER_LOCATION}/gh_game/move?point=${point}&stone=${playerToPlay}`}
                        >
                          {pointToDisplay(point)}
                        </a>
                      </td>
                    );
                  return <td key={x}>{content}</td>;
                })}
              </tr>
            );
          })}
        </table>
      </details>
    </>
  );

  const nextContent = existingContent.replace(
    /<!-- MOVES START.+MOVES END -->/s,
    `<!-- MOVES START -->\n${moveList}\n<!-- MOVES END -->`
  );
  const res = await octokit.request(
    `PUT /repos/{owner}/{repo}/contents/{path}`,
    {
      content: Buffer.from(nextContent).toString("base64"),
      message: "automated: update move links in readme",
      committer: { name: "Kifu.io", email: "pettengill.aaron@gmail.com" },
      owner: "airjp73",
      path: "README.md",
      repo: "readme-test",
      sha: existingResponse.data.sha,
      branch: "main",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return res.data;
};

export const updateReadme = async (htmlContent: string) => {
  const existingResponse = await octokit.request(
    `GET /repos/airjp73/readme-test/contents/${encodeURIComponent(
      "README.md"
    )}`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );

  const existingContent = Buffer.from(
    existingResponse.data.content,
    "base64"
  ).toString("utf-8");
  const nextContent = existingContent.replace(
    /<!-- GH GAME START.+GH GAME END -->/s,
    `<!-- GH GAME START -->\n${htmlContent}\n<!-- GH GAME END -->`
  );
  const res = await octokit.request(
    `PUT /repos/{owner}/{repo}/contents/{path}`,
    {
      content: Buffer.from(nextContent).toString("base64"),
      message: "Test readme update",
      committer: { name: "Kifu.io", email: "pettengill.aaron@gmail.com" },
      owner: "airjp73",
      path: "README.md",
      repo: "readme-test",
      sha: existingResponse.data.sha,
      branch: "main",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return res.data;
};

export const updateSvgs = async (svgs: Record<string, string>) => {
  await Promise.all([
    Object.entries(svgs).map(([key, svg]) =>
      fs.promises.writeFile(
        path.join(__dirname, `../../public/svg/${key}.svg`),
        svg
      )
    ),
  ]);
};
