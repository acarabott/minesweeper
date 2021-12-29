import { range } from "@thi.ng/transducers";
import { map } from "@thi.ng/transducers/map";
import {
  DB,
  Grid,
  Cell,
  State,
  DEFAULT_NUM_COLS,
  DEFAULT_NUM_ROWS,
  DEFAULT_CHANCE_OF_MINE,
  Row,
} from "./api";

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

// helpers
// -----------------------------------------------------------------------------

export const getNumRows = (grid: Grid): number => grid.length;

export const getNumCols = (grid: Grid): number => (grid.length > 0 ? grid[0].length : 0);

const isValidPosition = (grid: Grid, col: number, row: number): boolean => {
  return row >= 0 && row < getNumRows(grid) && col >= 0 && col < getNumCols(grid);
};

const getCell = (grid: Grid, col: number, row: number): Cell | undefined => {
  if (!isValidPosition(grid, col, row)) {
    return undefined;
  }

  return grid[row][col];
};

export const getCellOrThrow = (grid: Grid, col: number, row: number): Cell => {
  const cell = getCell(grid, col, row);

  if (cell === undefined) {
    throw new RangeError(`Bad cell co-ordinates: ${col}, ${row}`);
  }

  return cell;
};

export const getMineCount = (state: State, col: number, row: number): number => {
  const count = NEIGHBOR_DELTAS.reduce((accum, { col: colDelta, row: rowDelta }) => {
    const cell = getCell(state.grid, col + colDelta, row + rowDelta);

    if (cell === undefined || !cell.isMine) {
      return accum;
    }

    return accum + 1;
  }, 0);

  return count;
};

// user actions
// -----------------------------------------------------------------------------

const _checkCell = (state: State, col: number, row: number): State => {
  const cell = getCellOrThrow(state.grid, col, row);
  if (cell.isClicked) {
    return state;
  }

  cell.isClicked = true;

  const mineCount = getMineCount(state, col, row);

  if (mineCount === 0) {
    for (const delta of NEIGHBOR_DELTAS) {
      const neighborCol = col + delta.col;
      const neighborRow = row + delta.row;
      const neighborCell = getCell(state.grid, neighborCol, neighborRow);
      const neighborMineCount = getMineCount(state, neighborCol, neighborRow);
      if (neighborCell !== undefined && !neighborCell.isMine) {
        if (neighborMineCount === 0) {
          state = _checkCell(state, neighborCol, neighborRow);
        } else {
          neighborCell.isClicked = true;
        }
      }
    }
  }

  if (cell.isMine) {
    state.playState = "lose";
  } else {
    const allChecked = state.grid.flat().every((cell) => cell.isClicked || cell.isMine);
    if (allChecked) {
      state.playState = "win";
    }
  }

  return state;
};

export const checkCell = (db: DB, col: number, row: number) =>
  db.reset(_checkCell(db.deref(), col, row));

export const markCell = (db: DB, col: number, row: number) =>
  db.swapIn(["grid", row, col, "isFlagged"], (isFlagged) => !isFlagged);

// game creation
// -----------------------------------------------------------------------------
const createGrid = (numCols: number, numRows: number, chanceOfMine: number): Grid => {
  console.assert(numCols > 0);
  console.assert(numRows > 0);
  console.assert(chanceOfMine >= 0.0);
  console.assert(chanceOfMine <= 1.0);

  return [
    ...map((): Row => {
      return [
        ...map((): Cell => {
          return {
            isMine: Math.random() < chanceOfMine,
            isClicked: false,
            isFlagged: false,
          };
        }, range(numRows)),
      ];
    }, range(numCols)),
  ];
};

const createGame = (numCols: number, numRows: number, chanceOfMine: number): State => {
  return {
    grid: createGrid(numCols, numRows, chanceOfMine),
    playState: "playing",
  };
};

export const createDefaultGame = () =>
  createGame(DEFAULT_NUM_COLS, DEFAULT_NUM_ROWS, DEFAULT_CHANCE_OF_MINE);

export const newGame = (db: DB) => db.reset(createDefaultGame());
