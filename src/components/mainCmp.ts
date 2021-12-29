import { div } from "@thi.ng/hiccup-html/blocks";
import { DB } from "../api";
import { controlsCmp } from "./controlsCmp";
import { gridCmp } from "./gridCmp";
import { winLoseCmp } from "./winLoseCmp";

export const mainCmp = (db: DB) => {
  return div(
    {},
    div(
      {
        style: {
          position: "relative",
          width: "80vw",
          height: "80vh",
        },
      },
      gridCmp(db),
      winLoseCmp(db),
    ),
    controlsCmp(db),
  );
};
