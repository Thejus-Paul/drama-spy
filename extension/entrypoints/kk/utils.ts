import { AiringStatusEnum, DramaShow, WatchStatusEnum } from "@/types";
import { flattenObject, isEqual } from "es-toolkit";
import { INITIAL_DRAMA_DATA, METADATA_KEYS, SELECTORS } from "./constants";
import messaging from "../messaging";
import type {
  HandleEpisodeProgressParams,
  HandleNewDramaParams,
  HandleDramaUpdateParams,
  ExtractedDramaInfo,
} from "./types";

const getDramaSlug = (name: string) => name.replace(/[\s&()‘',.+:]/g, "-");

const getUpdatedValues = (
  watchedDrama: DramaShow,
  drama: Partial<DramaShow>,
): Partial<DramaShow> => {
  const updatedDrama: Partial<DramaShow> = {};
  for (const key of Object.keys(watchedDrama) as Array<keyof DramaShow>) {
    if (["status", "watchStatus"].includes(key as string)) continue;
    if (drama[key] !== watchedDrama[key]) {
      (updatedDrama as Record<keyof DramaShow, unknown>)[key] =
        drama[key] ?? "";
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
      episodeElement.style.backgroundColor = "springgreen";
      episodeElement.style.color = "black";
    } else {
      episodeElement.classList.add("mat-warn");
    }
  });
};

const unflattenObject = (
  obj: Record<string, unknown>,
  delimiter: string = ".",
) => {
  const result: Record<string, unknown> = {};

  Object.keys(obj).forEach((flatKey) => {
    const keys = flatKey.split(delimiter);
    let current = result;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = obj[flatKey];
      } else {
        current[key] = current[key] || {};
        current = current[key] as Record<string, unknown>;
      }
    });
  });

  return result;
};

const objectDiff = (
  source: Record<string, unknown>,
  target: Record<string, unknown>,
): Record<string, unknown> => {
  const flatSource = flattenObject(source);
  const flatTarget = flattenObject(target);
  const diff: Record<string, unknown> = {};

  const allKeys = new Set([
    ...Object.keys(flatSource),
    ...Object.keys(flatTarget),
  ]);

  for (const key of allKeys) {
    const sourceValue = flatSource[key];
    const targetValue = flatTarget[key];

    if (!isEqual(sourceValue, targetValue)) {
      if (targetValue !== undefined) {
        diff[key] = targetValue;
      }
    }
  }

  return unflattenObject(diff);
};

const extractDramaInfo = (): ExtractedDramaInfo | null => {
  const drama = INITIAL_DRAMA_DATA;

  const nameElement = document.querySelector<HTMLElement>(SELECTORS.title);
  drama.name = nameElement?.innerText ?? "";

  if (!drama.name.trim()) return null;

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

  return { drama, episodes, dramaType };
};

const normalizeUrlSlug = (dramaName: string) => {
  const browserSlug = window.location.pathname.replace("/Drama/", "");
  const dramaSlug = getDramaSlug(dramaName);
  if (browserSlug !== dramaSlug) {
    const newUrl = window.location.href.replace(browserSlug, dramaSlug);
    window.history.replaceState({}, "", newUrl);
    return false;
  }
  return true;
};

const handleNewDrama = async (params: HandleNewDramaParams) => {
  const { drama, currentEpisode, dramaMetadata } = params;
  const newDrama = {
    ...drama,
    lastWatchedEpisode: currentEpisode,
    metadata: dramaMetadata,
  };
  await messaging.sendMessage("createDrama", newDrama);
};

// Handles drama updates for existing dramas
const handleDramaUpdate = async (params: HandleDramaUpdateParams) => {
  const { watchedDrama, drama, dramaMetadata } = params;
  const updatedValues = {
    ...watchedDrama,
    ...drama,
    lastWatchedEpisode: watchedDrama.lastWatchedEpisode,
    posterUrl: drama.posterUrl,
    metadata: dramaMetadata,
  };
  const payload = {
    ...objectDiff(watchedDrama, updatedValues),
    id: watchedDrama.id,
    name: drama.name,
  };

  if (!isEqual(updatedValues, watchedDrama)) {
    await messaging.sendMessage("updateDrama", payload);
  }
};

// Handles episode progress updates
const handleEpisodeProgress = async (params: HandleEpisodeProgressParams) => {
  const { watchedDrama, drama, currentEpisode, dramaMetadata, isTvSeries } =
    params;
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
};

export {
  extractDramaInfo,
  getDramaSlug,
  getUpdatedValues,
  highlightEpisodes,
  normalizeUrlSlug,
  objectDiff,
  handleNewDrama,
  handleDramaUpdate,
  handleEpisodeProgress,
};
