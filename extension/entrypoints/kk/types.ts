import { DramaShow } from "@/types";

// Parameter object types for functions with multiple parameters
export type HandleEpisodeProgressParams = {
  watchedDrama: DramaShow;
  drama: Partial<DramaShow>;
  currentEpisode: number;
  dramaMetadata: DramaMetadata;
  isTvSeries: boolean;
};

export type HandleNewDramaParams = {
  drama: Partial<DramaShow>;
  currentEpisode: number;
  dramaMetadata: DramaMetadata;
};

export type HandleDramaUpdateParams = {
  watchedDrama: DramaShow;
  drama: Partial<DramaShow>;
  dramaMetadata: DramaMetadata;
};

export type DramaMetadata = Record<string, string | number | null>;

export type ExtractedDramaInfo = {
  drama: Partial<DramaShow>;
  episodes: NodeListOf<HTMLButtonElement>;
  dramaType: string;
};
