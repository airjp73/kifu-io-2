import { it, expect } from "vitest";
import * as point from "./point";

it("converts a point to coordinates", () => {
  expect(point.pointToCoords("ad")).toMatchObject([0, 3]);
  expect(point.pointToCoords("bc")).toMatchObject([1, 2]);
  expect(point.pointToCoords("cd")).toMatchObject([2, 3]);
  expect(point.pointToCoords("de")).toMatchObject([3, 4]);
  expect(point.pointToCoords("ef")).toMatchObject([4, 5]);
});

it("converts coordinates to a point", () => {
  expect(point.coordsToPoint(0, 3)).toBe("ad");
  expect(point.coordsToPoint(1, 2)).toBe("bc");
  expect(point.coordsToPoint(2, 3)).toBe("cd");
  expect(point.coordsToPoint(3, 4)).toBe("de");
  expect(point.coordsToPoint(4, 5)).toBe("ef");
});

it("converts a point to a display string", () => {
  expect(point.pointToDisplay("ad")).toBe("A16");
  expect(point.pointToDisplay("bc")).toBe("B17");
  expect(point.pointToDisplay("ba")).toBe("B19");
  expect(point.pointToDisplay("cd")).toBe("C16");
  expect(point.pointToDisplay("de")).toBe("D15");
  expect(point.pointToDisplay("ef")).toBe("E14");
  expect(point.pointToDisplay("kk")).toBe("L9");
});

it("converts a display string to a point", () => {
  expect(point.displayToPoint("A4")).toBe("ap");
  expect(point.displayToPoint("B3")).toBe("bq");
  expect(point.displayToPoint("C4")).toBe("cp");
  expect(point.displayToPoint("D5")).toBe("do");
  expect(point.displayToPoint("E6")).toBe("en");
  expect(point.displayToPoint("L11")).toBe("ki");
});
