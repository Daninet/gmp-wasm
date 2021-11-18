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
type AllTypes = Integer | Rational | Float | number;

// matches mpfr_rnd_t
export enum FloatRoundingMode {
  ROUND_TO_NEAREST_TIES_TO_EVEN = 0,
  ROUND_TOWARD_ZERO = 1,
  ROUND_TOWARD_INF = 2,
  ROUND_TOWARD_NEG_INF = 3,
  ROUND_AWAY_FROM_ZERO = 4,
  ROUND_FAITHFUL = 5,
  ROUND_TO_NEAREST_AWAY_FROM_ZERO = -1,
};

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

export function getFloatContext(gmp: GMPFunctions, ctx: any, options?: FloatOptions) {
  const mpfr_t_arr: number[] = [];

  const isInteger = (val): boolean => ctx.intContext.isInteger(val);
  const isRational = (val): boolean => ctx.rationalContext.isRational(val);
  const isFloat = (val): boolean => ctx.floatContext.isFloat(val);

  const globalRndMode = (options.roundingMode ?? FloatRoundingMode.ROUND_TO_NEAREST_TIES_TO_EVEN) as number as mpfr_rnd_t;
  const globalPrecisionBits = options.precisionBits ?? 52;
  assertUint32(globalPrecisionBits);

  const compare = (mpfr_t: number, val: AllTypes): number => {
    if (typeof val === 'number') {
      assertInt32(val);
      return gmp.mpfr_cmp_si(mpfr_t, val);
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

  const FloatPrototype = {
    mpfr_t: 0,
    precisionBits: globalPrecisionBits,
    rndMode: globalRndMode,
    type: 'float',

    add(val: AllTypes): Float {
      const n = FloatFn();
      if (typeof val === 'number') {
        gmp.mpfr_add_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        return n;
      }
      if (isFloat(val)) {
        gmp.mpfr_add(n.mpfr_t, this.mpfr_t, (val as Float).mpfr_t, this.rndMode);
        return n;
      }
      if (isRational(val)) {
        gmp.mpfr_add_q(n.mpfr_t, this.mpfr_t, (val as Rational).mpq_t, this.rndMode);
        return n;
      }
      if (isInteger(val)) {
        gmp.mpfr_add_z(n.mpfr_t, this.mpfr_t, (val as Integer).mpz_t, this.rndMode);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    sub(val: AllTypes): Float {
      const n = FloatFn();
      if (typeof val === 'number') {
        gmp.mpfr_sub_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        return n;
      }
      if (isFloat(val)) {
        gmp.mpfr_sub(n.mpfr_t, this.mpfr_t, (val as Float).mpfr_t, this.rndMode);
        return n;
      }
      if (isRational(val)) {
        gmp.mpfr_sub_q(n.mpfr_t, this.mpfr_t, (val as Rational).mpq_t, this.rndMode);
        return n;
      }
      if (isInteger(val)) {
        gmp.mpfr_sub_z(n.mpfr_t, this.mpfr_t, (val as Integer).mpz_t, this.rndMode);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    mul(val: AllTypes): Float {
      const n = FloatFn();
      if (typeof val === 'number') {
        if (isInt32(val)) {
          gmp.mpfr_mul_si(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        } else {
          gmp.mpfr_mul_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        }
        return n;
      }
      if (isFloat(val)) {
        gmp.mpfr_mul(n.mpfr_t, this.mpfr_t, (val as Float).mpfr_t, this.rndMode);
        return n;
      }
      if (isRational(val)) {
        gmp.mpfr_mul_q(n.mpfr_t, this.mpfr_t, (val as Rational).mpq_t, this.rndMode);
        return n;
      }
      if (isInteger(val)) {
        gmp.mpfr_mul_z(n.mpfr_t, this.mpfr_t, (val as Integer).mpz_t, this.rndMode);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    div(val: AllTypes): Float {
      const n = FloatFn();
      if (typeof val === 'number') {
        gmp.mpfr_div_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
        return n;
      }
      if (isFloat(val)) {
        gmp.mpfr_div(n.mpfr_t, this.mpfr_t, (val as Float).mpfr_t, this.rndMode);
        return n;
      }
      if (isRational(val)) {
        gmp.mpfr_div_q(n.mpfr_t, this.mpfr_t, (val as Rational).mpq_t, this.rndMode);
        return n;
      }
      if (isInteger(val)) {
        gmp.mpfr_div_z(n.mpfr_t, this.mpfr_t, (val as Integer).mpz_t, this.rndMode);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    sqrt(): Float {
      const n = FloatFn();
      gmp.mpfr_sqrt(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    invSqrt(): Float {
      const n = FloatFn();
      gmp.mpfr_rec_sqrt(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    cbrt(): Float {
      const n = FloatFn();
      gmp.mpfr_cbrt(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    nthRoot(nth: number): Float {
      const n = FloatFn();
      assertUint32(nth);
      gmp.mpfr_rootn_ui(n.mpfr_t, this.mpfr_t, nth, this.rndMode);
      return n;
    },

    neg(): Float {
      const n = FloatFn();
      gmp.mpfr_neg(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    abs(): Float {
      const n = FloatFn();
      gmp.mpfr_abs(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    factorial() {
      const n = FloatFn();
      if (gmp.mpfr_fits_uint_p(this.mpfr_t, this.rndMode) === 0) {
        throw new Error('Invalid value for factorial()');
      }
      const value = gmp.mpfr_get_ui(this.mpfr_t, this.rndMode);
      gmp.mpfr_fac_ui(n.mpfr_t, value, this.rndMode);
      return n;
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
      const n = FloatFn();
      gmp.mpfr_log(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    log2(): Float {
      const n = FloatFn();
      gmp.mpfr_log2(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    log10(): Float {
      const n = FloatFn();
      gmp.mpfr_log10(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    exp(): Float {
      const n = FloatFn();
      gmp.mpfr_exp(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    exp2(): Float {
      const n = FloatFn();
      gmp.mpfr_exp2(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    exp10(): Float {
      const n = FloatFn();
      gmp.mpfr_exp10(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    pow(val: Float | number): Float {
      const n = FloatFn();
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
      const n = FloatFn();
      gmp.mpfr_sin(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    cos(): Float {
      const n = FloatFn();
      gmp.mpfr_cos(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    tan(): Float {
      const n = FloatFn();
      gmp.mpfr_tan(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    sec(): Float {
      const n = FloatFn();
      gmp.mpfr_sec(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    csc(): Float {
      const n = FloatFn();
      gmp.mpfr_csc(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    cot(): Float{
      const n = FloatFn();
      gmp.mpfr_cot(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    acos(): Float {
      const n = FloatFn();
      gmp.mpfr_acos(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    asin(): Float {
      const n = FloatFn();
      gmp.mpfr_asin(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    atan(): Float {
      const n = FloatFn();
      gmp.mpfr_atan(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    sinh(): Float {
      const n = FloatFn();
      gmp.mpfr_sinh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    cosh(): Float {
      const n = FloatFn();
      gmp.mpfr_cosh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    tanh(): Float {
      const n = FloatFn();
      gmp.mpfr_tanh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    sech(): Float {
      const n = FloatFn();
      gmp.mpfr_sech(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    csch(): Float {
      const n = FloatFn();
      gmp.mpfr_csch(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    coth(): Float {
      const n = FloatFn();
      gmp.mpfr_coth(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    acosh(): Float {
      const n = FloatFn();
      gmp.mpfr_acosh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    asinh(): Float {
      const n = FloatFn();
      gmp.mpfr_asinh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    atanh(): Float {
      const n = FloatFn();
      gmp.mpfr_atanh(n.mpfr_t, this.mpfr_t, this.rndMode);
      return n;
    },

    sign() {
      return gmp.mpfr_sgn(this.mpfr_t);
    },

    toNumber() {
      if (this.isNaN()) return NaN;
      if (this.isInfinite()) {
        return this.sign() * Infinity;
      }
      return gmp.mpfr_get_d(this.mpfr_t, this.rndMode);
    },

    ceil(): Float {
      const n = FloatFn();
      gmp.mpfr_ceil(n.mpfr_t, this.mpfr_t);
      return n;
    },

    floor(): Float {
      const n = FloatFn();
      gmp.mpfr_floor(n.mpfr_t, this.mpfr_t);
      return n;
    },

    round(): Float {
      const n = FloatFn();
      gmp.mpfr_round(n.mpfr_t, this.mpfr_t);
      return n;
    },

    trunc(): Float {
      const n = FloatFn();
      gmp.mpfr_trunc(n.mpfr_t, this.mpfr_t);
      return n;
    },

    toString() {
      const mpfr_exp_t_ptr = gmp.malloc(4);
      const strptr = gmp.mpfr_get_str(0, mpfr_exp_t_ptr, 10, 0, this.mpfr_t, this.rndMode);
      const endptr = gmp.mem.indexOf(0, strptr);
      let ret = decoder.decode(gmp.mem.subarray(strptr, endptr));

      if (!['@NaN@', '@Inf@', '-@Inf@'].includes(ret)) {
        // decimal point needs to be inserted
        const pointPos = gmp.memView.getInt32(mpfr_exp_t_ptr, true);
        ret = insertDecimalPoint(ret, pointPos);
      }

      gmp.mpfr_free_str(strptr);
      gmp.free(mpfr_exp_t_ptr);
      return ret;
    }
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

  const FloatFn = (val?: string | number | Float | Rational | Integer, options?: FloatOptions) => {
    const rndMode = (options?.roundingMode ?? globalRndMode) as number as mpfr_rnd_t;
    const precisionBits = options?.precisionBits ?? globalPrecisionBits;

    const instance = Object.create(FloatPrototype) as typeof FloatPrototype;
    instance.mpfr_t = gmp.mpfr_t();
    gmp.mpfr_init2(instance.mpfr_t, precisionBits);

    if (val !== undefined) {
      setValue(instance.mpfr_t, rndMode, val);
    }

    mpfr_t_arr.push(instance.mpfr_t);
    return instance;
  };

  return {
    Float: FloatFn,
    isFloat: (val) => FloatPrototype.isPrototypeOf(val),

    Pi: () => {
      const n = FloatFn();
      gmp.mpfr_const_pi(n.mpfr_t, globalRndMode);
      return n;
    },

    EulerConstant: () => {
      const n = FloatFn();
      gmp.mpfr_const_euler(n.mpfr_t, globalRndMode);
      return n;
    },

    EulerNumber: () => {
      return FloatFn(1).exp();
    },

    Log2: () => {
      const n = FloatFn();
      gmp.mpfr_const_log2(n.mpfr_t, globalRndMode);
      return n;
    },

    Catalan: () => {
      const n = FloatFn();
      gmp.mpfr_const_catalan(n.mpfr_t, globalRndMode);
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
