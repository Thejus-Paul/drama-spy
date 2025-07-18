import KK from "./kk";
import messaging from "./messaging";

export default defineContentScript({
  matches: [atob("aHR0cHM6Ly8qLmtpc3NraC5vdmgvKg==")],
  main(ctx) {
    messaging.sendMessage("up");

    ctx.addEventListener(window, "wxt:locationchange", ({ newUrl }) => {
      KK.router(newUrl);
    });
  },
});
