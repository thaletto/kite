import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "vercel",
  vercel: {
    functions: {
      runtime: "bun1.x",
    },
  },
  rollupConfig: {
    external: ["katex"],
  },
});
