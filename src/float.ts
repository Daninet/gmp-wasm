import type { GMPFunctions, mpfr_rnd_t } from './functions';
import { assertInt32, assertUint32, isInt32 } from './util';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

type FloatFactoryReturn = ReturnType<typeof getFloatContext>;
export interface FloatFactory extends FloatFactoryReturn {};
type FloatReturn = ReturnType<FloatFactoryReturn>;
export interface Float extends FloatReturn {};

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

export function getFloatContext(gmp: GMPFunctions, onSetDestroy?: (callback: () => void) => void) {
  const FloatFn = (precisionBits = 52, roundingMode: FloatRoundingMode = FloatRoundingMode.ROUND_TO_NEAREST_TIES_TO_EVEN) => {
    const mpfr_t = gmp.mpfr_t();
    const rndMode = roundingMode as number as mpfr_rnd_t;
    assertUint32(precisionBits);
    gmp.mpfr_init2(mpfr_t, precisionBits);

    const ret = {
      type: 'float',
      mpfr_t,

      set(val: string | number | Float): Float {
        if (typeof val === 'string') {
          const encoded = encoder.encode(val);
          const strptr = gmp.malloc(encoded.length + 1);
          gmp.mem.set(encoded, strptr);
          gmp.mpfr_set_str(mpfr_t, strptr, 10, rndMode);
          gmp.free(strptr);
        } else if (typeof val === 'number') {
          if (isInt32(val)) {
            gmp.mpfr_set_si(mpfr_t, val, rndMode);
            if (Object.is(val, -0)) {
              gmp.mpfr_neg(mpfr_t, mpfr_t, rndMode);
            }
          } else {
            gmp.mpfr_set_d(mpfr_t, val, rndMode);
          }
        } else if (val?.type === 'float') {
          gmp.mpfr_set(mpfr_t, val.mpfr_t, rndMode);
        }
        return ret;
      },

      setToPi() {
        gmp.mpfr_const_pi(mpfr_t, rndMode);
        return ret;
      },

      setToEulerConstant() {
        gmp.mpfr_const_euler(mpfr_t, rndMode);
        return ret;
      },

      setToLog2() {
        gmp.mpfr_const_log2(mpfr_t, rndMode);
        return ret;
      },

      setToCatalan() {
        gmp.mpfr_const_catalan(mpfr_t, rndMode);
        return ret;
      },

      setToEulerNumber() {
        ret.set(FloatFn(precisionBits, roundingMode).set(1).exp());
        return ret;
      },

      add(val: Float | number): Float {
        if (typeof val === 'number') {
          gmp.mpfr_add_d(mpfr_t, mpfr_t, val, rndMode);
        } else {
          gmp.mpfr_add(mpfr_t, mpfr_t, val.mpfr_t, rndMode);
        }
        return ret;
      },

      sub(val: Float | number): Float {
        if (typeof val === 'number') {
          gmp.mpfr_sub_d(mpfr_t, mpfr_t, val, rndMode);
        } else {
          gmp.mpfr_sub(mpfr_t, mpfr_t, val.mpfr_t, rndMode);
        }
        return ret;
      },

      mul(val: Float | number): Float {
        if (typeof val === 'number') {
          if (isInt32(val)) {
            gmp.mpfr_mul_si(mpfr_t, mpfr_t, val, rndMode);
          } else {
            gmp.mpfr_mul_d(mpfr_t, mpfr_t, val, rndMode);
          }
        } else {
          gmp.mpfr_mul(mpfr_t, mpfr_t, val.mpfr_t, rndMode);
        }
        return ret;
      },

      div(val: Float | number): Float {
        if (typeof val === 'number') {
          gmp.mpfr_div_d(mpfr_t, mpfr_t, val, rndMode);
        } else {
          gmp.mpfr_div(mpfr_t, mpfr_t, val.mpfr_t, rndMode);
        }
        return ret;
      },

      sqrt(): Float {
        gmp.mpfr_sqrt(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      cbrt(): Float {
        gmp.mpfr_cbrt(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      nthRoot(nth: number): Float {
        assertUint32(nth);
        gmp.mpfr_rootn_ui(mpfr_t, mpfr_t, nth, rndMode);
        return ret;
      },

      neg(): Float {
        gmp.mpfr_neg(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      abs(): Float {
        gmp.mpfr_abs(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      // TODO
      // factorial() {
      //   gmp.mpfr_fac_ui(mpfr_t, mpfr_t, rndMode);
      //   return ret;
      // }

      isZero() {
        return gmp.mpfr_zero_p(mpfr_t) !== 0;
      },

      isRegular() {
        return gmp.mpfr_regular_p(mpfr_t) !== 0;
      },

      isNumber() {
        return gmp.mpfr_number_p(mpfr_t) !== 0;
      },

      isInfinite() {
        return gmp.mpfr_inf_p(mpfr_t) !== 0;
      },

      isNaN() {
        return gmp.mpfr_nan_p(mpfr_t) !== 0;
      },

      isEqual(val: Float | number) {
        val = (typeof val === 'number') ? FloatFn(52).set(val) : val;
        return gmp.mpfr_equal_p(mpfr_t, val.mpfr_t) !== 0;
      },

      lessThan(val: Float | number) {
        val = typeof val === 'number' ? FloatFn(52).set(val) : val;
        return gmp.mpfr_less_p(mpfr_t, val.mpfr_t) !== 0;
      },

      lessOrEqual(val: Float | number) {
        val = typeof val === 'number' ? FloatFn(52).set(val) : val;
        return gmp.mpfr_lessequal_p(mpfr_t, val.mpfr_t) !== 0;
      },

      greaterThan(val: Float | number) {
        val = typeof val === 'number' ? FloatFn(52).set(val) : val;
        return gmp.mpfr_greater_p(mpfr_t, val.mpfr_t) !== 0;
      },

      greaterOrEqual(val: Float | number) {
        val = typeof val === 'number' ? FloatFn(52).set(val) : val;
        return gmp.mpfr_greaterequal_p(mpfr_t, val.mpfr_t) !== 0;
      },

      ln(): Float {
        gmp.mpfr_log(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      log2(): Float {
        gmp.mpfr_log2(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      log10(): Float {
        gmp.mpfr_log10(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      exp(): Float {
        gmp.mpfr_exp(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      exp2(): Float {
        gmp.mpfr_exp2(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      exp10(): Float {
        gmp.mpfr_exp10(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      pow(val: Float | number): Float {
        if (typeof val === 'number') {
          if (isInt32(val)) {
            gmp.mpfr_pow_si(mpfr_t, mpfr_t, val, rndMode);
          } else {
            gmp.mpfr_pow(mpfr_t, mpfr_t, FloatFn().set(val).mpfr_t, rndMode);
          }
        } else {
          gmp.mpfr_pow(mpfr_t, mpfr_t, val.mpfr_t, rndMode);
        }
        return ret;
      },

      sin(): Float {
        gmp.mpfr_sin(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      cos(): Float {
        gmp.mpfr_cos(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      tan(): Float {
        gmp.mpfr_tan(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      sec(): Float {
        gmp.mpfr_sec(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      csc(): Float {
        gmp.mpfr_csc(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      cot(): Float{
        gmp.mpfr_cot(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      acos(): Float {
        gmp.mpfr_acos(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      asin(): Float {
        gmp.mpfr_asin(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      atan(): Float {
        gmp.mpfr_atan(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      sinh(): Float {
        gmp.mpfr_sinh(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      cosh(): Float {
        gmp.mpfr_cosh(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      tanh(): Float {
        gmp.mpfr_tanh(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      sech(): Float {
        gmp.mpfr_sech(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      csch(): Float {
        gmp.mpfr_csch(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      coth(): Float {
        gmp.mpfr_coth(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      acosh(): Float {
        gmp.mpfr_acosh(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      asinh(): Float {
        gmp.mpfr_asinh(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      atanh(): Float {
        gmp.mpfr_atanh(mpfr_t, mpfr_t, rndMode);
        return ret;
      },

      sign() {
        return gmp.mpfr_sgn(mpfr_t);
      },

      toNumber() {
        if (ret.isNaN()) return NaN;
        if (ret.isInfinite()) {
          return ret.sign() * Infinity;
        }
        return gmp.mpfr_get_d(mpfr_t, rndMode);
      },

      ceil(): Float {
        gmp.mpfr_ceil(mpfr_t, mpfr_t);
        return ret;
      },

      floor(): Float {
        gmp.mpfr_floor(mpfr_t, mpfr_t);
        return ret;
      },

      round(): Float {
        gmp.mpfr_round(mpfr_t, mpfr_t);
        return ret;
      },

      trunc(): Float {
        gmp.mpfr_trunc(mpfr_t, mpfr_t);
        return ret;
      },

      toString() {
        const mpfr_exp_t_ptr = gmp.malloc(4);
        const strptr = gmp.mpfr_get_str(0, mpfr_exp_t_ptr, 10, 0, mpfr_t, rndMode);
        // const strptr = gmp.mpfr_asprintf_simple(mpfr_t, rndMode);
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
      },
    
      destroy() {
        gmp.mpfr_clear(mpfr_t);
        gmp.mpfr_t_free(mpfr_t);
      }
    };

    onSetDestroy?.(() => ret.destroy());

    return ret;
  };
  return FloatFn;
};
