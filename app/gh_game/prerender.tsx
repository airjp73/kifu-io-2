import { renderToString } from "react-dom/server";
import { type GobanState } from "~/goban/state/gobanState/state";
import * as d3 from "d3";
import type { Point } from "~/goban/point";
import { coordToDisplayLetter, pointToCoords } from "~/goban/point";
import { PointSchema } from "~/goban/state/boardState/mutations";

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

  const renderLastPlayedMove = () => {
    if (!state.currentMove) return null;
    const data = state.sgf.nodes[state.currentMove].data;
    const point = (data?.W ?? data?.B)?.[0];
    if (!point) return null;
    const [x, y] = pointToCoords(PointSchema.parse(point));
    return (
      <circle
        cx={scale(x + 1)}
        cy={scale(y + 1)}
        r={onePoint * 0.25}
        fillOpacity={0}
        stroke={data.B ? "#fff" : "#000"}
        strokeWidth={0.15}
      />
    );
  };

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
          strokeWidth={0.2}
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
          strokeWidth={0.2}
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
          {y + 1}
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
          {y + 1}
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
          {coordToDisplayLetter(x)}
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
          {coordToDisplayLetter(x)}
        </text>
      ))}
      {starPoints.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={scale(x)} cy={scale(y)} r={0.65} />
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
      {Object.entries(state.gameState.boardState).map(([point, stone]) => {
        const [x, y] = pointToCoords(point as Point);
        return (
          <circle
            key={point}
            cx={scale(x + 1)}
            cy={scale(y + 1)}
            r={onePoint * 0.45}
            fill={`url(#${stone === "b" ? "black" : "white"}-gradient)`}
            style={{ filter: "url(#dropShadow)" }}
          />
        );
      })}
      {renderLastPlayedMove()}
    </svg>
  );
}
