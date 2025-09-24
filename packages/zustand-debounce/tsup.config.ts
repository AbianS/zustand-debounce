import type { Options } from 'tsup';

export const tsup: Options = {
  splitting: true,
  cjsInterop: true,
  clean: true,
  dts: false,
  format: ['esm', 'cjs'],
  bundle: true,
  minify: true,
  entryPoints: ['src/index.ts'],
  skipNodeModulesBundle: true,
  treeshake: true,
  target: 'es2020',
  outDir: 'dist',
  external: ['zustand'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
};
