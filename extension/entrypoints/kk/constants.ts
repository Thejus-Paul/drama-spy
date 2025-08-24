import { AiringStatusEnum, DramaShow } from "@/types";

export const SELECTORS = {
  footer: "app-footer",
  title: "mat-card-title",
  seeker: "mat-slider-progress-bar",
  description: ".mat-expansion-panel-body > p",
  episodeButtons: "mat-card-footer > div > button",
  currentEpisode:
    ".mat-card-footer > div > button.mat-raised-button.mat-accent",
  metadata: ".mat-list-item-content",
  poster: ".video",
} as const;

export const METADATA_KEYS = ["country", "airingStatus", "type"] as const;

export const INITIAL_DRAMA_DATA: Partial<DramaShow> = Object.seal({
  lastWatchedEpisode: 0,
  name: "",
  description: "",
  totalEpisodes: 0,
  country: "",
  airingStatus: AiringStatusEnum.upcoming,
  posterUrl: "",
});

export const ONE_MINUTE_DELAY = 60 * 1000;
