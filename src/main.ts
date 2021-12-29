import { defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { button, div } from "@thi.ng/hiccup-html";
import { mapIndexed } from "@thi.ng/transducers";
import {
  checkSquare,
  createGame,
  getMineCount,
  getSquareOrThrow,
  markSquare,
  newGame,
} from "./actions";
import { DB, State } from "./api";

const squareCmp = (db: DB, col: number, row: number) => {
  const state = db.deref();
  const square = getSquareOrThrow(state.grid, col, row);

  const isRevealed = square.isClicked || state.playState === "win" || state.playState === "lose";

  const mineCount = isRevealed ? getMineCount(state, col, row) : 0;

  const text = (() => {
    if (isRevealed) {
      if (square.isMine) {
        return "💣";
      }

      if (mineCount === 0) {
        return "";
      }

      return `${mineCount}`;
    } else if (square.isFlagged) {
      return "🚩";
    } else {
      return "?";
    }
  })();

  return div(
    {
      oncontextmenu: (event) => {
        event.preventDefault();
        markSquare(db, col, row);
      },
      onclick: () => {
        checkSquare(db, col, row);
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
        background: !square.isClicked ? "white" : square.isMine ? "red" : "rgb(220, 220, 220)",
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

const gridCmp = (db: DB) => {
  const state = db.deref();

  return div(
    {
      style: {
        border: "1px red solid",
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        display: "grid",
        "grid-template-columns": `repeat(${state.grid[0].length}, 1fr)`,
        "grid-template-rows": `repeat(${state.grid.length}, 1fr)`,
      },
      onmousedown: () => {},
    },
    ...mapIndexed((y, row) => {
      return mapIndexed((x) => {
        return squareCmp(db, x, y);
      }, row);
    }, state.grid),
  );
};

const overlayCmp = (db: DB) => {
  const state = db.deref();

  return state.playState === "playing"
    ? null
    : div(
        {
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            background:
              state.playState === "win" ? "rgb(43, 212, 156, 0.5)" : "rgba(43, 156, 212, 0.5)",
            "font-size": "10vh",
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
          },
        },
        state.playState === "win"
          ? "Winner, Winner, Chicken Dinner!"
          : "It's Game Over man, it's just Game Over",
      );
};

const controlsCmp = (db: DB) => {
  return div(
    {},
    button({ onclick: () => newGame(db), style: { width: "10vw", height: "10vh" } }, "New Game"),
  );
};

const app = (db: DB) => {
  return () => {
    const state = db.deref();

    console.assert(state.grid.length > 0 && state.grid[0].length > 0);

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
        overlayCmp(db),
      ),
      controlsCmp(db),
    );
  };
};

start(app(defAtom<State>(createGame())), { root: document.body });
