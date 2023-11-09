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

export function pointToDisplay(point: Point): string;
export function pointToDisplay(x: number, y: number): string;
export function pointToDisplay(x: Point | number, y?: number): string {
  const coords = typeof x === "string" ? pointToCoords(x) : [x, y!];
  return (
    String.fromCharCode(coords[1] + U_A + (coords[1] >= 8 ? 1 : 0)) +
    (coords[0] + 1)
  );
}
