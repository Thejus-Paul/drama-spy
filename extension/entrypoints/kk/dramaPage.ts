import { StatusEnum } from "../../types";
import { SELECTORS } from "./constants";
import {
  extractDramaInfo,
  normalizeUrlSlug,
  highlightEpisodes,
  setupProgressMonitor,
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

  if (retryCount === 0 || !document.querySelector(SELECTORS.footer)) {
    setupProgressMonitor();
  }

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
  await handleEpisodeProgress({
    watchedDrama,
    drama,
    currentEpisode,
    dramaMetadata,
    isTvSeries,
  });

  if (!currentEpisode) currentEpisode = watchedDrama.lastWatchedEpisode;
  if (currentEpisode > 0) highlightEpisodes(episodes, currentEpisode);
};

export default dramaPage;
