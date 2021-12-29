import { div } from "@thi.ng/hiccup-html/blocks";
import { button } from "@thi.ng/hiccup-html/forms";
import { newGame } from "../actions";
import { DB } from "../api";

export const controlsCmp = (db: DB) => {
  return div(
    {},
    button({ onclick: () => newGame(db), style: { width: "10vw", height: "10vh" } }, "New Game"),
  );
};
