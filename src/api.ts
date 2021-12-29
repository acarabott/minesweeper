import { Atom } from "@thi.ng/atom/atom";

export interface Square {
  isMine: boolean;
  isClicked: boolean;
  isFlagged: boolean;
}

export type Grid = Square[][];


export type PlayState = "playing" | "win" | "lose";

export interface State {
  grid: Grid;
  playState: PlayState;
}

export type DB = Atom<State>;
