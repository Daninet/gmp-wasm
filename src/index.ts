import { FloatType, getFloatContext } from './float';
import { getGMPInterface } from './functions';
import { getIntegerContext, IntegerType } from './integer';
import { getRationalContext, RationalType } from './rational';

export interface CalculateType {
  Integer: IntegerType;
  Rational: RationalType;
  Float: FloatType;
};

export async function getGMP(wasmPath: string) {
  const binding = await getGMPInterface(wasmPath);

  return {
    binding,
    Integer: getIntegerContext(binding),
    Rational: getRationalContext(binding),
    Float: getFloatContext(binding),
    calculate: (fn: (gmp: CalculateType) => IntegerType) => {
      const destroyers: (() => void)[] = [];
      const destroyCallback = callback => destroyers.push(callback);
      const param: CalculateType = {
        Integer: getIntegerContext(binding, destroyCallback),
        Rational: getRationalContext(binding, destroyCallback),
        Float: getFloatContext(binding, destroyCallback),
      };
      const res = fn(param).toString();
      destroyers.forEach(obj => obj());
      return res;
    },
  };
}
