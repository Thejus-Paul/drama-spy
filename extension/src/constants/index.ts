export const APP_URL: string = "https://drama-spy.neetodeployapp.com";

export const API_V1_URL: string = `${APP_URL}/api/v1`;

// Total 5 attempts as initial attempt + 4 retries
export const RETRY_ATTEMPTS: number = 4;

// 1 second offset for Math.log2 otherwise it will trigger the first retry immediately
export const OFFSET: number = 1;

// 2 seconds delay between retries
export const RETRY_DELAY: number = 2_000;

// 10 seconds max delay between retries
export const RETRY_MAX_DELAY: number = 10_000;
