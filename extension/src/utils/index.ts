import { storage } from "#imports";

export const backendUrl = storage.defineItem<string>("local:backend_url", {
  fallback: "http://localhost:3000",
});

export const getBackendUrl = async (): Promise<string> => {
  return await backendUrl.getValue();
};

export const getApiUrl = async (): Promise<string> => {
  const backendUrlValue = await getBackendUrl();
  return `${backendUrlValue}/api/v1`;
};

export const decryptHexXor = (h: string): string => {
  let out = "";
  const k = "kK-2025";
  for (let i = 0; i < h.length; i += 2) {
    const byte = parseInt(h.slice(i, i + 2), 16);
    const c = byte ^ k.charCodeAt((i / 2) % k.length);
    out += String.fromCharCode(c);
  }
  return out;
};
