// Total 2 attempts as initial attempt + 1 retry
export const RETRY_ATTEMPTS: number = 1;

// 1 second offset for Math.log2 otherwise it will trigger the first retry immediately
export const OFFSET: number = 1;

// 2 seconds delay between retries
export const RETRY_DELAY: number = 2_000;

// 10 seconds max delay between retries
export const RETRY_MAX_DELAY: number = 10_000;

export const ERROR_CODES = {
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
