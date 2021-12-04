import type { GMPFunctions, mpfr_rnd_t } from './functions';
import { Integer } from './integer';
import { Rational } from './rational';
import { assertInt32, assertUint32, isInt32 } from './util';

const decoder = new TextDecoder();

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

const SPECIAL_VALUES = {
  '@NaN@': 'NaN',
  '@Inf@': 'Infinity',
  '-@Inf@': '-Infinity',
} as const;

const SPECIAL_VALUE_KEYS = Object.keys(SPECIAL_VALUES);

export interface FloatOptions {
  precisionBits?: number;
  roundingMode?: FloatRoundingMode;
};

const trimTrailingZeros = (num: string) => {
  let pos = num.length - 1;
  while (pos >= 0) {
    if (num[pos] === '.') {
      pos--;
      break;
    } else if (num[pos] === '0') {
      pos--;
    } else {
      break;
    }
  }

  if (pos !== num.length - 1) {
    return num.slice(0, pos + 1);
  }

  if (num.length === 0) {
    return '0';
  }

  return num;
};

const insertDecimalPoint = (mantissa: string, pointPos: number) => {
  const isNegative = mantissa.startsWith('-');

  const mantissaWithoutSign = isNegative ? mantissa.slice(1) : mantissa;
  const sign = isNegative ? '-' : '';
  let hasDecimalPoint = false;

  if (pointPos <= 0) {
    const zeros = '0'.repeat(-pointPos);
    mantissa = `${sign}0.${zeros}${mantissaWithoutSign}`;
    hasDecimalPoint = true;
  } else if (pointPos < mantissaWithoutSign.length) {
    mantissa = `${sign}${mantissaWithoutSign.slice(0, pointPos)}.${mantissaWithoutSign.slice(pointPos)}`;
    hasDecimalPoint = true;
  } else {
    const zeros = '0'.repeat(pointPos - mantissaWithoutSign.length);
    mantissa = `${mantissa}${zeros}`;
  }

  // trim trailing zeros after decimal point
  if (hasDecimalPoint) {
    mantissa = trimTrailingZeros(mantissa);
  }
  return mantissa;
}

const INVALID_PARAMETER_ERROR = 'Invalid parameter!';

