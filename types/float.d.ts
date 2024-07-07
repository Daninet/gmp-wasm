import { GMPFunctions } from './functions';
import { Integer } from './integer';
import { Rational } from './rational';
declare type FloatFactoryReturn = ReturnType<typeof getFloatContext>['Float'];
export interface FloatFactory extends FloatFactoryReturn {
}
declare type FloatReturn = ReturnType<FloatFactoryReturn>;
export interface Float extends FloatReturn {
}
declare type AllTypes = Integer | Rational | Float | string | number;
/** Represents the different rounding modes. */
export declare enum FloatRoundingMode {
    /** Round to nearest, with ties to even. MPFR_RNDN */
    ROUND_NEAREST = 0,
    /** Round toward zero. MPFR_RNDZ */
    ROUND_TO_ZERO = 1,
    /** Round toward +Infinity. MPFR_RNDU */
    ROUND_UP = 2,
    /** Round toward -Infinity. MPFR_RNDD */
    ROUND_DOWN = 3,
    /** Round away from zero. MPFR_RNDA */
    ROUND_FROM_ZERO = 4
}
export interface FloatOptions {
    precisionBits?: number;
    roundingMode?: FloatRoundingMode;
    radix?: number;
}
export declare function getFloatContext(gmp: GMPFunctions, ctx: any, ctxOptions?: FloatOptions): {
    Float: (val?: null | undefined | string | number | Float | Rational | Integer, options?: FloatOptions) => {
        mpfr_t: number;
        precisionBits: number;
        rndMode: number;
        radix: number;
        type: string;
        readonly options: FloatOptions;
        readonly setOptions: FloatOptions;
        /** Returns the sum of this number and the given one. */
        add(val: AllTypes): Float;
        /** Returns the difference of this number and the given one. */
        sub(val: AllTypes): Float;
        /** Returns the product of this number and the given one. */
        mul(val: AllTypes): Float;
        /** Returns the result of the division of this number by the given one. */
        div(val: AllTypes): Float;
        /** Returns the square root. */
        sqrt(): Float;
        /** Returns the reciprocal square root. */
        invSqrt(): Float;
        /** Returns the cube root. */
        cbrt(): Float;
        /** Returns the n-th root. */
        nthRoot(nth: number): Float;
        /** Returns the number with inverted sign. */
        neg(): Float;
        /** Returns the absolute value. */
        abs(): Float;
        /** Returns the factorial */
        factorial(): Float;
        /** Returns true if the number is an integer */
        isInteger(): boolean;
        /** Returns true if the number is zero */
        isZero(): boolean;
        /** Returns true if the number is a regular number (i.e., neither NaN, nor an infinity nor zero) */
        isRegular(): boolean;
        /** Return true if the number is an ordinary number (i.e., neither NaN nor an infinity) */
        isNumber(): boolean;
        /** Returns true if the number is an infinity */
        isInfinite(): boolean;
        /** Returns true if the number is NaN */
        isNaN(): boolean;
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
        /** Returns the natural logarithm */
        ln(): Float;
        /** Returns the base 2 logarithm */
        log2(): Float;
        /** Returns the base 10 logarithm */
        log10(): Float;
        /** Returns the exponential (e^x) */
        exp(): Float;
        /** Returns 2 to the power of current number (2^x) */
        exp2(): Float;
        /** Returns 10 to the power of current number (10^x) */
        exp10(): Float;
        /** Returns this number exponentiated to the given value. */
        pow(val: Float | number): Float;
        /** Returns the sine */
        sin(): Float;
        /** Returns the cosine */
        cos(): Float;
        /** Returns the tangent */
        tan(): Float;
        /** Returns the secant */
        sec(): Float;
        /** Returns the cosecant */
        csc(): Float;
        /** Returns the cotangent */
        cot(): Float;
        /** Returns the arc-cosine */
        acos(): Float;
        /** Returns the arc-sine */
        asin(): Float;
        /** Returns the arc-tangent */
        atan(): Float;
        /** Returns the hyperbolic sine */
        sinh(): Float;
        /** Returns the hyperbolic cosine */
        cosh(): Float;
        /** Returns the hyperbolic tangent */
        tanh(): Float;
        /** Returns the hyperbolic secant */
        sech(): Float;
        /** Returns the hyperbolic cosecant */
        csch(): Float;
        /** Returns the hyperbolic cotangent */
        coth(): Float;
        /** Returns the inverse hyperbolic cosine */
        acosh(): Float;
        /** Returns the inverse hyperbolic sine */
        asinh(): Float;
        /** Returns the inverse hyperbolic tangent */
        atanh(): Float;
        /** Calculate exponential integral */
        eint(): Float;
        /** Calculate the real part of the dilogarithm (the integral of -log(1-t)/t from 0 to op) */
        li2(): Float;
        /** Calculate the value of the Gamma function. */
        gamma(): Float;
        /** Calculate the value of the logarithm of the absolute value of the Gamma function */
        lngamma(): Float;
        /** Calculate the value of the Digamma (sometimes also called Psi) function */
        digamma(): Float;
        /** Calculate the value of the Beta function */
        beta(op2: Float): Float;
        /** Calculate the value of the Riemann Zeta function */
        zeta(): Float;
        /** Calculate the value of the error function */
        erf(): Float;
        /** Calculate the value of the complementary error function */
        erfc(): Float;
        /** Calculate the value of the first kind Bessel function of order 0 */
        j0(): Float;
        /** Calculate the value of the first kind Bessel function of order 1 */
        j1(): Float;
        /** Calculate the value of the first kind Bessel function of order n */
        jn(n: number): Float;
        /** Calculate the value of the second kind Bessel function of order 0 */
        y0(): Float;
        /** Calculate the value of the second kind Bessel function of order 1 */
        y1(): Float;
        /** Calculate the value of the second kind Bessel function of order n */
        yn(n: number): Float;
        /** Calculate the arithmetic-geometric mean */
        agm(op2: Float): Float;
        /** Calculate the value of the Airy function Ai on x */
        ai(): Float;
        /** Returns the sign of the current value (-1 or 0 or 1) */
        sign(): -1 | 0 | 1;
        /** Converts current value into a JavaScript number */
        toNumber(): number;
        /** Rounds to the next higher or equal representable integer */
        ceil(): Float;
        /** Rounds to the next lower or equal representable integer */
        floor(): Float;
        /** Rounds to the nearest representable integer, rounding halfway cases away from zero */
        round(): Float;
        /** Rounds to the nearest representable integer, rounding halfway cases with the even-rounding rule */
        roundEven(): Float;
        /** Rounds to the next representable integer toward zero */
        trunc(): Float;
        /** Round to precision */
        roundTo(prec: number): Float;
        /** Returns the fractional part */
        frac(): Float;
        /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded toward zero */
        fmod(y: Float): Float;
        /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded to the nearest integer (ties rounded to even) */
        remainder(y: Float): Float;
        /** Return next value towards +∞ */
        nextAbove(): Float;
        /** Return next value towards -∞ */
        nextBelow(): Float;
        /** Returns the exponent of x, assuming that x is a non-zero ordinary number and the significand is considered in [1/2, 1). */
        exponent(): number;
        /** Converts the number to string */
        toString(radix?: number): string;
        /** Formats the number using fixed-point notation */
        toFixed(digits?: number, radix?: number): string;
        /** Converts the number to an integer */
        toInteger(): Integer;
        /** Get error intervals */
        toInterval(): [Float, Float];
        /** Converts the number to a rational number */
        toRational(): Rational;
    };
    isFloat: (val: any) => boolean;
    Pi: (options?: FloatOptions) => {
        mpfr_t: number;
        precisionBits: number;
        rndMode: number;
        radix: number;
        type: string;
        readonly options: FloatOptions;
        readonly setOptions: FloatOptions;
        /** Returns the sum of this number and the given one. */
        add(val: AllTypes): Float;
        /** Returns the difference of this number and the given one. */
        sub(val: AllTypes): Float;
        /** Returns the product of this number and the given one. */
        mul(val: AllTypes): Float;
        /** Returns the result of the division of this number by the given one. */
        div(val: AllTypes): Float;
        /** Returns the square root. */
        sqrt(): Float;
        /** Returns the reciprocal square root. */
        invSqrt(): Float;
        /** Returns the cube root. */
        cbrt(): Float;
        /** Returns the n-th root. */
        nthRoot(nth: number): Float;
        /** Returns the number with inverted sign. */
        neg(): Float;
        /** Returns the absolute value. */
        abs(): Float;
        /** Returns the factorial */
        factorial(): Float;
        /** Returns true if the number is an integer */
        isInteger(): boolean;
        /** Returns true if the number is zero */
        isZero(): boolean;
        /** Returns true if the number is a regular number (i.e., neither NaN, nor an infinity nor zero) */
        isRegular(): boolean;
        /** Return true if the number is an ordinary number (i.e., neither NaN nor an infinity) */
        isNumber(): boolean;
        /** Returns true if the number is an infinity */
        isInfinite(): boolean;
        /** Returns true if the number is NaN */
        isNaN(): boolean;
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
        /** Returns the natural logarithm */
        ln(): Float;
        /** Returns the base 2 logarithm */
        log2(): Float;
        /** Returns the base 10 logarithm */
        log10(): Float;
        /** Returns the exponential (e^x) */
        exp(): Float;
        /** Returns 2 to the power of current number (2^x) */
        exp2(): Float;
        /** Returns 10 to the power of current number (10^x) */
        exp10(): Float;
        /** Returns this number exponentiated to the given value. */
        pow(val: Float | number): Float;
        /** Returns the sine */
        sin(): Float;
        /** Returns the cosine */
        cos(): Float;
        /** Returns the tangent */
        tan(): Float;
        /** Returns the secant */
        sec(): Float;
        /** Returns the cosecant */
        csc(): Float;
        /** Returns the cotangent */
        cot(): Float;
        /** Returns the arc-cosine */
        acos(): Float;
        /** Returns the arc-sine */
        asin(): Float;
        /** Returns the arc-tangent */
        atan(): Float;
        /** Returns the hyperbolic sine */
        sinh(): Float;
        /** Returns the hyperbolic cosine */
        cosh(): Float;
        /** Returns the hyperbolic tangent */
        tanh(): Float;
        /** Returns the hyperbolic secant */
        sech(): Float;
        /** Returns the hyperbolic cosecant */
        csch(): Float;
        /** Returns the hyperbolic cotangent */
        coth(): Float;
        /** Returns the inverse hyperbolic cosine */
        acosh(): Float;
        /** Returns the inverse hyperbolic sine */
        asinh(): Float;
        /** Returns the inverse hyperbolic tangent */
        atanh(): Float;
        /** Calculate exponential integral */
        eint(): Float;
        /** Calculate the real part of the dilogarithm (the integral of -log(1-t)/t from 0 to op) */
        li2(): Float;
        /** Calculate the value of the Gamma function. */
        gamma(): Float;
        /** Calculate the value of the logarithm of the absolute value of the Gamma function */
        lngamma(): Float;
        /** Calculate the value of the Digamma (sometimes also called Psi) function */
        digamma(): Float;
        /** Calculate the value of the Beta function */
        beta(op2: Float): Float;
        /** Calculate the value of the Riemann Zeta function */
        zeta(): Float;
        /** Calculate the value of the error function */
        erf(): Float;
        /** Calculate the value of the complementary error function */
        erfc(): Float;
        /** Calculate the value of the first kind Bessel function of order 0 */
        j0(): Float;
        /** Calculate the value of the first kind Bessel function of order 1 */
        j1(): Float;
        /** Calculate the value of the first kind Bessel function of order n */
        jn(n: number): Float;
        /** Calculate the value of the second kind Bessel function of order 0 */
        y0(): Float;
        /** Calculate the value of the second kind Bessel function of order 1 */
        y1(): Float;
        /** Calculate the value of the second kind Bessel function of order n */
        yn(n: number): Float;
        /** Calculate the arithmetic-geometric mean */
        agm(op2: Float): Float;
        /** Calculate the value of the Airy function Ai on x */
        ai(): Float;
        /** Returns the sign of the current value (-1 or 0 or 1) */
        sign(): -1 | 0 | 1;
        /** Converts current value into a JavaScript number */
        toNumber(): number;
        /** Rounds to the next higher or equal representable integer */
        ceil(): Float;
        /** Rounds to the next lower or equal representable integer */
        floor(): Float;
        /** Rounds to the nearest representable integer, rounding halfway cases away from zero */
        round(): Float;
        /** Rounds to the nearest representable integer, rounding halfway cases with the even-rounding rule */
        roundEven(): Float;
        /** Rounds to the next representable integer toward zero */
        trunc(): Float;
        /** Round to precision */
        roundTo(prec: number): Float;
        /** Returns the fractional part */
        frac(): Float;
        /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded toward zero */
        fmod(y: Float): Float;
        /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded to the nearest integer (ties rounded to even) */
        remainder(y: Float): Float;
        /** Return next value towards +∞ */
        nextAbove(): Float;
        /** Return next value towards -∞ */
        nextBelow(): Float;
        /** Returns the exponent of x, assuming that x is a non-zero ordinary number and the significand is considered in [1/2, 1). */
        exponent(): number;
        /** Converts the number to string */
        toString(radix?: number): string;
        /** Formats the number using fixed-point notation */
        toFixed(digits?: number, radix?: number): string;
        /** Converts the number to an integer */
        toInteger(): Integer;
        /** Get error intervals */
        toInterval(): [Float, Float];
        /** Converts the number to a rational number */
        toRational(): Rational;
    };
    EulerConstant: (options?: FloatOptions) => {
        mpfr_t: number;
        precisionBits: number;
        rndMode: number;
        radix: number;
        type: string;
        readonly options: FloatOptions;
        readonly setOptions: FloatOptions;
        /** Returns the sum of this number and the given one. */
        add(val: AllTypes): Float;
        /** Returns the difference of this number and the given one. */
        sub(val: AllTypes): Float;
        /** Returns the product of this number and the given one. */
        mul(val: AllTypes): Float;
        /** Returns the result of the division of this number by the given one. */
        div(val: AllTypes): Float;
        /** Returns the square root. */
        sqrt(): Float;
        /** Returns the reciprocal square root. */
        invSqrt(): Float;
        /** Returns the cube root. */
        cbrt(): Float;
        /** Returns the n-th root. */
        nthRoot(nth: number): Float;
        /** Returns the number with inverted sign. */
        neg(): Float;
        /** Returns the absolute value. */
        abs(): Float;
        /** Returns the factorial */
        factorial(): Float;
        /** Returns true if the number is an integer */
        isInteger(): boolean;
        /** Returns true if the number is zero */
        isZero(): boolean;
        /** Returns true if the number is a regular number (i.e., neither NaN, nor an infinity nor zero) */
        isRegular(): boolean;
        /** Return true if the number is an ordinary number (i.e., neither NaN nor an infinity) */
        isNumber(): boolean;
        /** Returns true if the number is an infinity */
        isInfinite(): boolean;
        /** Returns true if the number is NaN */
        isNaN(): boolean;
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
        /** Returns the natural logarithm */
        ln(): Float;
        /** Returns the base 2 logarithm */
        log2(): Float;
        /** Returns the base 10 logarithm */
        log10(): Float;
        /** Returns the exponential (e^x) */
        exp(): Float;
        /** Returns 2 to the power of current number (2^x) */
        exp2(): Float;
        /** Returns 10 to the power of current number (10^x) */
        exp10(): Float;
        /** Returns this number exponentiated to the given value. */
        pow(val: Float | number): Float;
        /** Returns the sine */
        sin(): Float;
        /** Returns the cosine */
        cos(): Float;
        /** Returns the tangent */
        tan(): Float;
        /** Returns the secant */
        sec(): Float;
        /** Returns the cosecant */
        csc(): Float;
        /** Returns the cotangent */
        cot(): Float;
        /** Returns the arc-cosine */
        acos(): Float;
        /** Returns the arc-sine */
        asin(): Float;
        /** Returns the arc-tangent */
        atan(): Float;
        /** Returns the hyperbolic sine */
        sinh(): Float;
        /** Returns the hyperbolic cosine */
        cosh(): Float;
        /** Returns the hyperbolic tangent */
        tanh(): Float;
        /** Returns the hyperbolic secant */
        sech(): Float;
        /** Returns the hyperbolic cosecant */
        csch(): Float;
        /** Returns the hyperbolic cotangent */
        coth(): Float;
        /** Returns the inverse hyperbolic cosine */
        acosh(): Float;
        /** Returns the inverse hyperbolic sine */
        asinh(): Float;
        /** Returns the inverse hyperbolic tangent */
        atanh(): Float;
        /** Calculate exponential integral */
        eint(): Float;
        /** Calculate the real part of the dilogarithm (the integral of -log(1-t)/t from 0 to op) */
        li2(): Float;
        /** Calculate the value of the Gamma function. */
        gamma(): Float;
        /** Calculate the value of the logarithm of the absolute value of the Gamma function */
        lngamma(): Float;
        /** Calculate the value of the Digamma (sometimes also called Psi) function */
        digamma(): Float;
        /** Calculate the value of the Beta function */
        beta(op2: Float): Float;
        /** Calculate the value of the Riemann Zeta function */
        zeta(): Float;
        /** Calculate the value of the error function */
        erf(): Float;
        /** Calculate the value of the complementary error function */
        erfc(): Float;
        /** Calculate the value of the first kind Bessel function of order 0 */
        j0(): Float;
        /** Calculate the value of the first kind Bessel function of order 1 */
        j1(): Float;
        /** Calculate the value of the first kind Bessel function of order n */
        jn(n: number): Float;
        /** Calculate the value of the second kind Bessel function of order 0 */
        y0(): Float;
        /** Calculate the value of the second kind Bessel function of order 1 */
        y1(): Float;
        /** Calculate the value of the second kind Bessel function of order n */
        yn(n: number): Float;
        /** Calculate the arithmetic-geometric mean */
        agm(op2: Float): Float;
        /** Calculate the value of the Airy function Ai on x */
        ai(): Float;
        /** Returns the sign of the current value (-1 or 0 or 1) */
        sign(): -1 | 0 | 1;
        /** Converts current value into a JavaScript number */
        toNumber(): number;
        /** Rounds to the next higher or equal representable integer */
        ceil(): Float;
        /** Rounds to the next lower or equal representable integer */
        floor(): Float;
        /** Rounds to the nearest representable integer, rounding halfway cases away from zero */
        round(): Float;
        /** Rounds to the nearest representable integer, rounding halfway cases with the even-rounding rule */
        roundEven(): Float;
        /** Rounds to the next representable integer toward zero */
        trunc(): Float;
        /** Round to precision */
        roundTo(prec: number): Float;
        /** Returns the fractional part */
        frac(): Float;
        /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded toward zero */
        fmod(y: Float): Float;
        /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded to the nearest integer (ties rounded to even) */
        remainder(y: Float): Float;
        /** Return next value towards +∞ */
        nextAbove(): Float;
        /** Return next value towards -∞ */
        nextBelow(): Float;
        /** Returns the exponent of x, assuming that x is a non-zero ordinary number and the significand is considered in [1/2, 1). */
        exponent(): number;
        /** Converts the number to string */
        toString(radix?: number): string;
        /** Formats the number using fixed-point notation */
        toFixed(digits?: number, radix?: number): string;
        /** Converts the number to an integer */
        toInteger(): Integer;
        /** Get error intervals */
        toInterval(): [Float, Float];
        /** Converts the number to a rational number */
        toRational(): Rational;
    };
    EulerNumber: (options?: FloatOptions) => Float;
    Log2: (options?: FloatOptions) => {
        mpfr_t: number;
        precisionBits: number;
        rndMode: number;
        radix: number;
        type: string;
        readonly options: FloatOptions;
        readonly setOptions: FloatOptions;
        /** Returns the sum of this number and the given one. */
        add(val: AllTypes): Float;
        /** Returns the difference of this number and the given one. */
        sub(val: AllTypes): Float;
        /** Returns the product of this number and the given one. */
        mul(val: AllTypes): Float;
        /** Returns the result of the division of this number by the given one. */
        div(val: AllTypes): Float;
        /** Returns the square root. */
        sqrt(): Float;
        /** Returns the reciprocal square root. */
        invSqrt(): Float;
        /** Returns the cube root. */
        cbrt(): Float;
        /** Returns the n-th root. */
        nthRoot(nth: number): Float;
        /** Returns the number with inverted sign. */
        neg(): Float;
        /** Returns the absolute value. */
        abs(): Float;
        /** Returns the factorial */
        factorial(): Float;
        /** Returns true if the number is an integer */
        isInteger(): boolean;
        /** Returns true if the number is zero */
        isZero(): boolean;
        /** Returns true if the number is a regular number (i.e., neither NaN, nor an infinity nor zero) */
        isRegular(): boolean;
        /** Return true if the number is an ordinary number (i.e., neither NaN nor an infinity) */
        isNumber(): boolean;
        /** Returns true if the number is an infinity */
        isInfinite(): boolean;
        /** Returns true if the number is NaN */
        isNaN(): boolean;
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
        /** Returns the natural logarithm */
        ln(): Float;
        /** Returns the base 2 logarithm */
        log2(): Float;
        /** Returns the base 10 logarithm */
        log10(): Float;
        /** Returns the exponential (e^x) */
        exp(): Float;
        /** Returns 2 to the power of current number (2^x) */
        exp2(): Float;
        /** Returns 10 to the power of current number (10^x) */
        exp10(): Float;
        /** Returns this number exponentiated to the given value. */
        pow(val: Float | number): Float;
        /** Returns the sine */
        sin(): Float;
        /** Returns the cosine */
        cos(): Float;
        /** Returns the tangent */
        tan(): Float;
        /** Returns the secant */
        sec(): Float;
        /** Returns the cosecant */
        csc(): Float;
        /** Returns the cotangent */
        cot(): Float;
        /** Returns the arc-cosine */
        acos(): Float;
        /** Returns the arc-sine */
        asin(): Float;
        /** Returns the arc-tangent */
        atan(): Float;
        /** Returns the hyperbolic sine */
        sinh(): Float;
        /** Returns the hyperbolic cosine */
        cosh(): Float;
        /** Returns the hyperbolic tangent */
        tanh(): Float;
        /** Returns the hyperbolic secant */
        sech(): Float;
        /** Returns the hyperbolic cosecant */
        csch(): Float;
        /** Returns the hyperbolic cotangent */
        coth(): Float;
        /** Returns the inverse hyperbolic cosine */
        acosh(): Float;
        /** Returns the inverse hyperbolic sine */
        asinh(): Float;
        /** Returns the inverse hyperbolic tangent */
        atanh(): Float;
        /** Calculate exponential integral */
        eint(): Float;
        /** Calculate the real part of the dilogarithm (the integral of -log(1-t)/t from 0 to op) */
        li2(): Float;
        /** Calculate the value of the Gamma function. */
        gamma(): Float;
        /** Calculate the value of the logarithm of the absolute value of the Gamma function */
        lngamma(): Float;
        /** Calculate the value of the Digamma (sometimes also called Psi) function */
        digamma(): Float;
        /** Calculate the value of the Beta function */
        beta(op2: Float): Float;
        /** Calculate the value of the Riemann Zeta function */
        zeta(): Float;
        /** Calculate the value of the error function */
        erf(): Float;
        /** Calculate the value of the complementary error function */
        erfc(): Float;
        /** Calculate the value of the first kind Bessel function of order 0 */
        j0(): Float;
        /** Calculate the value of the first kind Bessel function of order 1 */
        j1(): Float;
        /** Calculate the value of the first kind Bessel function of order n */
        jn(n: number): Float;
        /** Calculate the value of the second kind Bessel function of order 0 */
        y0(): Float;
        /** Calculate the value of the second kind Bessel function of order 1 */
        y1(): Float;
        /** Calculate the value of the second kind Bessel function of order n */
        yn(n: number): Float;
        /** Calculate the arithmetic-geometric mean */
        agm(op2: Float): Float;
        /** Calculate the value of the Airy function Ai on x */
        ai(): Float;
        /** Returns the sign of the current value (-1 or 0 or 1) */
        sign(): -1 | 0 | 1;
        /** Converts current value into a JavaScript number */
        toNumber(): number;
        /** Rounds to the next higher or equal representable integer */
        ceil(): Float;
        /** Rounds to the next lower or equal representable integer */
        floor(): Float;
        /** Rounds to the nearest representable integer, rounding halfway cases away from zero */
        round(): Float;
        /** Rounds to the nearest representable integer, rounding halfway cases with the even-rounding rule */
        roundEven(): Float;
        /** Rounds to the next representable integer toward zero */
        trunc(): Float;
        /** Round to precision */
        roundTo(prec: number): Float;
        /** Returns the fractional part */
        frac(): Float;
        /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded toward zero */
        fmod(y: Float): Float;
        /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded to the nearest integer (ties rounded to even) */
        remainder(y: Float): Float;
        /** Return next value towards +∞ */
        nextAbove(): Float;
        /** Return next value towards -∞ */
        nextBelow(): Float;
        /** Returns the exponent of x, assuming that x is a non-zero ordinary number and the significand is considered in [1/2, 1). */
        exponent(): number;
        /** Converts the number to string */
        toString(radix?: number): string;
        /** Formats the number using fixed-point notation */
        toFixed(digits?: number, radix?: number): string;
        /** Converts the number to an integer */
        toInteger(): Integer;
        /** Get error intervals */
        toInterval(): [Float, Float];
        /** Converts the number to a rational number */
        toRational(): Rational;
    };
    Catalan: (options?: FloatOptions) => {
        mpfr_t: number;
        precisionBits: number;
        rndMode: number;
        radix: number;
        type: string;
        readonly options: FloatOptions;
        readonly setOptions: FloatOptions;
        /** Returns the sum of this number and the given one. */
        add(val: AllTypes): Float;
        /** Returns the difference of this number and the given one. */
        sub(val: AllTypes): Float;
        /** Returns the product of this number and the given one. */
        mul(val: AllTypes): Float;
        /** Returns the result of the division of this number by the given one. */
        div(val: AllTypes): Float;
        /** Returns the square root. */
        sqrt(): Float;
        /** Returns the reciprocal square root. */
        invSqrt(): Float;
        /** Returns the cube root. */
        cbrt(): Float;
        /** Returns the n-th root. */
        nthRoot(nth: number): Float;
        /** Returns the number with inverted sign. */
        neg(): Float;
        /** Returns the absolute value. */
        abs(): Float;
        /** Returns the factorial */
        factorial(): Float;
        /** Returns true if the number is an integer */
        isInteger(): boolean;
        /** Returns true if the number is zero */
        isZero(): boolean;
        /** Returns true if the number is a regular number (i.e., neither NaN, nor an infinity nor zero) */
        isRegular(): boolean;
        /** Return true if the number is an ordinary number (i.e., neither NaN nor an infinity) */
        isNumber(): boolean;
        /** Returns true if the number is an infinity */
        isInfinite(): boolean;
        /** Returns true if the number is NaN */
        isNaN(): boolean;
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
        /** Returns the natural logarithm */
        ln(): Float;
        /** Returns the base 2 logarithm */
        log2(): Float;
        /** Returns the base 10 logarithm */
        log10(): Float;
        /** Returns the exponential (e^x) */
        exp(): Float;
        /** Returns 2 to the power of current number (2^x) */
        exp2(): Float;
        /** Returns 10 to the power of current number (10^x) */
        exp10(): Float;
        /** Returns this number exponentiated to the given value. */
        pow(val: Float | number): Float;
        /** Returns the sine */
        sin(): Float;
        /** Returns the cosine */
        cos(): Float;
        /** Returns the tangent */
        tan(): Float;
        /** Returns the secant */
        sec(): Float;
        /** Returns the cosecant */
        csc(): Float;
        /** Returns the cotangent */
        cot(): Float;
        /** Returns the arc-cosine */
        acos(): Float;
        /** Returns the arc-sine */
        asin(): Float;
        /** Returns the arc-tangent */
        atan(): Float;
        /** Returns the hyperbolic sine */
        sinh(): Float;
        /** Returns the hyperbolic cosine */
        cosh(): Float;
        /** Returns the hyperbolic tangent */
        tanh(): Float;
        /** Returns the hyperbolic secant */
        sech(): Float;
        /** Returns the hyperbolic cosecant */
        csch(): Float;
        /** Returns the hyperbolic cotangent */
        coth(): Float;
        /** Returns the inverse hyperbolic cosine */
        acosh(): Float;
        /** Returns the inverse hyperbolic sine */
        asinh(): Float;
        /** Returns the inverse hyperbolic tangent */
        atanh(): Float;
        /** Calculate exponential integral */
        eint(): Float;
        /** Calculate the real part of the dilogarithm (the integral of -log(1-t)/t from 0 to op) */
        li2(): Float;
        /** Calculate the value of the Gamma function. */
        gamma(): Float;
        /** Calculate the value of the logarithm of the absolute value of the Gamma function */
        lngamma(): Float;
        /** Calculate the value of the Digamma (sometimes also called Psi) function */
        digamma(): Float;
        /** Calculate the value of the Beta function */
        beta(op2: Float): Float;
        /** Calculate the value of the Riemann Zeta function */
        zeta(): Float;
        /** Calculate the value of the error function */
        erf(): Float;
        /** Calculate the value of the complementary error function */
        erfc(): Float;
        /** Calculate the value of the first kind Bessel function of order 0 */
        j0(): Float;
        /** Calculate the value of the first kind Bessel function of order 1 */
        j1(): Float;
        /** Calculate the value of the first kind Bessel function of order n */
        jn(n: number): Float;
        /** Calculate the value of the second kind Bessel function of order 0 */
        y0(): Float;
        /** Calculate the value of the second kind Bessel function of order 1 */
        y1(): Float;
        /** Calculate the value of the second kind Bessel function of order n */
        yn(n: number): Float;
        /** Calculate the arithmetic-geometric mean */
        agm(op2: Float): Float;
        /** Calculate the value of the Airy function Ai on x */
        ai(): Float;
        /** Returns the sign of the current value (-1 or 0 or 1) */
        sign(): -1 | 0 | 1;
        /** Converts current value into a JavaScript number */
        toNumber(): number;
        /** Rounds to the next higher or equal representable integer */
        ceil(): Float;
        /** Rounds to the next lower or equal representable integer */
        floor(): Float;
        /** Rounds to the nearest representable integer, rounding halfway cases away from zero */
        round(): Float;
        /** Rounds to the nearest representable integer, rounding halfway cases with the even-rounding rule */
        roundEven(): Float;
        /** Rounds to the next representable integer toward zero */
        trunc(): Float;
        /** Round to precision */
        roundTo(prec: number): Float;
        /** Returns the fractional part */
        frac(): Float;
        /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded toward zero */
        fmod(y: Float): Float;
        /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded to the nearest integer (ties rounded to even) */
        remainder(y: Float): Float;
        /** Return next value towards +∞ */
        nextAbove(): Float;
        /** Return next value towards -∞ */
        nextBelow(): Float;
        /** Returns the exponent of x, assuming that x is a non-zero ordinary number and the significand is considered in [1/2, 1). */
        exponent(): number;
        /** Converts the number to string */
        toString(radix?: number): string;
        /** Formats the number using fixed-point notation */
        toFixed(digits?: number, radix?: number): string;
        /** Converts the number to an integer */
        toInteger(): Integer;
        /** Get error intervals */
        toInterval(): [Float, Float];
        /** Converts the number to a rational number */
        toRational(): Rational;
    };
    destroy: () => void;
};
export {};
