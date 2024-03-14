import type { Options } from "tsup"

export const tsup: Options = {
  splitting: true,
  clean: true,
  dts: false,
  format: "esm",
  bundle: true,
  minifyWhitespace: true,
  minifySyntax: true,
  entryPoints: ["src/index.ts"],
  skipNodeModulesBundle: true,
  treeshake: true,
  target: "es2020",
  outDir: "lib",
  entry: ["src/index.ts"],
}
