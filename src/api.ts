import { Atom } from "@thi.ng/atom/atom";

export const DEFAULT_NUM_COLS = 9;
export const DEFAULT_NUM_ROWS = 9;
export const DEFAULT_DIFFICULTY_01 = 0.15;
export const MIN_MINE_CHANCE = 0.1;
export const MAX_MINE_CHANCE = 0.5;

export interface Cell {
  isMine: boolean;
  state: "hidden" | "revealed" | "flagged";
}

export type Row = Cell[];

export type Grid = Row[];

export type PlayState = "playing" | "win" | "lose";

export interface State {
  grid: Grid;
  playState: PlayState;
  difficulty_01: number;
}

export type DB = Atom<State>;
