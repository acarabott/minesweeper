import { fit01, inRange } from "@thi.ng/math";
import { range } from "@thi.ng/transducers";
import { map } from "@thi.ng/transducers/map";
import { Cell, DB, Grid, MAX_MINE_CHANCE, MIN_MINE_CHANCE, Row, State } from "./api";

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

const isValidPosition = (grid: Grid, col: number, row: number): boolean =>
  row >= 0 && row < getNumRows(grid) && col >= 0 && col < getNumCols(grid);

export const getCell = (grid: Grid, col: number, row: number): Cell => {
  if (isValidPosition(grid, col, row)) {
    return grid[row][col];
  }

  throw new RangeError(`Bad cell co-ordinates: ${col}, ${row}`);
};

export const getMineCount = (state: State, col: number, row: number): number => {
  const count = NEIGHBOR_DELTAS.reduce((accum, { col: colDelta, row: rowDelta }) => {
    const neighborCol = col + colDelta;
    const neighborRow = row + rowDelta;

    if (!isValidPosition(state.grid, neighborCol, neighborRow)) {
      return accum;
    }

    return getCell(state.grid, neighborCol, neighborRow).isMine ? accum + 1 : accum;
  }, 0);

  return count;
};

// user actions
// -----------------------------------------------------------------------------

// this is where all the action lives
// warning is recursive and does mutation!
const _checkCell = (state: State, col: number, row: number): State => {
  // if the cell is already clicked, return early. Important because this is recursive
  const cell = getCell(state.grid, col, row);
  if (cell.state === "revealed") {
    return state;
  }

  // update this cell state
  cell.state = "revealed";

  // if we hit an empty cell (touching no mines), recursively check all of its neighbors
  if (getMineCount(state, col, row) === 0) {
    for (const delta of NEIGHBOR_DELTAS) {
      const neighborCol = col + delta.col;
      const neighborRow = row + delta.row;
      if (isValidPosition(state.grid, neighborCol, neighborRow)) {
        const neighborCell = getCell(state.grid, neighborCol, neighborRow);
        if (!neighborCell.isMine && neighborCell.state !== "revealed") {
          // recursion is here
          state = _checkCell(state, neighborCol, neighborRow);
        }
      }
    }
  }

  // check end game state, did we lose/win?
  if (cell.isMine) {
    state.playState = "lose";
  } else {
    const allChecked = state.grid.flat().every((cell) => cell.state === "revealed" || cell.isMine);
    if (allChecked) {
      state.playState = "win";
    }
  }

  return state;
};

export const checkCell = (db: DB, col: number, row: number) =>
  db.reset(_checkCell(db.deref(), col, row));

export const flagCell = (db: DB, col: number, row: number) =>
  db.swapIn(
    ["grid", row, col, "state"],
    (state) => (({ revealed: "revealed", flagged: "hidden", hidden: "flagged" } as const)[state]),
  );

// game creation
// -----------------------------------------------------------------------------
const createGrid = (numCols: number, numRows: number, difficulty_01: number): Grid => {
  console.assert(numCols > 0);
  console.assert(numRows > 0);
  console.assert(inRange(difficulty_01, 0.0, 1.0));

  const chance = fit01(difficulty_01, MIN_MINE_CHANCE, MAX_MINE_CHANCE);

  return [
    ...map((col): Row => {
      return [
        ...map((row): Cell => {
          const isCorner = (col === 0 || col === numCols - 1) && (row === 0 || row === numRows - 1);
          return {
            isMine: Math.random() < chance * (isCorner ? 0.5 : 1.0),
            state: "hidden",
          };
        }, range(numRows)),
      ];
    }, range(numCols)),
  ];
};

export const createGame = (numCols: number, numRows: number, difficulty_01: number): State => {
  return {
    grid: createGrid(numCols, numRows, difficulty_01),
    playState: "playing",
    difficulty_01,
  };
};

export const newGame = (db: DB, numCols: number, numRows: number, difficulty_01: number) =>
  db.reset(createGame(numCols, numRows, difficulty_01));
