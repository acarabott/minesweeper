import { div } from "@thi.ng/hiccup-html";
import { mapIndexed } from "@thi.ng/transducers";
import { getNumCols, getNumRows } from "../actions";
import { DB } from "../api";
import { cellCmp } from "./cellCmp";

export const gridCmp = (db: DB) => {
  const state = db.deref();

  return div(
    {
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        display: "grid",
        "grid-template-columns": `repeat(${getNumCols(state.grid)}, 1fr)`,
        "grid-template-rows": `repeat(${getNumRows(state.grid)}, 1fr)`,
      },
      onmousedown: () => {},
    },
    ...mapIndexed((y, row) => {
      return mapIndexed((x) => {
        return cellCmp(db, x, y);
      }, row);
    }, state.grid),
  );
};
