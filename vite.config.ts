import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

const config = defineConfig({
  plugins: [devtools(), tailwindcss(), netlify(), tanstackStart(), viteReact()],
  resolve: {
    tsconfigPaths: true,
  },
});

export default config;
