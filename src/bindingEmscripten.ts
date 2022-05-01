import GMPModule from '../binding/dist/gmpmini';

let instance: any = null;

export const getBinding = async (reset = false) => {
  if (instance !== null) {
    return instance;
  }
  const binding = await GMPModule({
    locateFile: function (path) {
      return '/root/gmp-wasm/binding/dist/gmpmini.wasm';
    },
  });
  instance = { ...binding.asm, heap: { HEAP8: binding.HEAP8 } };
  return instance;
};
