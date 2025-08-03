import { AiringStatusEnum, StatusEnum, WatchStatusEnum } from "../../types";
import {
  INITIAL_DRAMA_DATA,
  METADATA_KEYS,
  ONE_MINUTE_DELAY,
  SELECTORS,
} from "./constants";
import {
  getDramaSlug,
  getUpdatedValues,
  highlightEpisodes,
  objectDiff,
} from "./utils";

import messaging from "../messaging";
import { isEqual } from "es-toolkit";

const dramaPage = async (retryCount: number = 0) => {
  const drama = INITIAL_DRAMA_DATA;

  const nameElement = document.querySelector<HTMLElement>(SELECTORS.title);
  drama.name = nameElement?.innerText ?? "";

  if (!drama.name.trim()) {
    if (retryCount < 10) setTimeout(() => dramaPage(retryCount + 1), 250);
    return;
  }

  if (retryCount === 0 || !document.querySelector(SELECTORS.footer)) {
    document.querySelector(SELECTORS.footer)?.remove();

    setInterval(() => {
      const seeker = document.querySelector<HTMLElement>(SELECTORS.seeker);
      const value = parseFloat(seeker?.getAttribute("aria-valuetext") ?? "0");
      if (value >= 75) messaging.sendMessage("up");
    }, ONE_MINUTE_DELAY);
  }

  const browserSlug = window.location.pathname.replace("/Drama/", "");
  const dramaSlug = getDramaSlug(drama.name);
  if (browserSlug !== dramaSlug) {
    const newUrl = window.location.href.replace(browserSlug, dramaSlug);
    window.history.replaceState({}, "", newUrl);
    return;
  }

  drama.description =
    document.querySelector<HTMLParagraphElement>(SELECTORS.description)
      ?.textContent ?? "";

  const posterElement = document.querySelector<HTMLVideoElement>(
    SELECTORS.poster,
  );
  drama.posterUrl = posterElement?.poster;

  const episodes = document.querySelectorAll<HTMLButtonElement>(
    SELECTORS.episodeButtons,
  );
  drama.totalEpisodes = episodes.length;
  if (drama.totalEpisodes === 0) return;

  const currentEpisodeText = document.querySelector<HTMLButtonElement>(
    SELECTORS.currentEpisode,
  )?.innerText;
  let currentEpisode = parseInt(currentEpisodeText ?? "0", 10);

  const metadata = document.querySelectorAll<HTMLSpanElement>(
    SELECTORS.metadata,
  );
  let dramaType = "";
  metadata.forEach((element, index) => {
    const key = METADATA_KEYS[index];
    const value = element.innerText;
    if (key === "airingStatus")
      drama[key] = value.toLowerCase() as AiringStatusEnum;
    else if (key === "type") dramaType = value;
    else drama[key] = value;
  });

  const isTvSeries = dramaType === "TVSeries";

  // Extract query parameters and prepare metadata
  const urlParams = new URLSearchParams(window.location.search);
  const queryId = urlParams.get("id");
  const dramaMetadata = { ...(queryId && { id: queryId }) };

  const watchedDrama = await messaging.sendMessage("getDrama", drama.name);
  if (watchedDrama.status === StatusEnum.error && isTvSeries) {
    const newDrama = {
      ...drama,
      lastWatchedEpisode: currentEpisode,
      metadata: dramaMetadata,
    };
    await messaging.sendMessage("createDrama", newDrama);
    return;
  }

  if (!("lastWatchedEpisode" in watchedDrama)) return;
  const updatedValues = {
    ...watchedDrama,
    ...drama,
    lastWatchedEpisode: watchedDrama.lastWatchedEpisode,
    posterUrl: drama.posterUrl,
    metadata: dramaMetadata,
  };
  const payload = { ...objectDiff(watchedDrama, updatedValues), id: watchedDrama.id, name: drama.name };
  console.log(payload);

  if (!isEqual(updatedValues, watchedDrama))
    await messaging.sendMessage("updateDrama", payload);

  const lastWatched = watchedDrama.lastWatchedEpisode;
  const isUnwatched = currentEpisode > 0 && currentEpisode !== lastWatched;
  const isInProgress = watchedDrama.watchStatus !== WatchStatusEnum.finished;
  const isAiring = drama.airingStatus !== AiringStatusEnum.completed;

  if (isTvSeries && isUnwatched && (isInProgress || isAiring)) {
    const changes = getUpdatedValues(watchedDrama, drama);
    const updatedValues = {
      ...changes,
      lastWatchedEpisode: currentEpisode,
      metadata: dramaMetadata,
    };
    await messaging.sendMessage("updateDrama", updatedValues);
  }

  if (!currentEpisode) currentEpisode = lastWatched;
  if (currentEpisode > 0) highlightEpisodes(episodes, currentEpisode);
};

export default dramaPage;
