import type { GMPFunctions, mpfr_rnd_t } from './functions';
import { assertInt32, assertUint32 } from './util';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

type FloatReturn = ReturnType<ReturnType<typeof getFloatContext>>;
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

export function getFloatContext(gmp: GMPFunctions, onSetDestroy?: (callback: () => void) => void) {
  const FloatFn = (precisionBits = 64, roundingMode: FloatRoundingMode = FloatRoundingMode.ROUND_TO_NEAREST_TIES_TO_EVEN) => {
    const mpfr_t = gmp.mpfr_t();
    const rndMode = roundingMode as number as mpfr_rnd_t;
    gmp.mpfr_init2(mpfr_t, precisionBits);

    const insertDecimalPoint = (mantissa: string, pointPos: number) => {
      const isNegative = mantissa.startsWith('-');

      const mantissaWithoutSign = isNegative ? mantissa.slice(1) : mantissa;
      const sign = isNegative ? '-' : '';
      let hasDecimalPoint = false;

      if (pointPos <= 0) {
        const zeros = [...Array(-pointPos)].fill('0').join('');
        mantissa = `${sign}0.${zeros}${mantissaWithoutSign}`;
        hasDecimalPoint = true;
      } else if (pointPos < mantissaWithoutSign.length) {
        mantissa = `${sign}${mantissaWithoutSign.slice(0, pointPos)}.${mantissaWithoutSign.slice(pointPos)}`;
        hasDecimalPoint = true;
      } else {
        const zeros = [...Array(pointPos - mantissaWithoutSign.length)].fill('0').join('');
        mantissa = `${mantissa}${zeros}`;
      }

      // trim trailing zeros after decimal point
      if (hasDecimalPoint) {
        let pos = mantissa.length - 1;
        while (pos >= 0) {
          if (mantissa[pos] !== '.' && mantissa[pos] !== '0') break;
          pos--;
        }
        if (pos !== mantissa.length - 1) {
          mantissa = mantissa.slice(0, pos + 1);
        }
      }
      return mantissa;
    }

    const ret = {
      __getMPFR() {
        return mpfr_t;
      },

      set(str: string): Float {
        const encoded = encoder.encode(str);
        const strptr = gmp.malloc(encoded.length + 1);
        gmp.mem.set(encoded, strptr);
        gmp.mpfr_set_str(mpfr_t, strptr, 10, rndMode);
        gmp.free(strptr);
        return ret;
      },

      add(val: Float | number): Float {
        if (typeof val === 'number') {
          assertInt32(val);
          gmp.mpfr_add_si(mpfr_t, mpfr_t, val, rndMode);
        } else {
          gmp.mpfr_add(mpfr_t, mpfr_t, val.__getMPFR(), rndMode);
        }
        return ret;
      },

      sub(val: Float | number): Float {
        if (typeof val === 'number') {
          assertInt32(val);
          gmp.mpfr_sub_si(mpfr_t, mpfr_t, val, rndMode);
        } else {
          gmp.mpfr_sub(mpfr_t, mpfr_t, val.__getMPFR(), rndMode);
        }
        return ret;
      },

      mul(val: Float | number): Float {
        if (typeof val === 'number') {
          assertInt32(val);
          gmp.mpfr_mul_si(mpfr_t, mpfr_t, val, rndMode);
        } else {
          gmp.mpfr_mul(mpfr_t, mpfr_t, val.__getMPFR(), rndMode);
        }
        return ret;
      },

      div(val: Float | number): Float {
        if (typeof val === 'number') {
          assertInt32(val);
          gmp.mpfr_div_si(mpfr_t, mpfr_t, val, rndMode);
        } else {
          gmp.mpfr_div(mpfr_t, mpfr_t, val.__getMPFR(), rndMode);
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

      isEqual(val: Float) {
        return gmp.mpfr_equal_p(mpfr_t, val.__getMPFR()) !== 0;
      },

      lessThan(val: Float) {
        return gmp.mpfr_less_p(mpfr_t, val.__getMPFR()) !== 0;
      },

      lessOrEqual(val: Float) {
        return gmp.mpfr_lessequal_p(mpfr_t, val.__getMPFR()) !== 0;
      },

      greaterThan(val: Float) {
        return gmp.mpfr_greater_p(mpfr_t, val.__getMPFR()) !== 0;
      },

      greaterOrEqual(val: Float) {
        return gmp.mpfr_greaterequal_p(mpfr_t, val.__getMPFR()) !== 0;
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
          assertInt32(val);
          gmp.mpfr_pow_si(mpfr_t, mpfr_t, val, rndMode);
        } else {
          gmp.mpfr_pow(mpfr_t, mpfr_t, val.__getMPFR(), rndMode);
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

      Pi(): Float {
        gmp.mpfr_const_pi(mpfr_t, rndMode);
        return ret;
      },

      Euler(): Float {
        gmp.mpfr_const_euler(mpfr_t, rndMode);
        return ret;
      },

      Catalan(): Float {
        gmp.mpfr_const_catalan(mpfr_t, rndMode);
        return ret;
      },

      sign() {
        return gmp.mpq_sgn(mpfr_t);
      },

      toNumber() {
        return gmp.mpq_get_d(mpfr_t);
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