export function getFloatContext(gmp: GMPFunctions, ctx: any, ctxOptions?: FloatOptions) {
  const mpfr_t_arr: number[] = [];

  const isInteger = (val): boolean => ctx.intContext.isInteger(val);
  const isRational = (val): boolean => ctx.rationalContext.isRational(val);
  const isFloat = (val): boolean => ctx.floatContext.isFloat(val);

  const globalRndMode = (ctxOptions.roundingMode ?? FloatRoundingMode.ROUND_NEAREST) as number as mpfr_rnd_t;
  const globalPrecisionBits = ctxOptions.precisionBits ?? 52;
  assertUint32(globalPrecisionBits);

  const compare = (mpfr_t: number, val: AllTypes): number => {
    if (typeof val === 'number') {
      assertInt32(val);
      return gmp.mpfr_cmp_si(mpfr_t, val);
    }
    if (typeof val === 'string') {
      const f = FloatFn(val);
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
    };
  };

  const FloatPrototype = {
    mpfr_t: 0,
    precisionBits: -1,
    rndMode: -1,
    type: 'float',

    get options(): FloatOptions {
      return {
        precisionBits: this.precisionBits ?? globalPrecisionBits,
        roundingMode: this.rndMode ?? globalRndMode,
      };
    },

    get setOptions(): FloatOptions {
      return {
        precisionBits: this.precisionBits,
        roundingMode: this.rndMode,
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

    /** Returns the integer square root number of this number. */
    sqrt(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_sqrt(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    invSqrt(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_rec_sqrt(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    cbrt(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_cbrt(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

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

    /** Returns the absolute value of this number. */
    abs(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_abs(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    factorial() {
      const n = FloatFn(null, this.options);
      if (gmp.mpfr_fits_uint_p(this.mpfr_t, this.rndMode) === 0) {
        throw new Error('Invalid value for factorial()');
      }
      const value = gmp.mpfr_get_ui(this.mpfr_t, this.rndMode);
      gmp.mpfr_fac_ui(n.mpfr_t, value, this.rndMode);
      return n;
    },

    isInteger() {
      return gmp.mpfr_integer_p(this.mpfr_t) !== 0;
    },

    isZero() {
      return gmp.mpfr_zero_p(this.mpfr_t) !== 0;
    },

    isRegular() {
      return gmp.mpfr_regular_p(this.mpfr_t) !== 0;
    },

    isNumber() {
      return gmp.mpfr_number_p(this.mpfr_t) !== 0;
    },

    isInfinite() {
      return gmp.mpfr_inf_p(this.mpfr_t) !== 0;
    },

    isNaN() {
      return gmp.mpfr_nan_p(this.mpfr_t) !== 0;
    },

    isEqual(val: AllTypes): boolean {
      return compare(this.mpfr_t, val) === 0;
    },

    lessThan(val: AllTypes): boolean {
      return compare(this.mpfr_t, val) < 0;
    },

    lessOrEqual(val: AllTypes): boolean {
      return compare(this.mpfr_t, val) <= 0;
    },

    greaterThan(val: AllTypes): boolean {
      return compare(this.mpfr_t, val) > 0;
    },

    greaterOrEqual(val: AllTypes): boolean {
      return compare(this.mpfr_t, val) >= 0;
    },

    ln(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_log(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    log2(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_log2(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    log10(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_log10(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    exp(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_exp(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    exp2(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_exp2(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

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

    sin(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_sin(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    cos(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_cos(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    tan(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_tan(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    sec(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_sec(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    csc(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_csc(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    cot(): Float{
      const n = FloatFn(null, this.options);
      gmp.mpfr_cot(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    acos(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_acos(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    asin(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_asin(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    atan(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_atan(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    sinh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_sinh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    cosh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_cosh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    tanh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_tanh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    sech(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_sech(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    csch(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_csch(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    coth(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_coth(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    acosh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_acosh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    asinh(): Float {
      const n = FloatFn(null, this.options);
      gmp.mpfr_asinh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

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

    sign() {
      return gmp.mpfr_sgn(this.mpfr_t);
    },

    toNumber() {
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

    nextAbove(): Float {
      const n = FloatFn(this, this.options);
      gmp.mpfr_nextabove(n.mpfr_t);
      return n;
    },

    nextBelow(): Float {
      const n = FloatFn(this, this.options);
      gmp.mpfr_nextbelow(n.mpfr_t);
      return n;
    },

    exponent2() {
      return gmp.mpfr_get_exp(this.mpfr_t);
    },

    toString() {
      const mpfr_exp_t_ptr = gmp.malloc(4);
      const strptr = gmp.mpfr_get_str(0, mpfr_exp_t_ptr, 10, 0, this.mpfr_t, this.rndMode);
      const endptr = gmp.mem.indexOf(0, strptr);
      let ret = decoder.decode(gmp.mem.subarray(strptr, endptr));

      if (SPECIAL_VALUE_KEYS.includes(ret)) {
        ret = SPECIAL_VALUES[ret];
      } else {
        // decimal point needs to be inserted
        const pointPos = gmp.memView.getInt32(mpfr_exp_t_ptr, true);
        ret = insertDecimalPoint(ret, pointPos);
      }

      gmp.mpfr_free_str(strptr);
      gmp.free(mpfr_exp_t_ptr);
      return ret;
    },

    toFixed(digits = 0) {
      assertUint32(digits);
      const str = this.toString();
      if (Object.values(SPECIAL_VALUES).includes(str)) {
        return str;
      }
      if (digits === 0) {
        return ctx.intContext.Integer(this).toString();
      }
      const multiplied = this.mul(FloatFn(digits).exp10());
      const int = ctx.intContext.Integer(multiplied);
      const isNegative = int.sign() === -1;
      let intStr = int.abs().toString();
      if (intStr.length < digits + 1) {
        intStr = '0'.repeat(digits + 1 - intStr.length) + intStr;
      }
      return `${isNegative ? '-' : ''}${intStr.slice(0, -digits)}.${intStr.slice(-digits)}`;
    },

    toInteger(): Integer {
      return ctx.intContext.Integer(this);
    },

    toRational(): Rational {
      return ctx.rationalContext.Rational(this);
    },
  };

  const setValue = (mpfr_t: number, rndMode: mpfr_rnd_t, val: string | number | Float | Rational | Integer) => {
    if (typeof val === 'string') {
      const strPtr = gmp.malloc_cstr(val);
      gmp.mpfr_set_str(mpfr_t, strPtr, 10, rndMode);
      gmp.free(strPtr);
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

    const instance = Object.create(FloatPrototype) as typeof FloatPrototype;
    instance.rndMode = rndMode;
    instance.precisionBits = precisionBits;
    instance.mpfr_t = gmp.mpfr_t();
    gmp.mpfr_init2(instance.mpfr_t, precisionBits);

    if (val !== undefined && val !== null) {
      setValue(instance.mpfr_t, rndMode, val);
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
