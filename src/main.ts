import { defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { createGame } from "./actions";
import { DEFAULT_DIFFICULTY_01, DEFAULT_NUM_COLS, DEFAULT_NUM_ROWS, State } from "./api";
import { defMainCmp } from "./components/mainCmp";

const app = () => {
  const db = defAtom<State>(createGame(DEFAULT_NUM_COLS, DEFAULT_NUM_ROWS, DEFAULT_DIFFICULTY_01));

  const mainCmp = defMainCmp(db);
  return () => {
    return mainCmp();
  };
};

start(app(), { root: document.body });
