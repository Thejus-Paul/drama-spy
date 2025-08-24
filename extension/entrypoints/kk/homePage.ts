import { WatchStatusEnum } from "@/types";
import messaging from "../messaging";

const homePage = async () => {
  const dramas = await messaging.sendMessage("getDramas");

  document.querySelectorAll<HTMLElement>(".drama-title").forEach((element) => {
    element.style.overflow = "visible";

    const dramaName = element.textContent;
    const drama = dramas.find((drama) => drama.name === dramaName);

    if (drama) {
      const dramaCard = element.closest(".mat-card") as HTMLElement;
      if (!dramaCard) return;

      if (drama.watchStatus === WatchStatusEnum.watching) {
        dramaCard.style.backgroundColor = "darkorange";
      } else if (drama.watchStatus === WatchStatusEnum.finished) {
        dramaCard.style.backgroundColor = "mediumseagreen";
      }

      dramaCard.style.textShadow = "1px 1px 3px #444, 1px 1px 1px #222";
    }
  });
};

export default homePage;
