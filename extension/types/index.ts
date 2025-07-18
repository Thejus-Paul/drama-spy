// This file is auto-generated from Valibot schemas. Do not edit manually.
import { InferOutput } from "valibot";
import { DramaShowSchema } from "../entrypoints/apis/dramas/schemas/DramaShowSchema";
import { DramaIndexSchema } from "../entrypoints/apis/dramas/schemas/DramaIndexSchema";
import { ErrorSchema } from "../entrypoints/apis/dramas/schemas/ErrorSchema";
import { SuccessSchema } from "../entrypoints/apis/dramas/schemas/SuccessSchema";
export { StatusEnum } from "./StatusEnum";
export { AiringStatusEnum } from "./AiringStatusEnum";
export { WatchStatusEnum } from "./WatchStatusEnum";

export type DramaShow = InferOutput<typeof DramaShowSchema>;
export type DramaIndex = InferOutput<typeof DramaIndexSchema>;
export type Error = InferOutput<typeof ErrorSchema>;
export type Success = InferOutput<typeof SuccessSchema>;
