import type { GMPFunctions } from './functions';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export type RationalType = ReturnType<typeof getRationalContext>;

export function getRationalContext(gmp: GMPFunctions, onSetDestroy?: (callback: () => void) => void) {
  class Rational {
    private mpq_t = 0;
  
    constructor(str: string) {
      this.mpq_t = gmp.mpq_t();
      gmp.mpq_init(this.mpq_t);
      const encoded = encoder.encode(str);
      const strptr = gmp.malloc(encoded.length + 1);
      gmp.mem.set(encoded, strptr);
      gmp.mpq_set_str(this.mpq_t, strptr, 10);
      gmp.free(strptr);
      gmp.mpq_canonicalize(this.mpq_t);
      onSetDestroy?.(() => this.destroy());
    }

    add(val: Rational) {
      gmp.mpq_add(this.mpq_t, this.mpq_t, val.mpq_t);
      return this;
    }

    sub(val: Rational) {
      gmp.mpq_sub(this.mpq_t, this.mpq_t, val.mpq_t);
      return this;
    }

    mul(val: Rational) {
      gmp.mpq_mul(this.mpq_t, this.mpq_t, val.mpq_t);
      return this;
    }

    neg() {
      gmp.mpq_neg(this.mpq_t, this.mpq_t);
      return this;
    }

    invert() {
      gmp.mpq_inv(this.mpq_t, this.mpq_t);
      return this;
    }

    abs() {
      gmp.mpq_abs(this.mpq_t, this.mpq_t);
      return this;
    }

    div(val: Rational) {
      gmp.mpq_div(this.mpq_t, this.mpq_t, val.mpq_t);
      return this;
    }

    isEqual(val: Rational) {
      return gmp.mpq_equal(this.mpq_t, val.mpq_t) !== 0;
    }

    lessThan(val: Rational) {
      return gmp.mpq_cmp(this.mpq_t, val.mpq_t) < 0;
    }

    greaterThan(val: Rational) {
      return gmp.mpq_cmp(this.mpq_t, val.mpq_t) > 0;
    }

    sign() {
      return gmp.mpq_sgn(this.mpq_t);
    }

    toNumber() {
      return gmp.mpq_get_d(this.mpq_t);
    }

    toString() {
      const strptr = gmp.mpq_get_str(0, 10, this.mpq_t);
      const endptr = gmp.mem.indexOf(0, strptr);
      const ret = decoder.decode(gmp.mem.subarray(strptr, endptr));
      gmp.free(strptr);
      return ret;
    }
  
    destroy() {
      gmp.mpq_clear(this.mpq_t);
      gmp.mpq_t_free(this.mpq_t);
    }
  }

  return Rational;
};
