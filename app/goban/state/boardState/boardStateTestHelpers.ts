import type { BoardState, GameState } from "../types";

/**
 * A test helper to allow for creating board states for tests in a visual way.
 *
 * @param boardStateString A string representation of the board
 * @param size an array of 2 numbers representing the dimensions of the board
 */
export const createBoardStateFromString = (
  boardStateString: string,
  size: [number, number]
): BoardState => {
  const noWhitespace = boardStateString.replace(/\s/g, "");
  const A = "a".charCodeAt(0);

  const boardState: BoardState = {};
  for (let x = 0; x < size[0]; ++x) {
    for (let y = 0; y < size[1]; ++y) {
      const value = noWhitespace.charAt(y * size[0] + x);
      if (value === "b" || value === "w") {
        const point = String.fromCharCode(A + x) + String.fromCharCode(A + y);
        boardState[point] = value;
      }
    }
  }

  return boardState;
};

export const createStringFromGameState = (gameState: GameState): string => {
  const { boardState, captureCounts, properties } = gameState;
  const {
    playerBlack,
    playerWhite,
    teamBlack,
    teamWhite,
    rankBlack,
    rankWhite,
    boardSize,
  } = properties;
  const playerString = (player?: string, team?: string, rank?: string) =>
    `${player || team} ${rank}`;
  return (
    "\n" +
    "Players:\n" +
    `Black: ${playerString(playerBlack, teamBlack, rankBlack)}\n` +
    `White: ${playerString(playerWhite, teamWhite, rankWhite)}\n\n` +
    "Captures:\n" +
    `Black: ${captureCounts.b}\n` +
    `White: ${captureCounts.w}\n\n` +
    `Board:\n${createStringFromBoardState(boardState, boardSize ?? [19, 19])}`
  );
};

export const createStringFromBoardState = (
  boardState: BoardState,
  size: [number, number]
): string => {
  let boardString = "";
  const A = "a".charCodeAt(0);
  for (let y = 0; y < size[1]; ++y) {
    for (let x = 0; x < size[0]; ++x) {
      const point = String.fromCharCode(x + A) + String.fromCharCode(y + A);
      const value = boardState[point];
      // Using red and blue because black and white are hard to see in the text editor
      if (value === "b") {
        boardString += "🔴️";
      } else if (value === "w") {
        boardString += "🔵️";
      } else {
        boardString += "⚫";
      }
    }
    boardString += "\n";
  }
  return boardString;
};
