import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import path from "path"
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // existing proxy
      "/odata": {
        target: "http://localhost:4004",
        changeOrigin: true,
        secure: false,
      },

      // proxy backend endpoints used by PurchaseRequisitionManagement.tsx
      "/PurchaseRequisition": {
        target: "http://localhost:4004",
        changeOrigin: true,
        secure: false,
      },
      "/createPurchaseRequisition": {
        target: "http://localhost:4004",
        changeOrigin: true,
        secure: false,
      },
      "/releasePurchaseRequisition": {
        target: "http://localhost:4004",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
