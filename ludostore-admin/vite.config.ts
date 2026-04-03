import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import tailwindcss from "@tailwindcss/vite";

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/store/v1": {
        target: process.env.VITE_BACKEND_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/store\/v1(?=\/|$)/, ""),
      },
    },
  },
});
