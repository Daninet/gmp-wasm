import type { GMPFunctions } from './functions';
import { Float } from './float';
import { Integer } from './integer';
declare type RationalFactoryReturn = ReturnType<typeof getRationalContext>['Rational'];
export interface RationalFactory extends RationalFactoryReturn {
}
declare type RationalReturn = ReturnType<RationalFactoryReturn>;
export interface Rational extends RationalReturn {
}
declare type AllTypes = Integer | Rational | Float | string | number;
declare type OutputType<T> = T extends number ? Rational : T extends Integer ? Rational : T extends Rational ? Rational : T extends Float ? Float : never;
export declare function getRationalContext(gmp: GMPFunctions, ctx: any): {
    Rational: (p1: string | number | Rational | Integer, p2?: string | number | Integer) => {
        mpq_t: number;
        type: string;
        /** Returns the sum of this number and the given one. */
        add<T extends AllTypes>(val: T): OutputType<T>;
        /** Returns the difference of this number and the given one. */
        sub<T_1 extends AllTypes>(val: T_1): OutputType<T_1>;
        /** Returns the product of this number and the given one. */
        mul<T_2 extends AllTypes>(val: T_2): OutputType<T_2>;
        /** Returns the number with inverted sign. */
        neg(): Rational;
        /** Returns the inverse of the number. */
        invert(): Rational;
        /** Returns the absolute value of this number. */
        abs(): Rational;
        /** Returns the result of the division of this number by the given one. */
        div<T_3 extends AllTypes>(val: T_3): OutputType<T_3>;
        /** Returns true if the current number is equal to the provided number */
        isEqual(val: AllTypes): boolean;
        /** Returns true if the current number is less than the provided number */
        lessThan(val: AllTypes): boolean;
        /** Returns true if the current number is less than or equal to the provided number */
        lessOrEqual(val: AllTypes): boolean;
        /** Returns true if the current number is greater than the provided number */
        greaterThan(val: AllTypes): boolean;
        /** Returns true if the current number is greater than or equal to the provided number */
        greaterOrEqual(val: AllTypes): boolean;
        /** Returns the numerator of the number */
        numerator(): Integer;
        /** Returns the denominator of the number */
        denominator(): Integer;
        /** Returns the sign of the current value (-1 or 0 or 1) */
        sign(): -1 | 0 | 1;
        /** Converts current value to a JavaScript number */
        toNumber(): number;
        /** Converts the number to string */
        toString(radix?: number): string;
        /** Converts the number to an integer */
        toInteger(): Integer;
        /** Converts the number to a floating-point number */
        toFloat(): Float;
    };
    isRational: (val: any) => boolean;
    destroy: () => void;
};
export {};
