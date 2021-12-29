import { div } from "@thi.ng/hiccup-html";
import { getCellOrThrow, getMineCount, markCell, checkCell } from "../actions";
import { DB } from "../api";

export const cellCmp = (db: DB, col: number, row: number) => {
  const state = db.deref();
  const cell = getCellOrThrow(state.grid, col, row);

  const { text, background, color } = (() => {
    const color = "black";

    if (cell.isClicked || state.playState === "win" || state.playState === "lose") {
      if (cell.isMine) {
        return { text: "💣", background: "red", color };
      }

      const mineCount = getMineCount(state, col, row);

      if (mineCount === 0) {
        return { text: "", background: "rgb(220, 220, 220)", color };
      }

      return {
        text: `${mineCount}`,
        background: "rgb(220, 220, 220)",
        color: mineCount === 1 ? "green" : mineCount === 2 ? "green" : "red",
      };
    } else if (cell.isFlagged) {
      return { text: "🚩", background: "rgb(220, 220, 220)", color };
    } else {
      return { text: "?", background: "rgb(255, 255, 255)", color };
    }
  })();

  return div(
    {
      oncontextmenu: (event) => {
        // right click
        event.preventDefault();
        markCell(db, col, row);
      },
      onclick: () => checkCell(db, col, row),
      style: {
        "font-size": "4vh",
        "grid-column-start": col + 1,
        "grid-column-end": col + 2,
        "grid-row-start": row + 1,
        "grid-row-end": row + 2,
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        border: "1px black solid",
        background,
        color,
      },
    },
    text,
  );
};
