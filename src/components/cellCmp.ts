import { div } from "@thi.ng/hiccup-html";
import { getCellOrThrow, getMineCount, markCell, checkCell } from "../actions";
import { DB } from "../api";

export const cellCmp = (db: DB, col: number, row: number) => {
  const state = db.deref();
  const cell = getCellOrThrow(state.grid, col, row);

  const isRevealed = cell.isClicked || state.playState === "win" || state.playState === "lose";

  const mineCount = isRevealed ? getMineCount(state, col, row) : 0;

  const { text, background } = (() => {
    if (isRevealed) {
      if (cell.isMine) {
        return { text: "💣", background: "red" };
      }

      if (mineCount === 0) {
        return { text: "", background: "rgb(220, 220, 220)" };
      }

      return { text: `${mineCount}`, background: "rgb(220, 220, 220)" };
    } else if (cell.isFlagged) {
      return { text: "🚩", background: "rgb(220, 220, 220)" };
    } else {
      return { text: "?", background: "rgb(255, 255, 255)" };
    }
  })();

  return div(
    {
      oncontextmenu: (event) => {
        event.preventDefault();
        markCell(db, col, row);
      },
      onclick: () => {
        checkCell(db, col, row);
      },
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
        color:
          mineCount === 0
            ? " black"
            : mineCount === 1
            ? "green"
            : mineCount === 2
            ? "orange"
            : "red",
      },
    },
    text,
  );
};
