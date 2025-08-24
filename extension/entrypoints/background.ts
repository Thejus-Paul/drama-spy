import {
  Error as GenericError,
  DramaIndex,
  DramaShow,
  Success,
} from "../types";
import Dramas from "./apis/dramas";
import { StatusEnum } from "../types/StatusEnum";
import healthCheck from "./apis/healthCheck";
import messaging from "./messaging";

export default defineBackground(() => {
  messaging.onMessage("up", async () => {
    await healthCheck.up();
  });

  messaging.onMessage("getDramas", async (): Promise<DramaIndex[]> => {
    const dramas = await Dramas.index();

    return Array.isArray(dramas) ? dramas : [];
  });

  messaging.onMessage(
    "getDrama",
    async ({ data: name }): Promise<DramaShow | GenericError> => {
      if (!name.trim())
        return {
          message: "Drama name cannot be empty.",
          status: StatusEnum.error,
        } satisfies GenericError;

      try {
        return await Dramas.show(name);
      } catch (error) {
        return {
          message: error instanceof Error ? error.message : "Unknown error",
          status: StatusEnum.error,
        } satisfies GenericError;
      }
    },
  );

  messaging.onMessage(
    "createDrama",
    async ({ data: drama }): Promise<Success | GenericError> => {
      return await Dramas.create(drama);
    },
  );

  messaging.onMessage(
    "updateDrama",
    async ({ data: drama }): Promise<Success | GenericError> => {
      if (!drama.id)
        return {
          message: "Drama ID is required.",
          status: StatusEnum.error,
        } satisfies GenericError;

      return await Dramas.update(drama.id, drama);
    },
  );
});
