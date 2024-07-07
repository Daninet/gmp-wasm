import { Float, FloatFactory, FloatOptions, FloatRoundingMode } from './float';
import { GMPFunctions } from './functions';
import { DivMode, Integer, IntegerFactory } from './integer';
import { Rational, RationalFactory } from './rational';
export * from './bindingTypes';
export { DivMode, FloatRoundingMode, GMPFunctions, };
export type { Float as FloatType, Integer as IntegerType, Rational as RationalType, FloatOptions, };
export interface CalculateType {
    Integer: IntegerFactory;
    Rational: RationalFactory;
    Float: FloatFactory;
    Pi: (options?: FloatOptions) => Float;
    EulerConstant: (options?: FloatOptions) => Float;
    EulerNumber: (options?: FloatOptions) => Float;
    Log2: (options?: FloatOptions) => Float;
    Catalan: (options?: FloatOptions) => Float;
}
export interface CalculateTypeWithDestroy extends CalculateType {
    destroy: () => void;
}
export interface GMPLib {
    binding: GMPFunctions;
    calculate: (fn: (gmp: CalculateType) => Integer | Rational | Float | string, options?: CalculateOptions) => void;
    getContext: (options?: CalculateOptions) => CalculateTypeWithDestroy;
    reset: () => Promise<void>;
}
export interface CalculateOptions extends FloatOptions {
}
export declare function init(): Promise<GMPLib>;
export declare const precisionToBits: (digits: number) => number;
