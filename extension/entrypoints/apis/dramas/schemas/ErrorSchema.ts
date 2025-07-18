import * as v from "valibot";
import { StatusEnum } from "../../../../types";

export const ErrorSchema = v.object({
  status: v.enum_(StatusEnum),
  message: v.string(),
});

export type ErrorInput = v.InferInput<typeof ErrorSchema>;
export type ErrorOutput = v.InferOutput<typeof ErrorSchema>;
