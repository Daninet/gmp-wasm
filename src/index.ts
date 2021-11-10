import { Float, FloatRoundingMode, getFloatContext } from './float';
import { getGMPInterface, GMPFunctions } from './functions';
import { DivMode, getIntegerContext, Integer } from './integer';
import { getRationalContext, Rational } from './rational';

export interface CalculateType {
  Integer: ReturnType<typeof getIntegerContext>;
  Rational: ReturnType<typeof getRationalContext>;
  Float: ReturnType<typeof getFloatContext>;
};

export type {
  Float,
  Integer,
  Rational,
  DivMode,
  FloatRoundingMode,
  GMPFunctions,
};

export async function getGMP(wasmPath: string) {
  const binding = await getGMPInterface(wasmPath);

  return {
    binding,
    Integer: getIntegerContext(binding),
    Rational: getRationalContext(binding),
    Float: getFloatContext(binding),
    calculate: (fn: (gmp: CalculateType) => Integer) => {
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
