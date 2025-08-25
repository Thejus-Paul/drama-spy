import KK from "./kk";
import { decryptHexXor } from "@/src/utils";

export default defineContentScript({
  matches: [decryptHexXor("033f594243081a446103595941460023035d465a1a41")],
  main(ctx) {
    KK.router(new URL(window.location.href));

    ctx.addEventListener(window, "wxt:locationchange", ({ newUrl }) => {
      KK.router(newUrl);
    });
  },
});
