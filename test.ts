const body = JSON.stringify({ secret: process.env.AI_MOVE_SECRET });
const res = await fetch("http://localhost:3000/gh_game/sync", {
  method: "POST",
  body,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log(res.status, res.statusText, await res.text());
