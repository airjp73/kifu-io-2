import type { SgfNodeInfo } from "../../sgf/parse";
import { handleCaptures } from "./boardLogic";
import type {
  GameState,
  MoveQualityType,
  PlayedOnDates,
  PositionStatus,
  StoneColor,
} from "../types";
import { z } from "zod";
import type { Point } from "~/goban/point";

const onlyOne = <T extends z.ZodSchema<any>>(zod: T) =>
  z
    .array(zod)
    .min(1)
    .max(1)
    .transform((val) => val[0]);
const singleNumber = onlyOne(z.coerce.number());
export const PointSchema = z
  .string()
  .regex(/^[a-zA-Z]{2}$/i)
  .transform((val) => val as Point);

export const processMove = (gameState: GameState, node: SgfNodeInfo) => {
  gameState.moveState = {
    lines: [],
    validationErrors: [],
    circles: [],
    triangles: [],
    squares: [],
    xMarks: [],
    labels: [],
  };

  performAdditionalValidations(gameState, node);

  Object.entries(node.data).forEach(([key, value]) => {
    if (key in supportedProperties) {
      supportedProperties[key as SupportedProperty](gameState, value);
    } else {
      gameState.moveState.validationErrors.push(`Unsupported property: ${key}`);
    }
  });
};

const placeStone = (
  gameState: GameState,
  value: string[],
  color: StoneColor
) => {
  setPoint(gameState, value, color);
  value.forEach((val) => handleCaptures(val, gameState));
  setPlayerToPlay(gameState, [color === "b" ? "w" : "b"]);
};

const setPoint = (
  gameState: GameState,
  value: string[],
  color: StoneColor | null
) => {
  const val = PointSchema.safeParse(value[0]);
  if (val.success) {
    gameState.boardState[val.data] = color;
  } else {
    gameState.moveState.validationErrors.push(
      `Invalid point: ${value.join(", ")}`
    );
  }
};

const setPlayerToPlay = (gameState: GameState, color: string[]) => {
  if (color[0] === "b") {
    gameState.moveState.playerToPlay = "b";
  } else if (color[0] === "w") {
    gameState.moveState.playerToPlay = "w";
  } else {
    gameState.moveState.validationErrors.push(
      `Invalid player to play: ${color[0]}`
    );
  }
  if (color.length > 1) {
    gameState.moveState.validationErrors.push(
      `Invalid player to play: ${color[0]}`
    );
  }
};
export const addComment = (gameState: GameState, comment: string[]) => {
  gameState.moveState.comment = comment.join(" ");
};

export const addName = (gameState: GameState, name: string[]) => {
  gameState.moveState.name = name.join(" ");
};

const setPositionStatus = (
  gameState: GameState,
  value: string[],
  status: PositionStatus["favoredPlayer"]
) => {
  const val = singleNumber.safeParse(value);
  if (val.success) {
    gameState.moveState.positionStatus = {
      favoredPlayer: status,
      magnitude: val.data,
    };
  } else {
    gameState.moveState.validationErrors.push(
      `Invalid position status: ${value.join(", ")}`
    );
  }
};

const setHotspot = (gameState: GameState, value: string[]) => {
  const val = singleNumber.safeParse(value);
  if (val.success) {
    gameState.moveState.hotspot = val.data > 1 ? "emphasized" : "normal";
  } else {
    gameState.moveState.validationErrors.push(
      `Invalid hotspot: ${value.join(", ")}`
    );
  }
};

const setEstimatedScore = (gameState: GameState, value: string[]) => {
  const val = singleNumber.safeParse(value);
  if (val.success) {
    gameState.moveState.estimatedScore = val.data;
  } else {
    gameState.moveState.validationErrors.push(
      `Invalid estimated score: ${value.join(", ")}`
    );
  }
};

const setMoveQuality = (
  gameState: GameState,
  value: string[],
  moveQuality: MoveQualityType
) => {
  const val = singleNumber.safeParse(value);
  if (val.success) {
    gameState.moveState.moveQuality = {
      quality: moveQuality,
      magnitude: val.data,
    };
  } else {
    gameState.moveState.validationErrors.push(
      `Invalid move quality: ${value.join(", ")}`
    );
  }
};

