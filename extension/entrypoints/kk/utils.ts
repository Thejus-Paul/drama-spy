import { DramaShow } from "@/types";

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

export { getDramaSlug, getUpdatedValues, highlightEpisodes };
