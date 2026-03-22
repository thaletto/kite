import { defineNitroConfig } from "nitro/config";
import commonjs from "@rollup/plugin-commonjs";

export default defineNitroConfig({
  preset: "vercel",
  vercel: {
    functions: {
      runtime: "bun1.x",
    },
  },
  rollupConfig: {
    plugins: [
      commonjs({
        include: /katex/,
      }),
    ],
  },
});