const addMarkup = (points: string[], errors: string[], value: string[]) => {
  const vals = value.map((v) => PointSchema.safeParse(v));
  vals.forEach((val) => {
    if (val.success) {
      points.push(val.data);
    } else {
      errors.push(`Invalid point for circle: ${value.join(", ")}`);
    }
  });
};

const addLines = (gameState: GameState, value: string[]) => {
  value.forEach((val) => {
    const data = val.split(":");
    const point1 = PointSchema.safeParse(data[0]);
    const point2 = PointSchema.safeParse(data[1]);
    if (point1.success && point2.success) {
      gameState.moveState.lines.push([point1.data, point2.data]);
    } else {
      gameState.moveState.validationErrors.push(
        `Invalid points for line: ${val}`
      );
    }
  });
};

const addLabels = (gameState: GameState, value: string[]) => {
  value.forEach((v) => {
    const data = v.split(":");
    const pointVal = PointSchema.safeParse(data[0]);
    if (pointVal.success)
      gameState.moveState.labels.push({
        point: pointVal.data,
        label: data[1] ?? "",
      });
    else
      gameState.moveState.validationErrors.push(
        `Invalid point for label: ${v}`
      );
  });
};

const setApplication = (gameState: GameState, value: string[]) => {
  const [name, version] = value[0]?.split(":") ?? [];
  if (name) gameState.properties.application = { name, version };
};

const setVariationDisplaySettings = (gameState: GameState, value: string[]) => {
  const val = singleNumber.safeParse(value);
  if (val.success) {
    gameState.properties.variationDisplay = {
      show: val.data < 2,
      showFor: val.data === 2 ? "NEXT_MOVE" : "CURRENT_MOVE",
    };
  } else {
    gameState.moveState.validationErrors.push(
      `Invalid variation display settings: ${value.join(", ")}`
    );
  }
};

const setBoardSize = (gameState: GameState, value: string[]) => {
  const val = singleNumber.safeParse(value);
  if (val.success) {
    gameState.properties.boardSize = [val.data, val.data];
  } else {
    gameState.moveState.validationErrors.push(
      `Invalid board size: ${value.join(", ")}`
    );
  }
};

type KeysWithType<Obj, T> = {
  [K in keyof Obj]: Obj[K] extends T ? K : never;
}[keyof Obj];

export const setProperty = (
  gameState: GameState,
  value: string[],
  propertyName: KeysWithType<Required<GameState["properties"]>, string>
) => {
  const r = value.join(" ");
  gameState.properties[propertyName] = r;
};

