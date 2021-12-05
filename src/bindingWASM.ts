import { inflateSync } from 'fflate';
import { decodeBase64 } from './base64';
import { gmpWasmLength, gmpWasm } from 'gmpwasmts';

let instance: any = null;
let compiledModule: WebAssembly.Module = null;

const decompressAndCompile = async () => {
  if (compiledModule) return;
  // console.time('decompress');
  const decoded = decodeBase64(gmpWasm);
  const decompressed = new Uint8Array(gmpWasmLength);
  inflateSync(decoded, decompressed);
  // console.timeEnd('decompress');

  // console.time('compile');
  compiledModule = await WebAssembly.compile(decompressed);
  // console.timeEnd('compile');
}

export const getBinding = async (reset = false) => {
  if (!reset && instance !== null) {
    return instance;
  }

  if (typeof WebAssembly === 'undefined') {
    throw new Error('WebAssembly is not supported in this environment!');
  }

  await decompressAndCompile();

  let heap = { HEAP8: null };
  
  const errorHandler = () => {
    throw new Error('Fatal error in gmp-wasm');
  };

  const wasmInstance = await WebAssembly.instantiate(compiledModule, {
    env: {
      emscripten_notify_memory_growth: () => {
        heap.HEAP8 = new Uint8Array((wasmInstance.exports as any).memory.buffer);
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

  heap.HEAP8 = new Uint8Array((wasmInstance.exports as any).memory.buffer);

  instance = { heap, ...exports };
  return instance;
};
