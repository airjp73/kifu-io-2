import * as fs from "fs";
import * as path from "path";
import { octokit } from "./octokit";
import { renderToString } from "react-dom/server";

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

export const updateValidMoves = async (moves: string[][]) => {
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

  const A = "a".charCodeAt(0);

  const moveList = renderToString(
    <details>
      <summary>Make a move</summary>
      <table>
        <tr>
          <td></td>
          {Array.from({ length: 19 }).map((_, i) => (
            <td key={i}>{i + 1}</td>
          ))}
        </tr>
        {moves.map((row, i) => (
          <tr key={i}>
            <td>{String.fromCharCode(i + A + (i >= 8 ? 1 : 0))}</td>
            {row.map((move, i) => (
              <td key={i}>{move ? "⭕️️" : "🟢"}</td>
            ))}
          </tr>
        ))}
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
