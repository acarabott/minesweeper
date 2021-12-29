import { defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { createDefaultGame } from "./actions";
import { State } from "./api";
import { mainCmp } from "./components/mainCmp";

const app = () => {
  const db = defAtom<State>(createDefaultGame());

  return () => {
    return mainCmp(db);
  };
};

start(app(), { root: document.body });
