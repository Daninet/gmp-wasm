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

export async function init() {
  const binding: Awaited<ReturnType<typeof getGMPInterface>> = await getGMPInterface();

  const createContext = (options: CalculateOptions) => {
    const ctx = {
      intContext: null,
      rationalContext: null,
      floatContext: null,
    };

    ctx.intContext = getIntegerContext(binding, ctx);
    ctx.rationalContext = getRationalContext(binding, ctx);
    ctx.floatContext = getFloatContext(binding, ctx, options);

    return {
      types: {
        Integer: ctx.intContext.Integer,
        Rational: ctx.rationalContext.Rational,
        Float: ctx.floatContext.Float,
        Pi: ctx.floatContext.Pi,
        EulerConstant: ctx.floatContext.EulerConstant,
        EulerNumber: ctx.floatContext.EulerNumber,
        Log2: ctx.floatContext.Log2,
        Catalan: ctx.floatContext.Catalan,
      },

      destroy: () => {
        ctx.intContext.destroy();
        ctx.rationalContext.destroy();
        ctx.floatContext.destroy();
      },
    };
  };

  return {
    binding,

    calculate: (fn: (gmp: CalculateType) => Integer | Rational | Float, options: CalculateOptions = {}): string => {
      const context = createContext(options);
      if (typeof fn !== 'function') {
        throw new Error('calculate() requires a callback function');
      }
      const fnRes = fn(context.types);
      const res = fnRes?.toString();
      context.destroy();

      return res;
    },

    getContext: (options: CalculateOptions = {}): CalculateTypeWithDestroy => {
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

export const precisionToBits = (digits: number) => Math.ceil(digits * 3.3219281); // digits * log2(10)
