import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import license from 'rollup-plugin-license';
import commonjs from '@rollup/plugin-commonjs';

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
    @license LGPL-3.0`,
  },
};

const getBundleConfig = (minified = false) => ({
  input: 'src/index.ts',
  output: [
    {
      file: `dist/index.umd${minified ? '.min' : ''}.js`,
      name: 'gmp',
      format: 'umd',
    },
    {
      file: `dist/index.esm${minified ? '.min' : ''}.js`,
      format: 'es',
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    typescript(),
    ...(minified ? [terser(TERSER_CONFIG)]: []),
    license(LICENSE_CONFIG),
  ],
});

export default [getBundleConfig(false), getBundleConfig(true)];
