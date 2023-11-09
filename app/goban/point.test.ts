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
  expect(point.pointToDisplay("ad")).toBe("A4");
  expect(point.pointToDisplay("bc")).toBe("B3");
  expect(point.pointToDisplay("cd")).toBe("C4");
  expect(point.pointToDisplay("de")).toBe("D5");
  expect(point.pointToDisplay("ef")).toBe("E6");
  expect(point.pointToDisplay("kk")).toBe("L11");
});