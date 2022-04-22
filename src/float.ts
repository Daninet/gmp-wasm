import { mpfr_rnd_t } from './bindingTypes';
import { GMPFunctions } from './functions';
import { Integer } from './integer';
import { Rational } from './rational';
import { assertInt32, assertUint32, assertValidRadix, FLOAT_SPECIAL_VALUES, isInt32 } from './util';

type FloatFactoryReturn = ReturnType<typeof getFloatContext>['Float'];
export interface FloatFactory extends FloatFactoryReturn {};
type FloatReturn = ReturnType<FloatFactoryReturn>;
export interface Float extends FloatReturn {};

// these should not be exported
type AllTypes = Integer | Rational | Float | string | number;

// matches mpfr_rnd_t
/** Represents the different rounding modes. */
export enum FloatRoundingMode {
  /** Round to nearest, with ties to even. MPFR_RNDN */
  ROUND_NEAREST = 0,
  /** Round toward zero. MPFR_RNDZ */
  ROUND_TO_ZERO = 1,
  /** Round toward +Infinity. MPFR_RNDU */
  ROUND_UP = 2,
  /** Round toward -Infinity. MPFR_RNDD */
  ROUND_DOWN = 3,
  /** Round away from zero. MPFR_RNDA */
  ROUND_FROM_ZERO = 4,
  // /** (Experimental) Faithful rounding. MPFR_RNDF */
  // ROUND_FAITHFUL = 5,
  // /** (Experimental) Round to nearest, with ties away from zero. MPFR_RNDNA */
  // ROUND_TO_NEAREST_AWAY_FROM_ZERO = -1,
};
export interface FloatOptions {
  precisionBits?: number;
  roundingMode?: FloatRoundingMode;
  radix?: number;
};

const INVALID_PARAMETER_ERROR = 'Invalid parameter!';

