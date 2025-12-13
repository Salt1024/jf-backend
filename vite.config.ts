import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@/": `${resolve(__dirname, "src")}/`,
    },
  },

  server: {
    host: "0.0.0.0",
    open: false,
    port: 5173,
    proxy: {
      "^/api/v1/": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1024,
  },
});
