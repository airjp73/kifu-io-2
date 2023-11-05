const A = "a".charCodeAt(0);
const BOARD_SIZE = 19;

export default function GhImages() {
  return (
    <div>
      <h1>Test board</h1>
      {Array.from({ length: BOARD_SIZE })
        .fill(0)
        .map((_, y) => (
          <div key={y} style={{ display: "flex" }}>
            {Array.from({ length: BOARD_SIZE })
              .fill(0)
              .map((_, x) => {
                const yLetter = String.fromCharCode(y + A + (y >= 8 ? 1 : 0));
                const point =
                  String.fromCharCode(x + A) + String.fromCharCode(y + A);
                return (
                  <a key={x} href={`/gh_game/move?point=${point}`}>
                    <img
                      height={25}
                      width={25}
                      alt={`Point ${yLetter}-${x + 1}`}
                      src={`/gh_game/point?point=${point}`}
                    />
                  </a>
                );
              })}
          </div>
        ))}
    </div>
  );
}
