import { decryptHexXor } from "@/src/utils";

export const KK_DOMAIN = decryptHexXor("033f594243081a4420444143595d45245b5a");

export const STATS_PANEL = {
  FPS: 0,
  MS: 1,
  MB: 2,
} as const;
