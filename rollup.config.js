import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import license from 'rollup-plugin-license';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

const TERSER_CONFIG = {
  output: {
    comments: false,
  },
};

const LICENSE_CONFIG = {
  banner: {
    commentStyle: 'ignored',
    content: `gmp-wasm (https://www.npmjs.com/package/gmp-wasm)
    (c) Dani Biro
    @license GPL-2.0`,
  },
};

const MINIFIED_MAIN_BUNDLE_CONFIG = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.umd.min.js',
      name: 'gmp',
      format: 'umd',
    },
    {
      file: 'dist/index.esm.min.js',
      format: 'es',
    },
  ],
  plugins: [
    commonjs(),
    json(),
    typescript(),
    terser(TERSER_CONFIG),
    license(LICENSE_CONFIG),
    copy({
      targets: [{ src: './binding/dist/gmp.wasm', dest: './dist' }],
    }),
  ],
};

export default [MINIFIED_MAIN_BUNDLE_CONFIG];
