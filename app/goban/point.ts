type LowercaseLetters =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";
type UppercaseLetters =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";
type AnyLetter = LowercaseLetters | UppercaseLetters;
export type Point = `${AnyLetter}${AnyLetter}`;

const L_A = "a".charCodeAt(0);
const U_A = "A".charCodeAt(0);

export const pointToCoords = (point: Point): [number, number] => {
  return [point.charCodeAt(0) - L_A, point.charCodeAt(1) - L_A];
};

export const coordsToPoint = (x: number, y: number): Point => {
  return String.fromCharCode(x + L_A, y + L_A) as Point;
};

export const coordToDisplayLetter = (coord: number): UppercaseLetters =>
  String.fromCharCode(coord + U_A + (coord >= 8 ? 1 : 0)) as UppercaseLetters;
export const displayLetterToCoord = (display: string): number =>
  display.charCodeAt(0) - U_A - (display.charCodeAt(0) >= 73 ? 1 : 0);

// Sgf coordinates start from the top left and go down,
// whereas the numbers displayed on the goban (and used by KataGo) start from the bottom left and go up.
export const coordToYNumber = (coord: number): number => 19 - coord;
export const yNumberToCoord = (y: number): number => 19 - y;

export function pointToDisplay(point: Point): string;
export function pointToDisplay(x: number, y: number): string;
export function pointToDisplay(x: Point | number, y?: number): string {
  const coords = typeof x === "string" ? pointToCoords(x) : [x, y!];
  return coordToDisplayLetter(coords[0]) + coordToYNumber(coords[1]);
}

export function displayToPoint(display: string): Point {
  const x = displayLetterToCoord(display.charAt(0));
  const y = yNumberToCoord(parseInt(display.slice(1)));
  return coordsToPoint(x, y);
}
