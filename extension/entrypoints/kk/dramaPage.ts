import { StatusEnum } from "../../types";
import { ONE_MINUTE_DELAY, SELECTORS } from "./constants";
import {
  extractDramaInfo,
  normalizeUrlSlug,
  highlightEpisodes,
  handleNewDrama,
  handleDramaUpdate,
  handleEpisodeProgress,
} from "./utils";
import messaging from "../messaging";

const dramaPage = async (retryCount: number = 0) => {
  const dramaInfo = extractDramaInfo();
  if (!dramaInfo) {
    if (retryCount < 10) setTimeout(() => dramaPage(retryCount + 1), 250);
    return;
  }

  const { drama, episodes, dramaType } = dramaInfo;

  if (!drama.name || !normalizeUrlSlug(drama.name)) return;

  if (drama.totalEpisodes === 0) return;

  const currentEpisodeText = document.querySelector<HTMLButtonElement>(
    SELECTORS.currentEpisode,
  )?.innerText;
  let currentEpisode = parseInt(currentEpisodeText ?? "0", 10);

  const isTvSeries = dramaType === "TVSeries";
  const urlParams = new URLSearchParams(window.location.search);
  const queryId = urlParams.get("id");
  const dramaMetadata = { ...(queryId && { id: queryId }) };

  if (!drama.name) return;

  const watchedDrama = await messaging.sendMessage("getDrama", drama.name);
  if (watchedDrama.status === StatusEnum.error && isTvSeries) {
    await handleNewDrama({ drama, currentEpisode, dramaMetadata });
    return;
  }

  if (!("lastWatchedEpisode" in watchedDrama)) return;

  await handleDramaUpdate({ watchedDrama, drama, dramaMetadata });

  let isEpisodeUpdateAllowed = true;
  setInterval(async () => {
    const seeker = document.querySelector<HTMLElement>(SELECTORS.seeker);
    const value = parseFloat(seeker?.getAttribute("aria-valuetext") ?? "0");
    if (isEpisodeUpdateAllowed && value >= 75) {
      await handleEpisodeProgress({
        watchedDrama,
        drama,
        currentEpisode,
        dramaMetadata,
        isTvSeries,
      });
      isEpisodeUpdateAllowed = false;
    }
  }, ONE_MINUTE_DELAY);

  if (!currentEpisode) currentEpisode = watchedDrama.lastWatchedEpisode;
  if (currentEpisode > 0) highlightEpisodes(episodes, currentEpisode);
};

export default dramaPage;