export function getFloatContext(gmp: GMPFunctions, ctx: any, ctxOptions?: FloatOptions) {
  const mpfr_t_arr: number[] = [];

  const isInteger = (val): boolean => ctx.intContext.isInteger(val);
  const isRational = (val): boolean => ctx.rationalContext.isRational(val);
  const isFloat = (val): boolean => ctx.floatContext.isFloat(val);

  const globalRndMode = (ctxOptions.roundingMode ?? FloatRoundingMode.ROUND_NEAREST) as number as mpfr_rnd_t;
  const globalPrecisionBits = ctxOptions.precisionBits ?? 52;
  const globalRadix = ctxOptions.radix ?? 10;

  assertUint32(globalPrecisionBits);
  assertValidRadix(globalRadix);

  const compare = (mpfr_t: number, val: AllTypes): number => {
    if (typeof val === 'number') {
      assertInt32(val);
      return gmp.mpfr_cmp_si(mpfr_t, val);
    }
    if (typeof val === 'string') {
      const f = FloatFn(val, ctxOptions);
      return gmp.mpfr_cmp(mpfr_t, f.mpfr_t);
    }
    if (isInteger(val)) {
      return gmp.mpfr_cmp_z(mpfr_t, (val as Integer).mpz_t);
    }
    if (isRational(val)) {
      return gmp.mpfr_cmp_q(mpfr_t, (val as Rational).mpq_t);
    }
    if (isFloat(val)) {
      return gmp.mpfr_cmp(mpfr_t, (val as Float).mpfr_t);
    }
    throw new Error(INVALID_PARAMETER_ERROR);
  }

  const mergeFloatOptions = (options1: FloatOptions, options2: FloatOptions): FloatOptions => {
    const precisionBits1 = options1?.precisionBits ?? globalPrecisionBits;
    const precisionBits2 = options2?.precisionBits ?? globalPrecisionBits;

    return {
      precisionBits: Math.max(precisionBits1, precisionBits2),
      roundingMode: options2?.roundingMode ?? options1.roundingMode ?? ctxOptions.roundingMode,
      radix: options2?.radix ?? options1.radix ?? ctxOptions.radix,
    };
  };

  const FloatPrototype = {
    mpfr_t: 0,
    precisionBits: -1,
    rndMode: -1,
    radix: -1,
    type: 'float',

    get options(): FloatOptions {
      return {
        precisionBits: this.precisionBits ?? globalPrecisionBits,
        roundingMode: this.rndMode ?? globalRndMode,
        radix: this.radix ?? globalRadix,
      };
    },

    get setOptions(): FloatOptions {
      return {
        precisionBits: this.precisionBits,
        roundingMode: this.rndMode,
        radix: this.radix,
      };
    },

    /** Returns the sum of this number and the given one. */
    add(val: AllTypes): Float {
      if (typeof val === 'number') {
        const n = FloatFn(null, this.options);
        gmp.mpfr_add_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        return n;
      }
      if (typeof val === 'string') {
        const n = FloatFn(val, this.options);
        gmp.mpfr_add(n.mpfr_t, this.mpfr_t, n.mpfr_t, this.rndMode);
        return n;
      }
      if (isFloat(val)) {
        const n = FloatFn(null, mergeFloatOptions(this.setOptions, (val as Float).setOptions));
        gmp.mpfr_add(n.mpfr_t, this.mpfr_t, (val as Float).mpfr_t, this.rndMode);
        return n;
      }
      if (isRational(val)) {
        const n = FloatFn(null, this.options);
        gmp.mpfr_add_q(n.mpfr_t, this.mpfr_t, (val as Rational).mpq_t, this.rndMode);
        return n;
      }
      if (isInteger(val)) {
        const n = FloatFn(null, this.options);
        gmp.mpfr_add_z(n.mpfr_t, this.mpfr_t, (val as Integer).mpz_t, this.rndMode);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the difference of this number and the given one. */
    sub(val: AllTypes): Float {
      if (typeof val === 'number') {
        const n = FloatFn(null, this.options);
        gmp.mpfr_sub_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        return n;
      }
      if (typeof val === 'string') {
        const n = FloatFn(val, this.options);
        gmp.mpfr_sub(n.mpfr_t, this.mpfr_t, n.mpfr_t, this.rndMode);
        return n;
      }
      if (isFloat(val)) {
        const n = FloatFn(null, mergeFloatOptions(this.setOptions, (val as Float).setOptions));
        gmp.mpfr_sub(n.mpfr_t, this.mpfr_t, (val as Float).mpfr_t, this.rndMode);
        return n;
      }
      if (isRational(val)) {
        const n = FloatFn(null, this.options);
        gmp.mpfr_sub_q(n.mpfr_t, this.mpfr_t, (val as Rational).mpq_t, this.rndMode);
        return n;
      }
      if (isInteger(val)) {
        const n = FloatFn(null, this.options);
        gmp.mpfr_sub_z(n.mpfr_t, this.mpfr_t, (val as Integer).mpz_t, this.rndMode);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the product of this number and the given one. */
    mul(val: AllTypes): Float {
      if (typeof val === 'number') {
        const n = FloatFn(null, this.options);
        if (isInt32(val)) {
          gmp.mpfr_mul_si(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        } else {
          gmp.mpfr_mul_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        }
        return n;
      }
      if (typeof val === 'string') {
        const n = FloatFn(val, this.options);
        gmp.mpfr_mul(n.mpfr_t, this.mpfr_t, n.mpfr_t, this.rndMode);
        return n;
      }
      if (isFloat(val)) {
        const n = FloatFn(null, mergeFloatOptions(this.setOptions, (val as Float).setOptions));
        gmp.mpfr_mul(n.mpfr_t, this.mpfr_t, (val as Float).mpfr_t, this.rndMode);
        return n;
      }
      if (isRational(val)) {
        const n = FloatFn(null, this.options);
        gmp.mpfr_mul_q(n.mpfr_t, this.mpfr_t, (val as Rational).mpq_t, this.rndMode);
        return n;
      }
      if (isInteger(val)) {
        const n = FloatFn(null, this.options);
        gmp.mpfr_mul_z(n.mpfr_t, this.mpfr_t, (val as Integer).mpz_t, this.rndMode);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the result of the division of this number by the given one. */
    div(val: AllTypes): Float {
      if (typeof val === 'number') {
        const n = FloatFn(null, this.options);
        gmp.mpfr_div_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        return n;
      }
      if (typeof val === 'string') {
        const n = FloatFn(val, this.options);
        gmp.mpfr_div(n.mpfr_t, this.mpfr_t, n.mpfr_t, this.rndMode);
        return n;
      }
      if (isFloat(val)) {
        const n = FloatFn(null, mergeFloatOptions(this.setOptions, (val as Float).setOptions));
        gmp.mpfr_div(n.mpfr_t, this.mpfr_t, (val as Float).mpfr_t, this.rndMode);
        return n;
      }
      if (isRational(val)) {
        const n = FloatFn(null, this.options);
        gmp.mpfr_div_q(n.mpfr_t, this.mpfr_t, (val as Rational).mpq_t, this.rndMode);
        return n;
      }
      if (isInteger(val)) {
        const n = FloatFn(null, this.options);
        gmp.mpfr_div_z(n.mpfr_t, this.mpfr_t, (val as Integer).mpz_t, this.rndMode);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the square root. */
    sqrt(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_sqrt(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the reciprocal square root. */
    invSqrt(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_rec_sqrt(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the cube root. */
    cbrt(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_cbrt(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the n-th root. */
    nthRoot(nth: number): Float {
      const n = FloatFn(null, this.options);
      assertUint32(nth);
      gmp.mpfr_rootn_ui(n.mpfr_t, this.mpfr_t, nth, this.rndMode);
      return n;
    },

    /** Returns the number with inverted sign. */
    neg(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_neg(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the absolute value. */
    abs(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_abs(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the factorial */
    factorial(): Float {
      const n = FloatFn(null, this.options);
      if (gmp.mpfr_fits_uint_p(this.mpfr_t, this.rndMode) === 0) {
        throw new Error('Invalid value for factorial()');
      }
      const value = gmp.mpfr_get_ui(this.mpfr_t, this.rndMode);
      gmp.mpfr_fac_ui(n.mpfr_t, value, this.rndMode);
      return n;
    },

    /** Returns true if the number is an integer */
    isInteger(): boolean {
      return gmp.mpfr_integer_p(this.mpfr_t) !== 0;
    },

    /** Returns true if the number is zero */
    isZero(): boolean {
      return gmp.mpfr_zero_p(this.mpfr_t) !== 0;
    },

    /** Returns true if the number is a regular number (i.e., neither NaN, nor an infinity nor zero) */
    isRegular(): boolean {
      return gmp.mpfr_regular_p(this.mpfr_t) !== 0;
    },

    /** Return true if the number is an ordinary number (i.e., neither NaN nor an infinity) */
    isNumber(): boolean {
      return gmp.mpfr_number_p(this.mpfr_t) !== 0;
    },

    /** Returns true if the number is an infinity */
    isInfinite(): boolean {
      return gmp.mpfr_inf_p(this.mpfr_t) !== 0;
    },

    /** Returns true if the number is NaN */
    isNaN(): boolean {
      return gmp.mpfr_nan_p(this.mpfr_t) !== 0;
    },

    /** Returns true if the current number is equal to the provided number */
    isEqual(val: AllTypes): boolean {
      return compare(this.mpfr_t, val) === 0;
    },

    /** Returns true if the current number is less than the provided number */
    lessThan(val: AllTypes): boolean {
      return compare(this.mpfr_t, val) < 0;
    },
    
    /** Returns true if the current number is less than or equal to the provided number */
    lessOrEqual(val: AllTypes): boolean {
      return compare(this.mpfr_t, val) <= 0;
    },
    
    /** Returns true if the current number is greater than the provided number */
    greaterThan(val: AllTypes): boolean {
      return compare(this.mpfr_t, val) > 0;
    },
    
    /** Returns true if the current number is greater than or equal to the provided number */
    greaterOrEqual(val: AllTypes): boolean {
      return compare(this.mpfr_t, val) >= 0;
    },

    /** Returns the natural logarithm */
    ln(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_log(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the base 2 logarithm */
    log2(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_log2(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the base 10 logarithm */
    log10(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_log10(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the exponential (e^x) */
    exp(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_exp(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns 2 to the power of current number (2^x) */
    exp2(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_exp2(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns 10 to the power of current number (10^x) */
    exp10(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_exp10(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns this number exponentiated to the given value. */
    pow(val: Float | number): Float {
      const n = FloatFn(null, this.options);
      if (typeof val === 'number') {
        if (isInt32(val)) {
          gmp.mpfr_pow_si(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        } else {
          gmp.mpfr_pow(n.mpfr_t, this.mpfr_t, FloatFn(val).mpfr_t, this.rndMode);
        }
      } else {
        gmp.mpfr_pow(n.mpfr_t, this.mpfr_t, val.mpfr_t, this.rndMode);
      }
      return n;
    },

    /** Returns the sine */
    sin(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_sin(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the cosine */
    cos(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_cos(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the tangent */
    tan(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_tan(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the secant */
    sec(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_sec(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the cosecant */
    csc(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_csc(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the cotangent */
    cot(): Float{
      const n = FloatFn(null, this.options);
      gmp.mpfr_cot(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the arc-cosine */
    acos(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_acos(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the arc-sine */
    asin(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_asin(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the arc-tangent */
    atan(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_atan(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the hyperbolic sine */
    sinh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_sinh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the hyperbolic cosine */
    cosh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_cosh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the hyperbolic tangent */
    tanh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_tanh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the hyperbolic secant */
    sech(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_sech(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the hyperbolic cosecant */
    csch(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_csch(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the hyperbolic cotangent */
    coth(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_coth(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the inverse hyperbolic cosine */
    acosh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_acosh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the inverse hyperbolic sine */
    asinh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_asinh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the inverse hyperbolic tangent */
    atanh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_atanh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate exponential integral */
    eint(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_eint(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the real part of the dilogarithm (the integral of -log(1-t)/t from 0 to op) */
    li2(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_li2(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the Gamma function. */
    gamma(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_gamma(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the logarithm of the absolute value of the Gamma function */
    lngamma(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_lngamma(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the Digamma (sometimes also called Psi) function */
    digamma(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_digamma(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the Beta function */
    beta(op2: Float): Float {
      if (!isFloat(op2)) {
        throw new Error('Only floats parameters are supported!');
      }
      const n = FloatFn(null, this.options);
      gmp.mpfr_beta(n.mpfr_t, this.mpfr_t, (op2 as Float).mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the Riemann Zeta function */
    zeta(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_zeta(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the error function */
    erf(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_erf(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the complementary error function */
    erfc(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_erfc(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the first kind Bessel function of order 0 */
    j0(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_j0(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the first kind Bessel function of order 1 */
    j1(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_j1(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the first kind Bessel function of order n */
    jn(n: number): Float {
      assertInt32(n);
      const rop = FloatFn(null, this.options);
      gmp.mpfr_jn(rop.mpfr_t, n, this.mpfr_t, this.rndMode);
      return rop;
    },

    /** Calculate the value of the second kind Bessel function of order 0 */
    y0(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_y0(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the second kind Bessel function of order 1 */
    y1(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_y1(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the second kind Bessel function of order n */
    yn(n: number): Float {
      assertInt32(n);
      const rop = FloatFn(null, this.options);
      gmp.mpfr_yn(rop.mpfr_t, n, this.mpfr_t, this.rndMode);
      return rop;
    },

    /** Calculate the arithmetic-geometric mean */
    agm(op2: Float): Float {
      if (!isFloat(op2)) {
        throw new Error('Only floats parameters are supported!');
      }
      const n = FloatFn(null, this.options);
      gmp.mpfr_agm(n.mpfr_t, this.mpfr_t, (op2 as Float).mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of the Airy function Ai on x */
    ai(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_ai(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Returns the sign of the current value (-1 or 0 or 1) */
    sign(): -1 | 0 | 1 {
      return gmp.mpfr_sgn(this.mpfr_t) as -1 | 0 | 1;
    },

    /** Converts current value into a JavaScript number */
    toNumber(): number {
      return gmp.mpfr_get_d(this.mpfr_t, this.rndMode);
    },

    /** Rounds to the next higher or equal representable integer */
    ceil(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_ceil(n.mpfr_t, this.mpfr_t);
      return n;
    },

    /** Rounds to the next lower or equal representable integer */
    floor(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_floor(n.mpfr_t, this.mpfr_t);
      return n;
    },

    /** Rounds to the nearest representable integer, rounding halfway cases away from zero */
    round(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_round(n.mpfr_t, this.mpfr_t);
      return n;
    },

    /** Rounds to the nearest representable integer, rounding halfway cases with the even-rounding rule */
    roundEven(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_roundeven(n.mpfr_t, this.mpfr_t);
      return n;
    },

    /** Rounds to the next representable integer toward zero */
    trunc(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_trunc(n.mpfr_t, this.mpfr_t);
      return n;
    },

    /** Round to precision */
    roundTo(prec: number): Float {
      assertUint32(prec);
      const n = FloatFn(this, this.options);
      gmp.mpfr_prec_round(this.mpfr_t, prec, this.rndMode);
      return n;
    },

    /** Returns the fractional part */
    frac(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_frac(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded toward zero */
    fmod(y: Float): Float {
      if (!isFloat(y)) {
        throw new Error('Only floats parameters are supported!');
      }
      const n = FloatFn(null, this.options);
      gmp.mpfr_fmod(n.mpfr_t, this.mpfr_t, (y as Float).mpfr_t, this.rndMode);
      return n;
    },

    /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded to the nearest integer (ties rounded to even) */
    remainder(y: Float): Float {
      if (!isFloat(y)) {
        throw new Error('Only floats parameters are supported!');
      }
      const n = FloatFn(null, this.options);
      gmp.mpfr_remainder(n.mpfr_t, this.mpfr_t, (y as Float).mpfr_t, this.rndMode);
      return n;
    },

    /** Return next value towards +∞ */
    nextAbove(): Float {
      const n = FloatFn(this, this.options);
      gmp.mpfr_nextabove(n.mpfr_t);
      return n;
    },

    /** Return next value towards -∞ */
    nextBelow(): Float {
      const n = FloatFn(this, this.options);
      gmp.mpfr_nextbelow(n.mpfr_t);
      return n;
    },

    /** Returns the exponent of x, assuming that x is a non-zero ordinary number and the significand is considered in [1/2, 1). */
    exponent(): number {
      return gmp.mpfr_get_exp(this.mpfr_t);
    },

    /** Converts the number to string */
    toString(radix?: number): string {
      radix = radix ?? this.options.radix;
      assertValidRadix(radix);

      const str = gmp.mpfr_to_string(this.mpfr_t, radix, this.rndMode);
      return str;
    },

    /** Formats the number using fixed-point notation */
    toFixed(digits = 0, radix?: number): string {
      assertUint32(digits);
      radix = radix ?? this.options.radix;
      assertValidRadix(radix);

      const str = this.toString(radix);
      if (Object.values(FLOAT_SPECIAL_VALUES).includes(str)) {
        return str;
      }
      if (digits === 0) {
        return ctx.intContext.Integer(this).toString(radix);
      }

      let multiplier = null;
      if (radix === 2) {
        multiplier = FloatFn(digits).exp2();
      } else if (radix === 10) {
        multiplier = FloatFn(digits).exp10();
      } else {
        multiplier = FloatFn(radix).pow(digits);
      }
      const multiplied = this.mul(multiplier);
      const int = ctx.intContext.Integer(multiplied);
      const isNegative = int.sign() === -1;
      let intStr = int.abs().toString(radix);
      if (intStr.length < digits + 1) {
        intStr = '0'.repeat(digits + 1 - intStr.length) + intStr;
      }
      return `${isNegative ? '-' : ''}${intStr.slice(0, -digits)}.${intStr.slice(-digits)}`;
    },

    /** Converts the number to an integer */
    toInteger(): Integer {
      return ctx.intContext.Integer(this);
    },

    /** Converts the number to a rational number */
    toRational(): Rational {
      return ctx.rationalContext.Rational(this);
    },
  };

  const setValue = (mpfr_t: number, rndMode: mpfr_rnd_t, radix: number, val: string | number | Float | Rational | Integer) => {
    if (typeof val === 'string') {
      const res =  gmp.mpfr_set_string(mpfr_t, val, radix, rndMode);
      if (res !== 0) {
        throw new Error('Invalid number provided!');
      }
      return;
    }
    if (typeof val === 'number') {
      if (isInt32(val)) {
        gmp.mpfr_set_si(mpfr_t, val, rndMode);
        if (Object.is(val, -0)) {
          gmp.mpfr_neg(mpfr_t, mpfr_t, rndMode);
        }
      } else {
        gmp.mpfr_set_d(mpfr_t, val, rndMode);
      }
      return;
    }
    if (isFloat(val)) {
      gmp.mpfr_set(mpfr_t, (val as Float).mpfr_t, rndMode);
      return;
    }
    if (isRational(val)) {
      gmp.mpfr_set_q(mpfr_t, (val as Rational).mpq_t, rndMode);
      return;
    }
    if (isInteger(val)) {
      gmp.mpfr_set_z(mpfr_t, (val as Integer).mpz_t, rndMode);
      return;
    }
    throw new Error(INVALID_PARAMETER_ERROR);
  };

  const FloatFn = (val?: null | undefined | string | number | Float | Rational | Integer, options?: FloatOptions) => {
    const rndMode = (options?.roundingMode ?? globalRndMode) as number as mpfr_rnd_t;
    const precisionBits = options?.precisionBits ?? globalPrecisionBits;
    const radix = options?.radix ?? globalRadix;
    assertValidRadix(radix);

    const instance = Object.create(FloatPrototype) as typeof FloatPrototype;
    instance.rndMode = rndMode;
    instance.precisionBits = precisionBits;
    instance.radix = radix;
    instance.mpfr_t = gmp.mpfr_t();
    gmp.mpfr_init2(instance.mpfr_t, precisionBits);

    if (val !== undefined && val !== null) {
      setValue(instance.mpfr_t, rndMode, radix, val);
    }

    mpfr_t_arr.push(instance.mpfr_t);
    return instance;
  };

  return {
    Float: FloatFn,
    isFloat: (val) => FloatPrototype.isPrototypeOf(val),

    Pi: (options?: FloatOptions) => {
      const n = FloatFn(null, options);
      gmp.mpfr_const_pi(n.mpfr_t, (options?.roundingMode ?? globalRndMode)  as mpfr_rnd_t);
      return n;
    },

    EulerConstant: (options?: FloatOptions) => {
      const n = FloatFn(null, options);
      gmp.mpfr_const_euler(n.mpfr_t, (options?.roundingMode ?? globalRndMode)  as mpfr_rnd_t);
      return n;
    },

    EulerNumber: (options?: FloatOptions) => {
      return FloatFn(1, options).exp();
    },

    Log2: (options?: FloatOptions) => {
      const n = FloatFn(null, options);
      gmp.mpfr_const_log2(n.mpfr_t, (options?.roundingMode ?? globalRndMode)  as mpfr_rnd_t);
      return n;
    },

    Catalan: (options?: FloatOptions) => {
      const n = FloatFn(null, options);
      gmp.mpfr_const_catalan(n.mpfr_t, (options?.roundingMode ?? globalRndMode)  as mpfr_rnd_t);
      return n;
    },

    destroy: () => {
      for (let i = mpfr_t_arr.length - 1; i >= 0; i--) {
        gmp.mpfr_clear(mpfr_t_arr[i]);
        gmp.mpfr_t_free(mpfr_t_arr[i]);
      }
      mpfr_t_arr.length = 0;
    }
  };
};
