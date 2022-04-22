import type { GMPFunctions } from './functions';
import { Float } from './float';
import { Rational } from './rational';
declare type IntegerFactoryReturn = ReturnType<typeof getIntegerContext>['Integer'];
export interface IntegerFactory extends IntegerFactoryReturn {
}
declare type IntegerReturn = ReturnType<IntegerFactoryReturn>;
export interface Integer extends IntegerReturn {
}
declare type AllTypes = Integer | Rational | Float | string | number;
declare type OutputType<T> = T extends number ? Integer : T extends Integer ? Integer : T extends Rational ? Rational : T extends Float ? Float : never;
export declare enum DivMode {
    CEIL = 0,
    FLOOR = 1,
    TRUNCATE = 2
}
export declare function getIntegerContext(gmp: GMPFunctions, ctx: any): {
    Integer: (num?: string | number | Integer | Uint8Array | Rational | Float, radix?: number) => {
        mpz_t: number;
        type: string;
        /** Returns the sum of this number and the given one. */
        add<T extends AllTypes>(val: T): OutputType<T>;
        /** Returns the difference of this number and the given one. */
        sub<T_1 extends AllTypes>(val: T_1): OutputType<T_1>;
        /** Returns the product of this number and the given one. */
        mul<T_2 extends AllTypes>(val: T_2): OutputType<T_2>;
        /** Returns the number with inverted sign. */
        neg(): Integer;
        /** Returns the absolute value of this number. */
        abs(): Integer;
        /** Returns the result of the division of this number by the given one. */
        div<T_3 extends AllTypes>(val: T_3, mode?: DivMode): OutputType<T_3>;
        /** Returns this number exponentiated to the given value. */
        pow(exp: Rational | Integer | number, mod?: Integer | number): Integer;
        /** Returns the integer square root number, rounded down. */
        sqrt(): Integer;
        /** Returns the truncated integer part of the nth root */
        nthRoot(nth: number): Integer;
        /** Returns the factorial */
        factorial(): Integer;
        /** Returns the double factorial */
        doubleFactorial(): Integer;
        /** Determines whether a number is prime using some trial divisions, then reps Miller-Rabin probabilistic primality tests. */
        isProbablyPrime(reps?: number): boolean | 'probably-prime';
        /** Identifies primes using a probabilistic algorithm; the chance of a composite passing will be extremely small. */
        nextPrime(): Integer;
        /** Returns the greatest common divisor of this number and the given one. */
        gcd(val: Integer | number): Integer;
        /** Returns the least common multiple of this number and the given one. */
        lcm(val: Integer | number): Integer;
        /** Returns the one's complement. */
        complement1(): Integer;
        /** Returns the two's complement. */
        complement2(): Integer;
        /** Returns the integer bitwise-and combined with another integer. */
        and(val: Integer | number): Integer;
        /** Returns the integer bitwise-or combined with another integer. */
        or(val: Integer | number): Integer;
        /** Returns the integer bitwise-xor combined with another integer. */
        xor(val: Integer | number): Integer;
        /** Returns the integer left shifted by a given number of bits. */
        shiftLeft(val: number): Integer;
        /** Returns the integer right shifted by a given number of bits. */
        shiftRight(val: number): Integer;
        /** Sets the value of bit i to 1. The least significant bit is number 0 */
        setBit(i: number): Integer;
        /** Sets the value of multiple bits to 1. The least significant bit is number 0 */
        setBits(indices: number[]): Integer;
        /** Sets the value of bit i to 0. The least significant bit is number 0 */
        clearBit(index: number): Integer;
        /** Sets the value of multiple bits to 0. The least significant bit is number 0 */
        clearBits(indices: number[]): Integer;
        /** Inverts the value of bit i. The least significant bit is number 0 */
        flipBit(index: number): Integer;
        /** Inverts the value of multiple bits. The least significant bit is number 0 */
        flipBits(indices: number[]): Integer;
        /** Returns 0 or 1 based on the value of a bit at the provided index. The least significant bit is number 0 */
        getBit(index: number): number;
        msbPosition(): number;
        /** Works similarly to JS Array.slice() but on bits. The least significant bit is number 0 */
        sliceBits(start?: number, end?: number): Integer;
        /** Creates new integer with the copy of binary representation of num to position offset. Optionally bitCount can be used to zero-pad the number to a specific number of bits. The least significant bit is number 0 */
        writeTo(num: Integer, offset?: number, bitCount?: number): Integer;
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
        /** Returns the sign of the current value (-1 or 0 or 1) */
        sign(): -1 | 0 | 1;
        /** Converts current value into a JavaScript number */
        toNumber(): number;
        /** Exports integer into an Uint8Array. Sign is ignored. */
        toBuffer(littleEndian?: boolean): Uint8Array;
        /** Converts the number to string */
        toString(radix?: number): string;
        /** Converts the number to a rational number */
        toRational(): Rational;
        /** Converts the number to a floating-point number */
        toFloat(): Float;
    };
    isInteger: (val: any) => boolean;
    destroy: () => void;
};
export {};
