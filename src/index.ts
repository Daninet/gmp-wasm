import { Float, FloatFactory, FloatOptions, FloatRoundingMode, getFloatContext } from './float';
import { getGMPInterface, GMPFunctions } from './functions';
import { DivMode, getIntegerContext, Integer, IntegerFactory } from './integer';
import { getRationalContext, Rational, RationalFactory } from './rational';



export {
  DivMode,
  FloatRoundingMode,
  GMPFunctions,
};

export type {
  Float as FloatType,
  Integer as IntegerType,
  Rational as RationalType,
  FloatOptions,
}

export interface CalculateType {
  Integer: IntegerFactory;
  Rational: RationalFactory;
  Float: FloatFactory;
};

export interface CalculateTypeWithDestroy extends CalculateType {
  destroy: () => void;
};

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

// export interface GMPLib {
//   binding: Awaited<ReturnType<typeof getGMPInterface>>;
//   calculate: (fn: (gmp: CalculateType) => Integer) => void;
// };

export interface CalculateOptions extends FloatOptions {};

export async function getGMP(wasmPath: string) {
  const binding = await getGMPInterface(wasmPath) as Awaited<ReturnType<typeof getGMPInterface>>;

  return {
    binding,

    calculate: (fn: (gmp: CalculateType) => Integer, options: CalculateOptions = {}): string => {
      const intContext = getIntegerContext(binding);
      const rationalContext = getRationalContext(binding);
      const floatContext = getFloatContext(binding, options);

      const param: CalculateType = {
        Integer: intContext.Integer,
        Rational: rationalContext.Rational,
        Float: floatContext.Float,
      };

      const res = fn(param).toString();

      intContext.destroy();
      rationalContext.destroy();
      floatContext.destroy();

      return res;
    },

    calculateManual: (options: CalculateOptions = {}): CalculateTypeWithDestroy => {
      const intContext = getIntegerContext(binding);
      const rationalContext = getRationalContext(binding);
      const floatContext = getFloatContext(binding, options);

      return {
        Integer: intContext.Integer,
        Rational: rationalContext.Rational,
        Float: floatContext.Float,
        destroy: () => {
          intContext.destroy();
          rationalContext.destroy();
          floatContext.destroy();
        },
      };
    }
  };
}
