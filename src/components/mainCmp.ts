import { div } from "@thi.ng/hiccup-html/blocks";
import { DB } from "../api";
import { defControlsCmp } from "./controlsCmp";
import { gridCmp } from "./gridCmp";
import { winLoseCmp } from "./winLoseCmp";

export const defMainCmp = (db: DB) => {
  const controlsCmp = defControlsCmp(db);

  return () =>
    div(
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
      controlsCmp(),
    );
};
