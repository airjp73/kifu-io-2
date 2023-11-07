import * as fs from "fs";
import { prerenderSvgs } from "~/gh_game/prerender";
import { updateSvgs } from "~/gh_game/updateReadme";

const content = await fs.promises.readFile("./game.sgf", "utf-8");

await fetch("http://localhost:3000/gh_game/update", {
  method: "POST",
  body: JSON.stringify({
    sgf: content,
  }),
});

// await updateSvgs(prerenderSvgs());
