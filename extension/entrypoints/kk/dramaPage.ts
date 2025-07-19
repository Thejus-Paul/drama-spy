import { AiringStatusEnum, StatusEnum, WatchStatusEnum } from "../../types";
import {
  INITIAL_DRAMA_DATA,
  METADATA_KEYS,
  ONE_MINUTE_DELAY,
  SELECTORS,
} from "./constants";
import { getDramaSlug, getUpdatedValues, highlightEpisodes } from "./utils";
import messaging from "../messaging";

const dramaPage = async () => {
  document.querySelector(SELECTORS.footer)?.remove();
  const drama = INITIAL_DRAMA_DATA;

  // Setup interval check for episode completion
  setInterval(() => {
    const seeker = document.querySelector<HTMLElement>(SELECTORS.seeker);
    const value = parseFloat(seeker?.getAttribute("aria-valuetext") ?? "0");
    if (value >= 75) messaging.sendMessage("up");
  }, ONE_MINUTE_DELAY);

  const nameElement = document.querySelector<HTMLElement>(SELECTORS.title);
  drama.name = nameElement?.innerText ?? "";

  const browserSlug = window.location.pathname.replace("/Drama/", "");
  const dramaSlug = getDramaSlug(drama.name);
  if (browserSlug !== dramaSlug) {
    window.history.replaceState(
      {},
      "",
      window.location.href.replace(browserSlug, dramaSlug),
    );
    return;
  }

  drama.description =
    document.querySelector<HTMLParagraphElement>(SELECTORS.description)
      ?.textContent ?? "";
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

  const isTv = dramaType === "TVSeries";
  const watchedDrama = await messaging.sendMessage("getDrama", drama.name);
  if (watchedDrama.status === StatusEnum.error && isTv) {
    await messaging.sendMessage("createDrama", {
      ...drama,
      lastWatchedEpisode: currentEpisode,
    });
    return;
  }

  if (!("lastWatchedEpisode" in watchedDrama)) return;

  const lastWatched = watchedDrama.lastWatchedEpisode;
  const isUnwatched = currentEpisode > 0 && currentEpisode !== lastWatched;
  const isInProgress = watchedDrama.watchStatus !== WatchStatusEnum.finished;
  const isAiring = drama.airingStatus !== AiringStatusEnum.completed;

  if (isTv && isUnwatched && (isInProgress || isAiring)) {
    const updated = getUpdatedValues(watchedDrama, drama);
    await messaging.sendMessage("updateDrama", {
      ...updated,
      lastWatchedEpisode: currentEpisode,
    });
  }

  if (!currentEpisode) currentEpisode = lastWatched;
  if (currentEpisode > 0) highlightEpisodes(episodes, currentEpisode);
};

export default dramaPage;
