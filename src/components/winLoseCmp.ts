import { div } from "@thi.ng/hiccup-html";
import { DB } from "../api";

export const winLoseCmp = (db: DB) => {
  const state = db.deref();

  if (state.playState === "playing") {
    return null;
  }

  const { background, message } = (() => {
    if (state.playState === "win") {
      return {
        background: "rgb(43, 212, 156, 0.5)",
        message: "Winner, Winner, Chicken Dinner!",
      };
    } else if (state.playState === "lose") {
      return {
        background: "rgba(43, 156, 212, 0.5)",
        message: "It's game over man, it's just game over",
      };
    } else {
      throw new TypeError("invalid play state");
    }
  })();

  return div(
    {
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        background,
        "font-size": "10vh",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      },
    },
    message,
  );
};
