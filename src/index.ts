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
  Pi: () => Float;
  EulerConstant: () => Float;
  EulerNumber: () => Float;
  Log2: () => Float;
  Catalan: () => Float;
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

export async function getGMP() {
  const binding = await getGMPInterface() as Awaited<ReturnType<typeof getGMPInterface>>;

  const createContext = (options: CalculateOptions) => {
    const intContext = getIntegerContext(binding);
    const rationalContext = getRationalContext(binding);
    const floatContext = getFloatContext(binding, options);

    return {
      types: {
        Integer: intContext.Integer,
        Rational: rationalContext.Rational,
        Float: floatContext.Float,
        Pi: floatContext.Pi,
        EulerConstant: floatContext.EulerConstant,
        EulerNumber: floatContext.EulerNumber,
        Log2: floatContext.Log2,
        Catalan: floatContext.Catalan,
      },
      destroy: () => {
        intContext.destroy();
        rationalContext.destroy();
        floatContext.destroy();
      },
    };
  };

  return {
    binding,

    calculate: (fn: (gmp: CalculateType) => Integer, options: CalculateOptions = {}): string => {
      const context = createContext(options);
      const res = fn(context.types).toString();
      context.destroy();

      return res;
    },

    calculateManual: (options: CalculateOptions = {}): CalculateTypeWithDestroy => {
      const context = createContext(options);
      return {
        ...context.types,
        destroy: context.destroy,
      };
    },

    reset: async () => {
      return binding.reset();
    },
  };
}
