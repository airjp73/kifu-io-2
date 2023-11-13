import { octokit } from "./octokit";
import { renderToString } from "react-dom/server";
import type { MoveLegality } from "~/goban/state/gobanState/updates";
import { env } from "~/env";
import {
  coordToDisplayLetter,
  coordToYNumber,
  coordsToPoint,
  pointToDisplay,
} from "~/goban/point";
import type { GobanState } from "~/goban/state/gobanState/state";
import type { StoneColor } from "~/goban/state/types";

const SGF_PATH = "current/game.sgf";

const getSgfFile = async (fileName: string) => {
  const res = await octokit.request(
    `GET /repos/{owner}/{repo}/contents/{fileName}`,
    {
      owner: "airjp73",
      repo: env.REPO_NAME,
      fileName: fileName,
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );
  return Buffer.from(res.data.content, "base64").toString("utf-8");
};

export const getGhSgf = () => getSgfFile(SGF_PATH);
export const getTemplateSgf = () => getSgfFile("fresh.sgf");

export const updateBoardSvg = async (svg: string, boardId: string) => {
  const res = await octokit.request(
    `PUT /repos/{owner}/{repo}/contents/{path}`,
    {
      content: Buffer.from(svg).toString("base64"),
      message: "automated: update board svg",
      committer: { name: "Kifu.io", email: "pettengill.aaron@gmail.com" },
      owner: "airjp73",
      path: `current/board_${boardId}.svg`,
      repo: env.REPO_NAME,
      branch: "main",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return res.data;
};

export const cleanupOldBoards = async (currentId: string) => {
  console.log("Checking for old boards");
  const res = await octokit.request(
    `GET /repos/{owner}/{repo}/contents/{path}`,
    {
      owner: "airjp73",
      repo: env.REPO_NAME,
      path: "current",
    }
  );
  if (!Array.isArray(res.data)) {
    console.error("Expected array of files");
    return;
  }

  console.log(`Found ${res.data.length} board files in current directory`);

  const toDelete = res.data.filter(
    (file) => file.name.includes("board") && !file.name.includes(currentId)
  );

  console.log(`Found ${toDelete.length} old board files to delete`);

  await Promise.all(
    toDelete.map((file) =>
      octokit
        .request(`DELETE /repos/{owner}/{repo}/contents/{path}`, {
          owner: "airjp73",
          repo: env.REPO_NAME,
          path: file.path,
          message: "automated: delete old board svg",
          committer: { name: "Kifu.io", email: "pettengill.aaron@gmail.com" },
          sha: file.sha,
          branch: "main",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        })
        .then(() => console.log(`Successfully deleted ${file.name}`))
        .catch((err) =>
          console.error(
            `Failed to delete ${file.name}. Error: `,
            err.message ?? `Unknown error`
          )
        )
    )
  );
};

export const updateSgfFile = async (sgf: string) => {
  const existingResponse = await octokit.request(
    `GET /repos/{owner}/{repo}/contents/{path}`,
    {
      owner: "airjp73",
      repo: env.REPO_NAME,
      path: SGF_PATH,
    }
  );

  const res = await octokit.request(
    `PUT /repos/{owner}/{repo}/contents/{path}`,
    {
      content: Buffer.from(sgf).toString("base64"),
      message: "automated: update sgf",
      committer: { name: "Kifu.io", email: "pettengill.aaron@gmail.com" },
      owner: "airjp73",
      path: SGF_PATH,
      repo: env.REPO_NAME,
      sha: (existingResponse.data as any).sha,
      branch: "main",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return res.data;
};

export const saveToHistory = async (sgf: string) => {
  const res = await octokit.request(
    `PUT /repos/{owner}/{repo}/contents/{path}`,
    {
      content: Buffer.from(sgf).toString("base64"),
      message: "automated: save historical sgf",
      committer: { name: "Kifu.io", email: "pettengill.aaron@gmail.com" },
      owner: "airjp73",
      path: `history/${new Date().toISOString()}.sgf`,
      repo: env.REPO_NAME,
      branch: "main",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return res.data;
};

export const updateReadme = async (
  moves: MoveLegality[][],
  gobanState: GobanState,
  boardId: string
) => {
  const existingResponse = await octokit.request(
    `GET /repos/airjp73/${env.REPO_NAME}/contents/${encodeURIComponent(
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
                <td>{coordToYNumber(y)}</td>
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

  const nextContent = existingContent
    .replace(
      /<!-- MOVES START.+MOVES END -->/s,
      `<!-- MOVES START -->\n${moveList}\n<!-- MOVES END -->`
    )
    .replace(/".+board.+\.svg"/, `"./current/board_${boardId}.svg"`);
  const res = await octokit.request(
    `PUT /repos/{owner}/{repo}/contents/{path}`,
    {
      content: Buffer.from(nextContent).toString("base64"),
      message: "automated: update move links in readme",
      committer: { name: "Kifu.io", email: "pettengill.aaron@gmail.com" },
      owner: "airjp73",
      path: "README.md",
      repo: env.REPO_NAME,
      sha: existingResponse.data.sha,
      branch: "main",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return res.data;
};
