import { Fragment } from "react";
import { renderToString } from "react-dom/server";
import { env } from "~/env";
import { type GobanState } from "~/goban/state/gobanState/state";
import type { StoneColor } from "~/goban/state/types";
import * as d3 from "d3";

const CAP_A = "A".charCodeAt(0);
const A = "a".charCodeAt(0);

export function prerenderGoban(state: GobanState) {
  const viewBox = {
    xStart: 0,
    yStart: 0,
    xEnd: 100,
    yEnd: 100,
  };
  const boardMargins = {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
  };

  // Giving the board a 20x20 coordinate system
  // Where the top left is (1, 1) and the bottom right is (19, 19)
  // This makes it easier to place coordinates just outside the board at the right spots
  const scale = d3
    .scaleLinear()
    .range([
      viewBox.xStart + boardMargins.left,
      viewBox.xEnd - boardMargins.right,
    ])
    .domain([0, 20]);
  const onePoint = scale(1) - scale(0);

  const eachPoint = Array.from({ length: 19 }).map((_, i) => i);

  const starPoints = [
    [4, 4],
    [4, 10],
    [4, 16],
    [10, 4],
    [10, 10],
    [10, 16],
    [16, 4],
    [16, 10],
    [16, 16],
  ];

  return renderToString(
    <svg
      viewBox={`${viewBox.xStart} ${viewBox.yStart} ${viewBox.xEnd} ${viewBox.yEnd}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        height={boardMargins.bottom + viewBox.yEnd}
        width={boardMargins.right + viewBox.xEnd}
        fill="#DDBB83"
      />
      {eachPoint.map((x) => (
        <line
          key={x}
          x1={scale(x + 1)}
          x2={scale(x + 1)}
          y1={scale(1)}
          y2={scale(19)}
          stroke="#000"
          strokeWidth={0.3}
          strokeLinecap="round"
        />
      ))}
      {eachPoint.map((y) => (
        <line
          key={y}
          x1={scale(1)}
          x2={scale(19)}
          y1={scale(y + 1)}
          y2={scale(y + 1)}
          stroke="#000"
          strokeWidth={0.3}
          strokeLinecap="round"
        />
      ))}
      {eachPoint.map((y) => (
        <text
          key={y}
          x={scale(0)}
          y={scale(y + 1)}
          fontSize={onePoint * 0.65}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontFamily="sans-serif"
        >
          {String.fromCharCode(CAP_A + y + (y >= 8 ? 1 : 0))}
        </text>
      ))}
      {eachPoint.map((y) => (
        <text
          key={y}
          x={scale(20)}
          y={scale(y + 1)}
          fontSize={onePoint * 0.65}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontFamily="sans-serif"
        >
          {String.fromCharCode(CAP_A + y + (y >= 8 ? 1 : 0))}
        </text>
      ))}
      {eachPoint.map((x) => (
        <text
          key={x}
          x={scale(x + 1)}
          y={scale(0)}
          fontSize={onePoint * 0.65}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontFamily="sans-serif"
        >
          {x + 1}
        </text>
      ))}
      {eachPoint.map((x) => (
        <text
          key={x}
          x={scale(x + 1)}
          y={scale(20)}
          fontSize={onePoint * 0.65}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontFamily="sans-serif"
        >
          {x + 1}
        </text>
      ))}
      {starPoints.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={scale(x)} cy={scale(y)} r={0.75} />
      ))}
      <defs>
        <filter id="dropShadow">
          <feDropShadow
            dx="0.1"
            dy="0.1"
            stdDeviation="0.1"
            floodColor="#000"
            floodOpacity="0.5"
          />
        </filter>
        <linearGradient id="white-gradient" gradientTransform="rotate(45)">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#ddd" />
        </linearGradient>
        <linearGradient id="black-gradient" gradientTransform="rotate(45)">
          <stop offset="0%" stopColor="#444" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
      </defs>
      {Object.entries(state.gameState.boardState).map(([point, stone]) => (
        <circle
          key={point}
          cx={scale(point.charCodeAt(0) - A + 1)}
          cy={scale(point.charCodeAt(1) - A + 1)}
          r={onePoint * 0.45}
          fill={`url(#${stone === "b" ? "black" : "white"}-gradient)`}
          style={{ filter: "url(#dropShadow)" }}
        />
      ))}
    </svg>
  );
}

