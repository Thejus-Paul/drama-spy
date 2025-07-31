import {
  API_V1_URL,
  ERROR_CODES,
  OFFSET,
  RETRY_ATTEMPTS,
  RETRY_DELAY,
  RETRY_MAX_DELAY,
} from "@/src/constants";
import { DramaIndexSchema } from "./schemas/DramaIndexSchema";
import { DramaShowSchema } from "./schemas/DramaShowSchema";
import { ErrorSchema } from "./schemas/ErrorSchema";
import { SuccessSchema } from "./schemas/SuccessSchema";
import { toCamelCaseKeys, toSnakeCaseKeys } from "es-toolkit";
import { up } from "up-fetch";
import { array, variant } from "valibot";
import type { DramaShow } from "@/types";

const upfetch = up(fetch, () => ({
  baseUrl: API_V1_URL,
  headers: {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Sec-Fetch-Site": "none",
  },
  parseResponse: async (response: Response) => {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return toCamelCaseKeys(data);
    }
    return response;
  },
  retry: {
    attempts: RETRY_ATTEMPTS,
    delay: ({ attempt }) =>
      Math.min(Math.log2(attempt + OFFSET) * RETRY_DELAY, RETRY_MAX_DELAY),
    when: ({ response }) =>
      !response || response.status === ERROR_CODES.NOT_FOUND,
  },
  serializeBody: (body: Record<string, unknown>) => {
    if (body && typeof body === "object") {
      return JSON.stringify(toSnakeCaseKeys(body));
    }
    return body;
  },
}));

const index = () => upfetch("/dramas", { schema: array(DramaIndexSchema) });

const show = (name: string) =>
  upfetch(`/dramas/${name}`, {
    schema: variant("status", [DramaShowSchema, ErrorSchema]),
  });

const create = (drama: Partial<DramaShow>) =>
  upfetch("/dramas", {
    body: { drama },
    method: "POST",
    schema: variant("status", [SuccessSchema, ErrorSchema]),
  });

const update = (id: number, drama: Partial<DramaShow>) =>
  upfetch(`/dramas/${id}`, {
    body: { drama },
    method: "PATCH",
    schema: variant("status", [SuccessSchema, ErrorSchema]),
  });

const Dramas = { create, index, show, update };

export default Dramas;
