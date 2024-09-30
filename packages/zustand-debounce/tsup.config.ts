import type { Options } from "tsup"

export const tsup: Options = {
  splitting: true,
  clean: true,
  dts: false,
  format: "esm",
  bundle: true,
  minifyWhitespace: true,
  minifySyntax: true,
  skipNodeModulesBundle: true,
  treeshake: true,
  target: "es2020",
  entry: ["src/index.ts"],
}
