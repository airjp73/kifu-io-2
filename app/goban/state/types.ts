export type StoneColor = "b" | "w";

export interface BoardState {
  [key: string]: StoneColor | null;
}

export type NormalOrEmphasized = "normal" | "emphasized";

export interface MoveState {
  circles: string[];
  comment?: string;
  estimatedScore?: number;
  hotspot?: NormalOrEmphasized;
  lines: [string, string][];
  moveQuality?: MoveQuality;
  name?: string;
  playerToPlay?: StoneColor;
  positionStatus?: PositionStatus;
  squares: string[];
  triangles: string[];
  xMarks: string[];
  labels: { point: string; label: string }[];
  validationErrors: string[];
}

export interface GameState {
  properties: GameStateProperties;
  boardState: BoardState;
  moveState: MoveState;
  captureCounts: CaptureCounts;
}

export type CaptureCounts = {
  b: number;
  w: number;
};

export type MoveQualityType = "bad" | "doubtful" | "interesting" | "tesuji";

export interface MoveQuality {
  quality: MoveQualityType;
  magnitude?: number;
}

export interface GameStateProperties {
  annotatorName?: string;
  application?: { name: string; version: string };
  boardSize?: [number, number];
  copyright?: string;
  eventName?: string;
  gameComment?: string;
  gameName?: string;
  opening?: string;
  overtime?: string;
  placePlayed?: string;
  playedOn?: PlayedOnDates;
  playerBlack?: string;
  playerWhite?: string;
  rankBlack?: string;
  rankWhite?: string;
  result?: string;
  round?: string; // something?
  ruleSet?: string;
  source?: string;
  teamBlack?: string;
  teamWhite?: string;
  timeLimit?: number;
  userEnteringGameRecord?: string;
  variationDisplay?: { show: boolean; showFor: "NEXT_MOVE" | "CURRENT_MOVE" };
}

export interface PlayedOnDates {
  [key: string]: {
    [key: string]: number[];
  };
}

export interface PositionStatus {
  favoredPlayer: StoneColor | "even" | "unclear";
  magnitude: number;
}
