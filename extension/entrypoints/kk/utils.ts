import { DramaShow } from "@/types";

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

export { getDramaSlug, getUpdatedValues, highlightEpisodes };
