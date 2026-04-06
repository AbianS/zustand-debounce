import type { Options } from 'tsup';

export const tsup: Options = {
  splitting: true,
  cjsInterop: true,
  clean: true,
  dts: {
    compilerOptions: {
      // tsup hardcodes baseUrl:"." internally during DTS generation (tsup#6837).
      // ignoreDeprecations scoped here so the main tsconfig stays clean.
      ignoreDeprecations: '6.0',
    },
  },
  format: ['esm', 'cjs'],
  bundle: true,
  minify: true,
  entryPoints: ['src/index.ts'],
  skipNodeModulesBundle: true,
  treeshake: true,
  target: 'es2020',
  outDir: 'dist',
  external: ['zustand-debounce', 'lz-string'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
};
