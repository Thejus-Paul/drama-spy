import { up } from "up-fetch";

import {
  ERROR_CODES,
  OFFSET,
  RETRY_DELAY,
  RETRY_MAX_DELAY,
} from "@/src/constants";
import { getBackendUrl } from "@/src/utils";

const online = async () => {
  const backendUrl = await getBackendUrl();
  const upfetch = up(fetch, () => ({
    baseUrl: backendUrl,
    credentials: "omit",
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Sec-Fetch-Site": "none",
    },
    mode: "cors",
    retry: {
      attempts: Infinity,
      delay: ({ attempt }) =>
        Math.min(Math.log2(attempt + OFFSET) * RETRY_DELAY, RETRY_MAX_DELAY),
      when: ({ response }) =>
        !response || response.status === ERROR_CODES.INTERNAL_SERVER_ERROR,
    },
  }));
  return upfetch("/up");
};

const healthCheck = { up: online };
export default healthCheck;
