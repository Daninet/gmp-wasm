import { Float, FloatFactory, FloatRoundingMode, getFloatContext } from './float';
import { getGMPInterface, GMPFunctions } from './functions';
import { DivMode, getIntegerContext, Integer, IntegerFactory } from './integer';
import { getRationalContext, Rational, RationalFactory } from './rational';

export interface CalculateType {
  Integer: IntegerFactory;
  Rational: RationalFactory;
  Float: FloatFactory;
};

export {
  Float,
  Integer,
  Rational,
  DivMode,
  FloatRoundingMode,
  GMPFunctions,
};

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export interface GMPLib extends CalculateType {
  binding: Awaited<ReturnType<typeof getGMPInterface>>;
  calculate: (fn: (gmp: CalculateType) => Integer) => void;
};

export async function getGMP(wasmPath: string): Promise<GMPLib> {
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
