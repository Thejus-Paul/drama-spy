import KK from "./kk";

export default defineContentScript({
  matches: [atob("aHR0cHM6Ly8qLmtpc3NraC5vdmgvKg==")],
  main(ctx) {
    KK.router(new URL(window.location.href));

    ctx.addEventListener(window, "wxt:locationchange", ({ newUrl }) => {
      KK.router(newUrl);
    });
  },
});
