import { range } from "@thi.ng/transducers";
import { map } from "@thi.ng/transducers/map";
import { DB, Grid, Square, State } from "./api";

export const getSquare = (grid: Grid, col: number, row: number): Square | undefined => {
  if (col < 0 || col >= grid[0].length || row < 0 || row >= grid.length) {
    return undefined;
  }
  return grid[row][col];
};

export const getSquareOrThrow = (grid: Grid, col: number, row: number): Square => {
  const square = getSquare(grid, col, row);

  if (square === undefined) {
    throw new RangeError(`Bad square co-ordinates: ${col}, ${row}`);
  }

  return square;
};

export const checkSquare = (db: DB, col: number, row: number) => {
  const state = db.deref();
  const square = getSquareOrThrow(state.grid, col, row);

  square.isClicked = true;

  if (square.isMine) {
    state.playState = "lose";
  } else {
    const allChecked = state.grid.flat().every((square) => square.isClicked || square.isMine);
    if (allChecked) {
      state.playState = "win";
    }
  }

  db.reset(state);
};

export const markSquare = (db: DB, col: number, row: number) => {
  const state = db.deref();
  const square = getSquareOrThrow(state.grid, col, row);

  square.isFlagged = !square.isFlagged;

  db.reset(state);
};

export const createGrid = (width: number, height: number, chanceOfMine: number): Grid => {
  console.assert(chanceOfMine >= 0.0 && chanceOfMine <= 1.0);

  return [
    ...map((): Square[] => {
      return [
        ...map((): Square => {
          return {
            isMine: Math.random() < chanceOfMine,
            isClicked: false,
            isFlagged: false,
          };
        }, range(height)),
      ];
    }, range(width)),
  ];
};

export const createGame = (): State => {
  return {
    grid: createGrid(9, 9, 0.2),
    playState: "playing",
  };
};

export const newGame = (db: DB) => {
  db.reset(createGame());
};

export const getMineCount = (db: DB, col: number, row: number): number => {
  const state = db.deref();

  const nw = [-1, -1];
  const n = [0, -1];
  const ne = [1, -1];
  const w = [-1, 0];
  const e = [1, 0];
  const sw = [-1, 1];
  const s = [0, 1];
  const se = [1, 1];

  const count = [nw, n, ne, w, e, sw, s, se].reduce((accum, [colDelta, rowDelta]) => {
    const square = getSquare(state.grid, col + colDelta, row + rowDelta);

    if (square === undefined || !square.isMine) {
      return accum;
    }

    return accum + 1;
  }, 0);

  return count;
};
