import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "vercel",
  vercel: {
    functions: {
      runtime: "bun1.x",
    },
  },
  rollupConfig: {
    plugins: [
      {
        name: "katex-esm-redirect",
        resolveId(id: string) {
          if (id === "katex") {
            return require.resolve("katex/dist/katex.mjs");
          }
        },
      },
    ],
  },
});
