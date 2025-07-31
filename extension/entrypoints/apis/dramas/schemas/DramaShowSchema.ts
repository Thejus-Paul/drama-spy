import * as v from "valibot";
import { AiringStatusEnum, StatusEnum, WatchStatusEnum } from "../../../../types";

export const DramaShowSchema = v.object({
  status: v.enum_(StatusEnum),
  airingStatus: v.enum_(AiringStatusEnum),
  country: v.string(),
  description: v.nullable(v.string()),
  id: v.number(),
  lastWatchedEpisode: v.number(),
  name: v.string(),
  totalEpisodes: v.number(),
  watchStatus: v.enum_(WatchStatusEnum),
  metadata: v.nullable(v.record(v.string(), v.unknown())),
  posterUrl: v.nullable(v.string()),
});

export type DramaShowInput = v.InferInput<typeof DramaShowSchema>;
export type DramaShowOutput = v.InferOutput<typeof DramaShowSchema>;
