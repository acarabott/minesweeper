import { div } from "@thi.ng/hiccup-html";
import { DB } from "../api";

export const winLoseCmp = (db: DB) => {
  const state = db.deref();

  return state.playState === "playing"
    ? null
    : div(
        {
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            background:
              state.playState === "win" ? "rgb(43, 212, 156, 0.5)" : "rgba(43, 156, 212, 0.5)",
            "font-size": "10vh",
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
          },
        },
        state.playState === "win"
          ? "Winner, Winner, Chicken Dinner!"
          : "It's Game Over man, it's just Game Over",
      );
};
