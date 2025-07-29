import * as v from "valibot";
import { WatchStatusEnum } from "../../../../types";

export const DramaIndexSchema = v.object({
  id: v.number(),
  lastWatchedEpisode: v.number(),
  name: v.string(),
  watchStatus: v.enum_(WatchStatusEnum),
  metadata: v.record(v.string(), v.unknown()),
});

export type DramaIndexInput = v.InferInput<typeof DramaIndexSchema>;
export type DramaIndexOutput = v.InferOutput<typeof DramaIndexSchema>;
