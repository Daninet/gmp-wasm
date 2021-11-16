import GMPModule from '../binding/dist/gmp';

let instance: any = null;

export const getBinding = async (wasmPath: string) => {
  if (instance !== null) {
    return instance;
  }
  const binding = await GMPModule({
    locateFile: function (path) {
      return wasmPath;
    },
  });
  instance = binding;
  return instance;
};
