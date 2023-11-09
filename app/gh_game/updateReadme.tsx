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

export const getGhSgf = async () => {
  const res = await octokit.request(
    `GET /repos/airjp73/readme-test/contents/${encodeURIComponent("test.sgf")}`,
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
      message: "Test readme update",
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

export const updateValidMoves = async (moves: MoveLegality[][]) => {
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

  const moveList = renderToString(
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
          <td>Illegal move due to [Ko](https://senseis.xmp.net/?Ko)</td>
        </tr>
        <tr>
          <td>💀</td>
          <td>
            Illegal move due to [self-capture](https://senseis.xmp.net/?Suicide){" "}
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
                        href={`${env.SERVER_LOCATION}/gh_game/move?point=${point}`}
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
  );

  const nextContent = existingContent.replace(
    /<!-- MOVES START.+MOVES END -->/s,
    `<!-- MOVES START -->\n${moveList}\n<!-- MOVES END -->`
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
