import { Atom } from "@thi.ng/atom/atom";

export const DEFAULT_NUM_COLS = 9;
export const DEFAULT_NUM_ROWS = 9;
export const DEFAULT_CHANCE_OF_MINE = 0.25;

export interface Cell {
  isMine: boolean;
  isClicked: boolean;
  isFlagged: boolean;
}

export type Row = Cell[];

export type Grid = Row[];

export type PlayState = "playing" | "win" | "lose";

export interface State {
  grid: Grid;
  playState: PlayState;
}

export type DB = Atom<State>;
