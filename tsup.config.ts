import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  // No sourcemaps in the published package: they were ~100KB of a ~190KB
  // payload for a string-builder nobody step-debugs into.
  sourcemap: false,
  clean: true,
  target: "es2022",
  outDir: "dist",
});
