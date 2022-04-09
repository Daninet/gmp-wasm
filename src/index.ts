import { Float, FloatFactory, FloatOptions, FloatRoundingMode, getFloatContext } from './float';
import { getGMPInterface, GMPFunctions } from './functions';
import { DivMode, getIntegerContext, Integer, IntegerFactory } from './integer';
import { getRationalContext, Rational, RationalFactory } from './rational';

export * from './bindingTypes';

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
  Pi: (options?: FloatOptions) => Float;
  EulerConstant: (options?: FloatOptions) => Float;
  EulerNumber: (options?: FloatOptions) => Float;
  Log2: (options?: FloatOptions) => Float;
  Catalan: (options?: FloatOptions) => Float;
};

export interface CalculateTypeWithDestroy extends CalculateType {
  destroy: () => void;
};

export interface GMPLib {
  binding: GMPFunctions;
  calculate: (fn: (gmp: CalculateType) => Integer | Rational | Float, options?: CalculateOptions) => void;
  getContext: (options?: CalculateOptions) => CalculateTypeWithDestroy;
  reset: () => Promise<void>;
};

export interface CalculateOptions extends FloatOptions {};

export async function init(): Promise<GMPLib> {
  const binding: GMPFunctions = await getGMPInterface();

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

    /** Resets the WASM instance (clears all previously allocated objects) */
    reset: async () => {
      return binding.reset();
    },
  };
}

export const precisionToBits = (digits: number) => Math.ceil(digits * 3.3219281); // digits * log2(10)
