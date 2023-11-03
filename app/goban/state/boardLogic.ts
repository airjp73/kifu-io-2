import type { GameState } from "./types";

const getLiberties = (
  point: string,
  boardSize: [number, number] = [19, 19]
): string[] => {
  const A = "a".charCodeAt(0);
  const x = point.charCodeAt(0) - A;
  const y = point.charCodeAt(1) - A;
  return [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ]
    .filter(
      ([xLib, yLib]) =>
        xLib < boardSize[0] && xLib >= 0 && yLib < boardSize[1] && yLib >= 0
    )
    .map(
      ([xLib, yLib]) =>
        `${String.fromCharCode(xLib + A)}${String.fromCharCode(yLib + A)}`
    );
};

export const handleCaptures = (addedStone: string, gameState: GameState) => {
  const { boardState, properties } = gameState;

  const affectedStones = getLiberties(addedStone, properties.boardSize).filter(
    (liberty) => !!boardState[liberty]
  );
  affectedStones.push(addedStone); // Include addedStone to account for self-capture

  const capturedStones: string[] = [];
  const selfCapturedStones: string[] = [];
  const safeStones = new Set<string>();

  affectedStones.forEach((point) => {
    // If stone has already been captured, or is already safe, abort
    if (
      capturedStones.includes(point) ||
      selfCapturedStones.includes(point) ||
      safeStones.has(point)
    ) {
      return;
    }

    const color = boardState[point];
    const stonesInGroup: string[] = [point];

    for (let i = 0; i < stonesInGroup.length; ++i) {
      const liberties = getLiberties(stonesInGroup[i], properties.boardSize);
      for (const liberty of liberties) {
        if (!boardState[liberty]) {
          // Empty liberty, don't capture this group
          stonesInGroup.forEach((stone) => safeStones.add(stone));
          return;
        } else if (boardState[liberty] === color) {
          // If this stone is safe already, then we know this group has liberties
          if (safeStones.has(liberty)) return;
          // Same color means it's part of the group we're currently checking
          if (!stonesInGroup.includes(liberty)) {
            stonesInGroup.push(liberty);
          }
        }
        // Different color, do nothing
      }
    }

    // There are rule-sets that allow suicide moves so we have to check
    if (stonesInGroup.includes(addedStone)) {
      selfCapturedStones.push(...stonesInGroup);
    } else {
      capturedStones.push(...stonesInGroup);
    }
  });

  const captures = capturedStones.length ? capturedStones : selfCapturedStones;
  if (captures.length > 0) {
    const color = boardState[captures[0]];
    if (color) gameState.captureCounts[color] += captures.length;
    captures.forEach((stone) => {
      delete boardState[stone];
    });
  }
};
