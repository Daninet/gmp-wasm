import type { GMPFunctions, mpfr_rnd_t } from './functions';
import { assertInt32, assertUint32 } from './util';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export type FloatType = ReturnType<typeof getFloatContext>;

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
  class Float {
    private mpfr_t = 0;
    private roundingMode: mpfr_rnd_t = 0;
  
    constructor(str: string, roundingMode: FloatRoundingMode) {
      this.mpfr_t = gmp.mpfr_t();
      this.roundingMode = roundingMode as number as mpfr_rnd_t;
      const encoded = encoder.encode(str);
      const strptr = gmp.malloc(encoded.length + 1);
      gmp.mem.set(encoded, strptr);
      gmp.mpfr_init_set_str(this.mpfr_t, strptr, 10, this.roundingMode);
      gmp.free(strptr);
      onSetDestroy?.(() => this.destroy());
    }

    add(val: Float | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        gmp.mpfr_add_si(this.mpfr_t, this.mpfr_t, val, this.roundingMode);
      } else {
        gmp.mpfr_add(this.mpfr_t, this.mpfr_t, val.mpfr_t, this.roundingMode);
      }
      return this;
    }

    sub(val: Float | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        gmp.mpfr_sub_si(this.mpfr_t, this.mpfr_t, val, this.roundingMode);
      } else {
        gmp.mpfr_sub(this.mpfr_t, this.mpfr_t, val.mpfr_t, this.roundingMode);
      }
      return this;
    }

    mul(val: Float | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        gmp.mpfr_mul_si(this.mpfr_t, this.mpfr_t, val, this.roundingMode);
      } else {
        gmp.mpfr_mul(this.mpfr_t, this.mpfr_t, val.mpfr_t, this.roundingMode);
      }
      return this;
    }

    div(val: Float | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        gmp.mpfr_div_si(this.mpfr_t, this.mpfr_t, val, this.roundingMode);
      } else {
        gmp.mpfr_div(this.mpfr_t, this.mpfr_t, val.mpfr_t, this.roundingMode);
      }
      return this;
    }

    sqrt() {
      gmp.mpfr_sqrt(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    cbrt() {
      gmp.mpfr_cbrt(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    nthRoot(nth: number) {
      assertUint32(nth);
      gmp.mpfr_rootn_ui(this.mpfr_t, this.mpfr_t, nth, this.roundingMode);
      return this;
    }

    neg() {
      gmp.mpfr_neg(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    abs() {
      gmp.mpfr_abs(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    // TODO
    // factorial() {
    //   gmp.mpfr_fac_ui(this.mpfr_t, this.mpfr_t, this.roundingMode);
    //   return this;
    // }

    isZero() {
      return gmp.mpfr_zero_p(this.mpfr_t) !== 0;
    }

    isRegular() {
      return gmp.mpfr_regular_p(this.mpfr_t) !== 0;
    }

    isNumber() {
      return gmp.mpfr_number_p(this.mpfr_t) !== 0;
    }

    isInfinite() {
      return gmp.mpfr_inf_p(this.mpfr_t) !== 0;
    }

    isNaN() {
      return gmp.mpfr_nan_p(this.mpfr_t) !== 0;
    }

    isEqual(val: Float) {
      return gmp.mpfr_equal_p(this.mpfr_t, val.mpfr_t) !== 0;
    }

    lessThan(val: Float) {
      return gmp.mpfr_less_p(this.mpfr_t, val.mpfr_t) !== 0;
    }

    lessOrEqual(val: Float) {
      return gmp.mpfr_lessequal_p(this.mpfr_t, val.mpfr_t) !== 0;
    }

    greaterThan(val: Float) {
      return gmp.mpfr_greater_p(this.mpfr_t, val.mpfr_t) !== 0;
    }

    greaterOrEqual(val: Float) {
      return gmp.mpfr_greaterequal_p(this.mpfr_t, val.mpfr_t) !== 0;
    }

    ln() {
      gmp.mpfr_log(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    log2() {
      gmp.mpfr_log2(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    log10() {
      gmp.mpfr_log10(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    exp() {
      gmp.mpfr_exp(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    exp2() {
      gmp.mpfr_exp2(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    exp10() {
      gmp.mpfr_exp10(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    pow(val: Float | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        gmp.mpfr_pow_si(this.mpfr_t, this.mpfr_t, val, this.roundingMode);
      } else {
        gmp.mpfr_pow(this.mpfr_t, this.mpfr_t, val.mpfr_t, this.roundingMode);
      }
      return this;
    }

    sin() {
      gmp.mpfr_sin(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    cos() {
      gmp.mpfr_cos(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    tan() {
      gmp.mpfr_tan(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    sec() {
      gmp.mpfr_sec(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    csc() {
      gmp.mpfr_csc(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    cot() {
      gmp.mpfr_cot(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    acos() {
      gmp.mpfr_acos(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    asin() {
      gmp.mpfr_asin(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    atan() {
      gmp.mpfr_atan(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    sinh() {
      gmp.mpfr_sinh(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    cosh() {
      gmp.mpfr_cosh(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    tanh() {
      gmp.mpfr_tanh(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    sech() {
      gmp.mpfr_sech(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    csch() {
      gmp.mpfr_csch(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    coth() {
      gmp.mpfr_coth(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    acosh() {
      gmp.mpfr_acosh(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    asinh() {
      gmp.mpfr_asinh(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    atanh() {
      gmp.mpfr_atanh(this.mpfr_t, this.mpfr_t, this.roundingMode);
      return this;
    }

    Pi() {
      gmp.mpfr_const_pi(this.mpfr_t, this.roundingMode);
      return this;
    }

    Euler() {
      gmp.mpfr_const_euler(this.mpfr_t, this.roundingMode);
      return this;
    }

    Catalan() {
      gmp.mpfr_const_catalan(this.mpfr_t, this.roundingMode);
      return this;
    }

    sign() {
      return gmp.mpq_sgn(this.mpfr_t);
    }

    toNumber() {
      return gmp.mpq_get_d(this.mpfr_t);
    }

    ceil() {
      gmp.mpfr_ceil(this.mpfr_t, this.mpfr_t);
      return this;
    }

    floor() {
      gmp.mpfr_floor(this.mpfr_t, this.mpfr_t);
      return this;
    }

    round() {
      gmp.mpfr_round(this.mpfr_t, this.mpfr_t);
      return this;
    }

    trunc() {
      gmp.mpfr_trunc(this.mpfr_t, this.mpfr_t);
      return this;
    }

    toString() {
      const mpfr_exp_t_ptr = gmp.malloc(4);
      const strptr = gmp.mpfr_get_str(0, mpfr_exp_t_ptr, 10, 0, this.mpfr_t, this.roundingMode);
      const pointPos = gmp.memView.getInt32(mpfr_exp_t_ptr, true);
      const endptr = gmp.mem.indexOf(0, strptr);
      const ret = decoder.decode(gmp.mem.subarray(strptr, endptr));
      gmp.mpfr_free_str(strptr);
      gmp.free(mpfr_exp_t_ptr);
      return ret + `point: ${pointPos}`;
    }
  
    destroy() {
      gmp.mpfr_clear(this.mpfr_t);
      gmp.mpfr_t_free(this.mpfr_t);
    }
  }

  return Float;
};
