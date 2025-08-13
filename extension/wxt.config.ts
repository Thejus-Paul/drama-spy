import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ["storage", "activeTab"],
    options_ui: { page: "options/index.html" },
  },
  modules: ["@wxt-dev/module-solid"],
});
