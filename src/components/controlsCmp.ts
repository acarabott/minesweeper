import { div } from "@thi.ng/hiccup-html/blocks";
import { button, inputNumber, inputRange, label } from "@thi.ng/hiccup-html/forms";
import { clamp01 } from "@thi.ng/math";
import { getNumCols, getNumRows, newGame } from "../actions";
import { DB } from "../api";

export const defControlsCmp = (db: DB) => {
  const initialState = db.deref();

  const colsID = "controls-cols";
  let newCols = getNumCols(initialState.grid);

  const rowsID = "controls-rows";
  let newRows = getNumRows(initialState.grid);

  const difficultyID = "controls-difficulty";
  let difficulty_01 = initialState.difficulty_01;

  return () =>
    div(
      {},
      label({ for: colsID }, "Columns:"),
      inputNumber({
        id: colsID,
        onchange: (event) =>
          (newCols = Math.max(0, (event.target as HTMLInputElement).valueAsNumber)),
        min: 2,
        max: 64,
        step: 1,
        value: newCols,
      }),

      label({ for: rowsID }, "Rows:"),
      inputNumber({
        id: rowsID,
        onchange: (event) =>
          (newRows = Math.max(0, (event.target as HTMLInputElement).valueAsNumber)),
        min: 2,
        max: 64,
        step: 1,
        value: newRows,
      }),

      label({ for: difficultyID }, "Difficulty"),
      inputRange({
        id: difficultyID,
        min: 0.0,
        max: 1.0,
        step: 0.05,
        value: difficulty_01,
        onchange: (event) =>
          (difficulty_01 = clamp01((event.target as HTMLInputElement).valueAsNumber)),
      }),

      button(
        {
          onclick: () => {
            newGame(db, newCols, newRows, difficulty_01);
          },
          style: { width: "10vw", height: "10vh" },
        },
        "New Game",
      ),
    );
};