const setPlayedOnDate = (gameState: GameState, value: string[]) => {
  // TODO: can date-fns just do this?
  // This could probably be smarter, but it's not worthing investing too much time in
  const dateStrings = value[0].split(",");
  const results: PlayedOnDates = {};
  let currentYear: string,
    currentMonth: string | null,
    currentDay: number | null;
  dateStrings.forEach((dateString) => {
    // The SGF spec is strict about using dashes instead of slashes
    // but I've seen at least one example of an sgf using slashes
    const pieces = dateString.split(/-|\//);
    pieces.forEach((piece, index) => {
      if (piece.length === 4) {
        currentYear = piece;
        currentMonth = null;
        currentDay = null;
      } else if (
        (index === 1 && pieces[0].length === 4) ||
        (index === 0 && pieces.length === 2)
      ) {
        currentMonth = piece;
        currentDay = null;
      } else currentDay = parseInt(piece);
    });
    results[currentYear] = results[currentYear] || {};
    if (currentMonth) {
      results[currentYear][currentMonth] =
        results[currentYear][currentMonth] || [];
      if (currentDay) results[currentYear][currentMonth].push(currentDay);
    }
  });

  gameState.properties.playedOn = results;
};

const setTimeLimit = (gameState: GameState, value: string[]) => {
  const val = singleNumber.safeParse(value);
  if (val.success) {
    gameState.properties.timeLimit = val.data;
  } else {
    gameState.moveState.validationErrors.push(
      `Invalid time limit: ${value.join(", ")}`
    );
  }
};

const performAdditionalValidations = (
  gameState: GameState,
  node: SgfNodeInfo
) => {
  if (
    (node.data.AB || node.data.AE || node.data.AW || node.data.PL) &&
    (node.data.B || node.data.KO || node.data.MN || node.data.W)
  ) {
    gameState.moveState.validationErrors.push(
      "It is illegal to have setup properties and move properties in the same node"
    );
  }

  if (node.data.FF && node.data.FF[0] !== "4") {
    gameState.moveState.validationErrors.push(
      "Only SGF version 4 is supported"
    );
  }

  if (node.data.GM && node.data.GM[0] !== "1") {
    gameState.moveState.validationErrors.push("Only Go games are supported");
  }
};

const supportedProperties = {
  B: (gameState, value) => placeStone(gameState, value, "b"),
  W: (gameState, value) => placeStone(gameState, value, "w"),
  AB: (gameState, value) => setPoint(gameState, value, "b"),
  AW: (gameState, value) => setPoint(gameState, value, "w"),
  AE: (gameState, value) => setPoint(gameState, value, null),
  PL: (gameState, value) => setPlayerToPlay(gameState, value),
  C: (gameState, value) => addComment(gameState, value),
  N: (gameState, value) => addName(gameState, value),
  DM: (gameState, value) => setPositionStatus(gameState, value, "even"),
  GB: (gameState, value) => setPositionStatus(gameState, value, "b"),
  GW: (gameState, value) => setPositionStatus(gameState, value, "w"),
  UC: (gameState, value) => setPositionStatus(gameState, value, "unclear"),
  HO: (gameState, value) => setHotspot(gameState, value),
  V: (gameState, value) => setEstimatedScore(gameState, value),
  BM: (gameState, value) => setMoveQuality(gameState, value, "bad"),
  DO: (gameState, value) => setMoveQuality(gameState, value, "doubtful"),
  IT: (gameState, value) => setMoveQuality(gameState, value, "interesting"),
  TE: (gameState, value) => setMoveQuality(gameState, value, "tesuji"),
  LB: (gameState, value) => addLabels(gameState, value),
  CR: (gameState, value) =>
    addMarkup(
      gameState.moveState.circles,
      gameState.moveState.validationErrors,
      value
    ),
  TR: (gameState, value) =>
    addMarkup(
      gameState.moveState.triangles,
      gameState.moveState.validationErrors,
      value
    ),
  SQ: (gameState, value) =>
    addMarkup(
      gameState.moveState.squares,
      gameState.moveState.validationErrors,
      value
    ),
  MA: (gameState, value) =>
    addMarkup(
      gameState.moveState.xMarks,
      gameState.moveState.validationErrors,
      value
    ),
  LN: (gameState, value) => addLines(gameState, value),
  AP: (gameState, value) => setApplication(gameState, value),
  ST: (gameState, value) => setVariationDisplaySettings(gameState, value),
  SZ: (gameState, value) => setBoardSize(gameState, value),
  DT: (gameState, value) => setPlayedOnDate(gameState, value),
  TM: (gameState, value) => setTimeLimit(gameState, value),
  AN: (gameState, value) => setProperty(gameState, value, "annotatorName"),
  PB: (gameState, value) => setProperty(gameState, value, "playerBlack"),
  BT: (gameState, value) => setProperty(gameState, value, "teamBlack"),
  BR: (gameState, value) => setProperty(gameState, value, "rankBlack"),
  PW: (gameState, value) => setProperty(gameState, value, "playerWhite"),
  WR: (gameState, value) => setProperty(gameState, value, "rankWhite"),
  WT: (gameState, value) => setProperty(gameState, value, "teamWhite"),
  CP: (gameState, value) => setProperty(gameState, value, "copyright"),
  EV: (gameState, value) => setProperty(gameState, value, "eventName"),
  GN: (gameState, value) => setProperty(gameState, value, "gameName"),
  GC: (gameState, value) => setProperty(gameState, value, "gameComment"),
  ON: (gameState, value) => setProperty(gameState, value, "opening"),
  OT: (gameState, value) => setProperty(gameState, value, "overtime"),
  RE: (gameState, value) => setProperty(gameState, value, "result"),
  RO: (gameState, value) => setProperty(gameState, value, "round"),
  RU: (gameState, value) => setProperty(gameState, value, "ruleSet"),
  SO: (gameState, value) => setProperty(gameState, value, "source"),
  US: (gameState, value) =>
    setProperty(gameState, value, "userEnteringGameRecord"),
} satisfies Record<string, (gameState: GameState, value: string[]) => void>;

type SupportedProperty = keyof typeof supportedProperties;
