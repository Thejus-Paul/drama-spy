import * as v from "valibot";
import { StatusEnum } from "../../../../types";

export const SuccessSchema = v.object({
  status: v.enum_(StatusEnum),
  message: v.string(),
});

export type SuccessInput = v.InferInput<typeof SuccessSchema>;
export type SuccessOutput = v.InferOutput<typeof SuccessSchema>;
