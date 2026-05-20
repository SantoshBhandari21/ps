import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // fail if port 3000 is unavailable
    open: true, // automatically open browser
    host: true, // allow external connections
    allowedHosts: ["fyp.santoshbhandari.info.np"],
  },
  resolve: {
    alias: {
      "@": "/src", // allows using @/components/... instead of ../../components/...
    },
  },
});
