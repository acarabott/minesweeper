import { range } from "@thi.ng/transducers";
import { map } from "@thi.ng/transducers/map";
import { DB, Grid, Square, State } from "./api";

// prettier-ignore
const NEIGHBOR_DELTAS = [
  { col: -1, row: -1 }, // nw
  { col: 0, row: -1 },  // n
  { col: 1, row: -1 },  // ne
  { col: -1, row: 0 },  // w
  { col: 1, row: 0 },   // e
  { col: -1, row: 1 },  // sw
  { col: 0, row: 1 },   // s
  { col: 1, row: 1 },   // se
];

const isValidPosition = (grid: Grid, col: number, row: number): boolean => {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
};

export const getSquare = (grid: Grid, col: number, row: number): Square | undefined => {
  if (!isValidPosition(grid, col, row)) {
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

export const checkSquare_ = (state: State, col: number, row: number): State => {
  const square = getSquareOrThrow(state.grid, col, row);
  if (square.isClicked) {
    return state;
  }

  square.isClicked = true;

  const mineCount = getMineCount(state, col, row);

  if (mineCount === 0) {
    for (const delta of NEIGHBOR_DELTAS) {
      const neighborCol = col + delta.col;
      const neighborRow = row + delta.row;
      const neighborSquare = getSquare(state.grid, neighborCol, neighborRow);
      const neighborMineCount = getMineCount(state, neighborCol, neighborRow);
      if (neighborSquare !== undefined && !neighborSquare.isMine) {
        if (neighborMineCount === 0) {
          state = checkSquare_(state, neighborCol, neighborRow);
        } else {
          neighborSquare.isClicked = true;
        }
      }
    }
  }

  if (square.isMine) {
    state.playState = "lose";
  } else {
    const allChecked = state.grid.flat().every((square) => square.isClicked || square.isMine);
    if (allChecked) {
      state.playState = "win";
    }
  }

  return state;
};

export const checkSquare = (db: DB, col: number, row: number) =>
  db.reset(checkSquare_(db.deref(), col, row));

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
    grid: createGrid(9, 9, 0.1),
    playState: "playing",
  };
};

export const newGame = (db: DB) => {
  db.reset(createGame());
};

export const getMineCount = (state: State, col: number, row: number): number => {
  const count = NEIGHBOR_DELTAS.reduce((accum, { col: colDelta, row: rowDelta }) => {
    const square = getSquare(state.grid, col + colDelta, row + rowDelta);

    if (square === undefined || !square.isMine) {
      return accum;
    }

    return accum + 1;
  }, 0);

  return count;
};
