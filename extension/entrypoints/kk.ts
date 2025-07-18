import {
  AiringStatusEnum,
  StatusEnum,
  WatchStatusEnum,
  DramaShow,
} from "../types";
import messaging from "./messaging";

const SELECTORS = {
  footer: "app-footer",
  title: "mat-card-title",
  seeker: "mat-slider-progress-bar",
  description: ".mat-expansion-panel-body > p",
  episodeButtons: "mat-card-footer > div > button",
  currentEpisode:
    ".mat-card-footer > div > button.mat-raised-button.mat-accent",
  metadata: ".mat-list-item-content",
};

const METADATA_KEYS = ["country", "airingStatus", "type"] as const;

const getDramaSlug = (name: string) => name.replace(/[\s&()‘',.+:]/g, "-");

const getUpdatedValues = (
  watchedDrama: DramaShow,
  drama: Partial<DramaShow>,
): Partial<DramaShow> => {
  const updatedDrama: Record<string, string | number> = {};
  for (const key of Object.keys(watchedDrama)) {
    if (["status", "watchStatus"].includes(key)) continue;
    if (
      drama[key as keyof typeof drama] !==
      watchedDrama[key as keyof typeof watchedDrama]
    ) {
      updatedDrama[key] = drama[key as keyof typeof drama] ?? "";
    }
  }
  updatedDrama.id = watchedDrama.id;
  updatedDrama.name = drama.name ?? watchedDrama.name;
  return updatedDrama;
};

const highlightEpisodes = (
  episodes: NodeListOf<HTMLElement>,
  currentEpisode: number,
) => {
  episodes.forEach((episodeElement) => {
    const episodeNum = parseInt(episodeElement.innerText, 10);
    if (episodeNum <= currentEpisode) {
      episodeElement.style.backgroundColor = "lightgreen";
      episodeElement.style.color = "black";
    } else {
      episodeElement.classList.add("mat-warn");
    }
  });
};

const setDrama = async () => {
  document.querySelector(SELECTORS.footer)?.remove();

  const drama: Partial<DramaShow> = Object.seal({
    lastWatchedEpisode: 0,
    name: "",
    description: "",
    totalEpisodes: 0,
    country: "",
    airingStatus: AiringStatusEnum.upcoming,
  });

  // Setup interval check for episode completion
  setInterval(
    () => {
      const seeker = document.querySelector<HTMLElement>(SELECTORS.seeker);
      const value = parseFloat(seeker?.getAttribute("aria-valuetext") ?? "0");
      if (value >= 75) messaging.sendMessage("up");
    },
    5 * 60 * 1_000,
  );

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

const DRAMA_PAGE = new MatchPattern(
  atob("aHR0cHM6Ly8qLmtpc3NraC5vdmgvRHJhbWEvKg=="),
);
const router = (url: URL | string) => {
  if (DRAMA_PAGE.includes(url)) setDrama();
};

export default { router, setDrama };
