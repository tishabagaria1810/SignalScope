import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// SQLite middleware removed — history is now stored in Supabase

export default defineConfig({
  plugins: [
    apiMiddleware(),
    tanstackStart(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
