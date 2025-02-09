import { getDramaSlug } from "../kk/utils";
import { KK_DOMAIN, STATS_PANEL } from "./constants";
import Stats from "stats.js";

export const getDramaLink = (name: string, id: string) => {
  return `${KK_DOMAIN}/Drama/${getDramaSlug(name)}?id=${id}`;
};

export const getMetadataId = (metadata: unknown): string | null => {
  if (!metadata || typeof metadata !== "object" || !("id" in metadata)) {
    return null;
  }
  const id = (metadata as Record<string, unknown>).id;
  return typeof id === "string" ? id : null;
};

export const setupStatsMonitor = () => {
  const stats = new Stats();
  stats.showPanel(STATS_PANEL.FPS);
  document.body.appendChild(stats.dom);

  const animate = () => {
    stats.begin();
    stats.end();
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
  return stats;
};
