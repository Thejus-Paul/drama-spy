import { getDramaSlug } from "../kk/utils";
import { KK_DOMAIN } from "./constants";

export const getDramaLink = (name: string, id: string) => {
  return `${KK_DOMAIN}/Drama/${getDramaSlug(name)}?id=${id}`;
};

export const isString = (value: unknown): value is string =>
  typeof value === "string";
