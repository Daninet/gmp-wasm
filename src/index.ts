import { getGMPInterface } from './functions';
import { getIntegerContext, IntegerType } from './integer';

export interface CalculateType {
  Integer: IntegerType;
};

export async function getGMP(wasmPath: string) {
  const binding = await getGMPInterface(wasmPath);

  return {
    binding,
    Integer: getIntegerContext(binding),
    calculate: (fn: (gmp: CalculateType) => IntegerType) => {
      const destroyers: (() => void)[] = [];
      const Integer = getIntegerContext(binding, (callback => destroyers.push(callback)));
      const param: CalculateType = {
        Integer,
      };
      const res = fn(param);
      destroyers.forEach(obj => obj());
      return res.toString();
    },
  };
}
