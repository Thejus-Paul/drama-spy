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
