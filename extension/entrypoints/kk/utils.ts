import { DramaShow } from "@/types";
import { flattenObject, isEqual } from "es-toolkit";

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

export { getDramaSlug, getUpdatedValues, highlightEpisodes, objectDiff };
