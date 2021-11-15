import { unzlibSync } from 'fflate';
import { decodeBase64 } from './base64';
import { gmpWasm } from '../gmp.wasm';

let instance: any = null;

export const getBinding = async () => {
  if (instance !== null) {
    return instance;
  }

  console.time('s');
  const decoded = decodeBase64(gmpWasm);
  const decompressed = unzlibSync(decoded);
  console.timeEnd('s');

  if (typeof WebAssembly === 'undefined') {
    throw new Error('WebAssembly is not supported in this environment!');
  }

  let HEAP8 = null;
  const module = await WebAssembly.compile(decompressed);
  const errorHandler = () => {
    throw new Error('Fatal error in gmp-wasm');
  };

  const wasmInstance = await WebAssembly.instantiate(module, {
    env: {
      emscripten_notify_memory_growth: () => {
        HEAP8 = new Uint8Array((wasmInstance.exports as any).memory.buffer);
      },
    },
    wasi_snapshot_preview1: {
      proc_exit: errorHandler,
      fd_write: errorHandler,
      fd_seek: errorHandler,
      fd_close: errorHandler,
    },
  });
  const exports = wasmInstance.exports as any;
  exports._initialize();
  HEAP8 = new Uint8Array((wasmInstance.exports as any).memory.buffer);

  instance = { HEAP8, ...exports };
  return instance;
};
