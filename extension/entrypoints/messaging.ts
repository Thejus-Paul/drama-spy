import { defineExtensionMessaging } from "@webext-core/messaging";
import { DramaIndex, DramaShow, Error, Success } from "@/types";

interface ProtocolMap {
  createDrama(drama: Partial<DramaShow>): Promise<Success | Error>;
  getDramas(): Promise<DramaIndex[]>;
  getDrama(name: string): Promise<DramaShow | Error>;
  updateDrama(body: Partial<DramaShow>): Promise<Success | Error>;
  up(): void;
}

const messaging = defineExtensionMessaging<ProtocolMap>();

export default messaging;