export function prerenderGobanPiecemeal(state: GobanState) {
  const getCacheKey = (x: number, y: number, stone?: StoneColor | null) => {
    const color = stone === "b" ? "black" : stone === "w" ? "white" : "empty";
    if (x === 0 && y === 0) return `${color}_upperLeft`;
    if (x === 0 && y === 18) return `${color}_lowerLeft`;
    if (x === 18 && y === 0) return `${color}_upperRight`;
    if (x === 18 && y === 18) return `${color}_lowerRight`;
    if (x === 0) return `${color}_left`;
    if (x === 18) return `${color}_right`;
    if (y === 0) return `${color}_top`;
    if (y === 18) return `${color}_bottom`;
    return `${color}_center`;
  };

  return renderToString(
    <div>
      {Array.from({ length: state.gameState.properties.boardSize?.[1] ?? 19 })
        .fill(0)
        .map((_, y) => (
          <div dir="horizontal" key={y}>
            {Array.from({
              length: state.gameState.properties.boardSize?.[0] ?? 19,
            })
              .fill(0)
              .map((_, x) => {
                const yLetter = String.fromCharCode(y + A + (y >= 8 ? 1 : 0));
                const point =
                  String.fromCharCode(x + A) + String.fromCharCode(y + A);

                return (
                  <Fragment key={x}>
                    <a
                      key={x}
                      rel="noopener noreferrer nofollow"
                      href={`${env.SERVER_LOCATION}/gh_game/move?point=${point}`}
                      style={{ lineHeight: 1 }}
                    >
                      <img
                        width={25}
                        height={25}
                        key={x}
                        alt={`Point ${yLetter}-${x + 1}`}
                        src={`/svg/${getCacheKey(
                          x,
                          y,
                          state.gameState.boardState[point]
                        )}.svg`}
                      />
                    </a>
                  </Fragment>
                );
              })}
          </div>
        ))}
    </div>
  );
}

export function prerenderSvgs() {
  const makeSvg = (x: number, y: number, stone: StoneColor | null) =>
    renderToString(
      <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <rect height={100} width={100} fill="#DDBB83" />
        <line
          x1={x === 0 ? 15 : 0}
          x2={x === 18 ? 15 : 30}
          y1={15}
          y2={15}
          stroke="#000"
          strokeWidth={2}
        />
        <line
          x1={15}
          x2={15}
          y1={y === 0 ? 15 : 0}
          y2={y === 18 ? 15 : 30}
          stroke="#000"
          strokeWidth={2}
        />
        {stone && (
          <circle
            fill={stone === "b" ? "#000" : "#fff"}
            cx={15}
            cy={15}
            r={12}
            stroke="#777"
            strokeWidth={2}
          />
        )}
      </svg>
    );

  return {
    black_upperLeft: makeSvg(0, 0, "b"),
    black_lowerLeft: makeSvg(0, 18, "b"),
    black_upperRight: makeSvg(18, 0, "b"),
    black_lowerRight: makeSvg(18, 18, "b"),
    black_top: makeSvg(9, 0, "b"),
    black_left: makeSvg(0, 9, "b"),
    black_right: makeSvg(18, 9, "b"),
    black_bottom: makeSvg(9, 18, "b"),
    black_center: makeSvg(9, 9, "b"),
    white_upperLeft: makeSvg(0, 0, "w"),
    white_lowerLeft: makeSvg(0, 18, "w"),
    white_upperRight: makeSvg(18, 0, "w"),
    white_lowerRight: makeSvg(18, 18, "w"),
    white_top: makeSvg(9, 0, "w"),
    white_left: makeSvg(0, 9, "w"),
    white_right: makeSvg(18, 9, "w"),
    white_bottom: makeSvg(9, 18, "w"),
    white_center: makeSvg(9, 9, "w"),
    empty_upperLeft: makeSvg(0, 0, null),
    empty_lowerLeft: makeSvg(0, 18, null),
    empty_upperRight: makeSvg(18, 0, null),
    empty_lowerRight: makeSvg(18, 18, null),
    empty_top: makeSvg(9, 0, null),
    empty_left: makeSvg(0, 9, null),
    empty_right: makeSvg(18, 9, null),
    empty_bottom: makeSvg(9, 18, null),
    empty_center: makeSvg(9, 9, null),
  };
}