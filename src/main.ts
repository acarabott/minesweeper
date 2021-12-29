import { defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { createDefaultGame, getNumCols, getNumRows } from "./actions";
import { State } from "./api";
import { mainCmp } from "./components/mainCmp";

const app = () => {
  const db = defAtom<State>(createDefaultGame());

  console.assert(getNumRows(db.deref().grid) > 0 && getNumCols(db.deref().grid) > 0);

  return () => {
    return mainCmp(db);
  };
};

start(app(), { root: document.body });
