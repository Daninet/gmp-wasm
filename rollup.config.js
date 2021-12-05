import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import license from 'rollup-plugin-license';
import commonjs from '@rollup/plugin-commonjs';
import packageJson from './package.json';

const TERSER_CONFIG = {
  output: {
    comments: false,
  },
};

const LICENSE_CONFIG = {
  banner: {
    commentStyle: 'ignored',
    content: `gmp-wasm v${packageJson.version} (https://www.npmjs.com/package/gmp-wasm)
    (c) Dani Biro
    @license LGPL-3.0`,
  },
};

const getBundleConfig = (miniLib = false, minified = false) => ({
  input: 'src/index.ts',
  output: [
    {
      file: `dist/${miniLib ? 'mini' : 'index'}.umd${minified ? '.min' : ''}.js`,
      name: 'gmp',
      format: 'umd',
    },
    {
      file: `dist/${miniLib ? 'mini' : 'index'}.esm${minified ? '.min' : ''}.js`,
      format: 'es',
    },
  ],
  plugins: [
    alias({
      entries: [
        { find: 'gmpwasmts', replacement: `../${miniLib ? 'gmpmini' : 'gmp'}.wasm.ts` }
      ]
    }),
    nodeResolve(),
    commonjs(),
    json(),
    typescript(),
    ...(minified ? [terser(TERSER_CONFIG)]: []),
    license(LICENSE_CONFIG),
  ],
});

export default [
  getBundleConfig(false, false),
  getBundleConfig(false, true),
  getBundleConfig(true, false),
  getBundleConfig(true, true)
];
