import { defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { createDefaultGame, getNumCols, getNumRows } from "./actions";
import { DB, State } from "./api";
import { mainCmp } from "./components/mainCmp";

const app = (db: DB) => {
  return () => {
    const state = db.deref();

    console.assert(getNumRows(state.grid) > 0 && getNumCols(state.grid) > 0);

    return mainCmp(db);
  };
};

start(app(defAtom<State>(createDefaultGame())), { root: document.body });
