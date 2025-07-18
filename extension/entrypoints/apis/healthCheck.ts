import { up } from "up-fetch";

import {
  APP_URL,
  OFFSET,
  RETRY_ATTEMPTS,
  RETRY_DELAY,
  RETRY_MAX_DELAY,
} from "@/src/constants";

const upfetch = up(fetch, () => ({
  baseUrl: APP_URL,
  credentials: "omit",
  headers: {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Sec-Fetch-Site": "none",
  },
  mode: "cors",
  retry: {
    attempts: RETRY_ATTEMPTS,
    delay: ({ attempt }) =>
      Math.min(Math.log2(attempt + OFFSET) * RETRY_DELAY, RETRY_MAX_DELAY),
    when: ({ response }) => !response || response.status === 500,
  },
}));

const online = () => upfetch("/up");

const healthCheck = { up: online };

export default healthCheck;
