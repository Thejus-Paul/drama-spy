// This file is auto-generated from Valibot schemas. Do not edit manually.
import { InferOutput } from "valibot";
import { DramaIndexSchema } from "../entrypoints/apis/dramas/schemas/DramaIndexSchema";
import { DramaShowSchema } from "../entrypoints/apis/dramas/schemas/DramaShowSchema";
import { ErrorSchema } from "../entrypoints/apis/dramas/schemas/ErrorSchema";
import { SuccessSchema } from "../entrypoints/apis/dramas/schemas/SuccessSchema";
export { WatchStatusEnum } from "./WatchStatusEnum";
export { StatusEnum } from "./StatusEnum";
export { AiringStatusEnum } from "./AiringStatusEnum";

export type DramaIndex = InferOutput<typeof DramaIndexSchema>;
export type DramaShow = InferOutput<typeof DramaShowSchema>;
export type Error = InferOutput<typeof ErrorSchema>;
export type Success = InferOutput<typeof SuccessSchema>;
