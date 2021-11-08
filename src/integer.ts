import type { GMPFunctions } from './functions';
import { assertInt32, assertUint32 } from './util';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export enum DivMode {
  CEIL = 0,
  FLOOR = 1,
  TRUNCATE = 2,
};

export type IntegerType = ReturnType<typeof getIntegerContext>;

export function getIntegerContext(gmp: GMPFunctions, onSetDestroy?: (callback: () => void) => void) {
  class Integer {
    private mpz_t = 0;
  
    constructor(num: string | number | Integer) {
      this.mpz_t = gmp.mpz_t();
      if (typeof num === 'string') {
        const encoded = encoder.encode(num);
        const strptr = gmp.malloc(encoded.length + 1);
        gmp.mem.set(encoded, strptr);
        gmp.mpz_init_set_str(this.mpz_t, strptr, 10);
        gmp.free(strptr);
      } else if (typeof num === 'number') {
        assertInt32(num);
        gmp.mpz_init_set_si(this.mpz_t, num);
      } else if (num instanceof Integer) {
        gmp.mpz_init_set(this.mpz_t, num.mpz_t);
      } else {
        throw new Error('Invalid value for the Integer type!');
      }
      onSetDestroy?.(() => this.destroy());
    }

    add(val: Integer | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        if (val < 0) {
          gmp.mpz_sub_ui(this.mpz_t, this.mpz_t, -val);
        } else {
          gmp.mpz_add_ui(this.mpz_t, this.mpz_t, val);
        }
      } else {
        gmp.mpz_add(this.mpz_t, this.mpz_t, val.mpz_t);
      }
      return this;
    }

    sub(val: Integer | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        if (val < 0) {
          gmp.mpz_add_ui(this.mpz_t, this.mpz_t, -val);
        } else {
          gmp.mpz_sub_ui(this.mpz_t, this.mpz_t, val);
        }
      } else {
        gmp.mpz_sub(this.mpz_t, this.mpz_t, val.mpz_t);
      }
      return this;
    }

    mul(val: Integer | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        gmp.mpz_mul_si(this.mpz_t, this.mpz_t, val);
      } else {
        gmp.mpz_mul(this.mpz_t, this.mpz_t, val.mpz_t);
      }
      return this;
    }

    addmul(val: Integer | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        if (val < 0) {
          gmp.mpz_submul_ui(this.mpz_t, this.mpz_t, -val);
        } else {
          gmp.mpz_addmul_ui(this.mpz_t, this.mpz_t, val);
        }
      } else {
        gmp.mpz_addmul(this.mpz_t, this.mpz_t, val.mpz_t);
      }
      return this;
    }

    submul(val: Integer | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        if (val < 0) {
          gmp.mpz_addmul_ui(this.mpz_t, this.mpz_t, -val);
        } else {
          gmp.mpz_submul_ui(this.mpz_t, this.mpz_t, val);
        }
      } else {
        gmp.mpz_submul(this.mpz_t, this.mpz_t, val.mpz_t);
      }
      return this;
    }

    neg() {
      gmp.mpz_neg(this.mpz_t, this.mpz_t);
      return this;
    }

    abs() {
      gmp.mpz_abs(this.mpz_t, this.mpz_t);
      return this;
    }

    div(val: Integer | number, mode = DivMode.CEIL) {
      if (typeof val === 'number') {
        assertInt32(val);
        if (val < 0) {
          gmp.mpz_neg(this.mpz_t, this.mpz_t);
          val = -val;
        }
        if (mode === DivMode.CEIL) {
          gmp.mpz_cdiv_q_ui(this.mpz_t, this.mpz_t, val);
        } else if (mode === DivMode.FLOOR) {
          gmp.mpz_fdiv_q_ui(this.mpz_t, this.mpz_t, val);
        } else if (mode === DivMode.TRUNCATE) {
          gmp.mpz_tdiv_q_ui(this.mpz_t, this.mpz_t, val);
        }
      } else {
        if (mode === DivMode.CEIL) {
          gmp.mpz_cdiv_q(this.mpz_t, this.mpz_t, val.mpz_t);
        } else if (mode === DivMode.FLOOR) {
          gmp.mpz_fdiv_q(this.mpz_t, this.mpz_t, val.mpz_t);
        } else if (mode === DivMode.TRUNCATE) {
          gmp.mpz_tdiv_q(this.mpz_t, this.mpz_t, val.mpz_t);
        }
      }
      return this;
    }

    pow(exp: Integer | number, mod?: Integer | number) {
      if (typeof exp === 'number') {
        assertUint32(exp);
        if (mod !== undefined) {
          if (typeof mod === 'number') {
            assertUint32(mod);
            gmp.mpz_powm_ui(this.mpz_t, this.mpz_t, exp, new Integer(mod).mpz_t);
          } else {
            gmp.mpz_powm_ui(this.mpz_t, this.mpz_t, exp, mod.mpz_t);
          }
        } else {
          gmp.mpz_pow_ui(this.mpz_t, this.mpz_t, exp);
        }
      } else {
        if (mod !== undefined) {
          if (typeof mod === 'number') {
            assertUint32(mod);
            gmp.mpz_powm(this.mpz_t, this.mpz_t, exp.mpz_t, new Integer(mod).mpz_t);
          } else {
            gmp.mpz_powm(this.mpz_t, this.mpz_t, exp.mpz_t, mod.mpz_t);
          }
        } else {
          const expNum = exp.toNumber();
          assertUint32(expNum);
          gmp.mpz_pow_ui(this.mpz_t, this.mpz_t, expNum);
        }
      }
      return this;
    }

    sqrt() {
      gmp.mpz_sqrt(this.mpz_t, this.mpz_t);
      return this;
    }

    nthRoot(nth: number) {
      assertUint32(nth);
      gmp.mpz_root(this.mpz_t, this.mpz_t, nth);
      return this;
    }

    factorial() {
      if (gmp.mpz_fits_ulong_p(this.mpz_t) === 0) {
        throw new Error('Out of bounds!');
      }
      const value = gmp.mpz_get_ui(this.mpz_t);
      gmp.mpz_fac_ui(this.mpz_t, value);
      return this;
    }

    doubleFactorial() {
      if (gmp.mpz_fits_ulong_p(this.mpz_t) === 0) {
        throw new Error('Out of bounds!');
      }
      const value = gmp.mpz_get_ui(this.mpz_t);
      gmp.mpz_2fac_ui(this.mpz_t, value);
      return this;
    }

    isPrime(reps: number = 20) {
      assertUint32(reps);
      const ret = gmp.mpz_probab_prime_p(this.mpz_t, reps);
      if (ret === 0) return false; // definitely non-prime
      if (ret === 1) return 'probably-prime';
      if (ret === 2) return true; // definitely prime
    }

    nextPrime() {
      gmp.mpz_nextprime(this.mpz_t, this.mpz_t);
      return this;
    }

    gcd(val: Integer | number) {
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_gcd_ui(this.mpz_t, this.mpz_t, val);
      } else {
        gmp.mpz_gcd(this.mpz_t, this.mpz_t, val.mpz_t);
      }
      return this;
    }

    lcm(val: Integer | number) {
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_lcm_ui(this.mpz_t, this.mpz_t, val);
      } else {
        gmp.mpz_lcm(this.mpz_t, this.mpz_t, val.mpz_t);
      }
      return this;
    }

    and(val: Integer | number) {
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_and(this.mpz_t, this.mpz_t, new Integer(val).mpz_t);
      } else {
        gmp.mpz_and(this.mpz_t, this.mpz_t, val.mpz_t);
      }
      return this;
    }

    or(val: Integer | number) {
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_ior(this.mpz_t, this.mpz_t, new Integer(val).mpz_t);
      } else {
        gmp.mpz_ior(this.mpz_t, this.mpz_t, val.mpz_t);
      }
      return this;
    }

    xor(val: Integer | number) {
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_xor(this.mpz_t, this.mpz_t, new Integer(val).mpz_t);
      } else {
        gmp.mpz_xor(this.mpz_t, this.mpz_t, val.mpz_t);
      }
      return this;
    }

    shiftLeft(val: number) {
      assertUint32(val);
      gmp.mpz_mul_2exp(this.mpz_t, this.mpz_t, val);
      return this;
    }

    shiftRight(val: number) {
      assertUint32(val);
      gmp.mpz_fdiv_q_2exp(this.mpz_t, this.mpz_t, val);
      return this;
    }

    private compare(val: Integer | number) {
      if (typeof val === 'number') {
        assertInt32(val);
        return gmp.mpz_cmp_si(this.mpz_t, val);
      } else {
        return gmp.mpz_cmp(this.mpz_t, val.mpz_t);
      }
    }

    isEqual(val: Integer | number) {
      return this.compare(val) === 0;
    }

    lessThan(val: Integer | number) {
      return this.compare(val) < 0;
    }

    greaterThan(val: Integer | number) {
      return this.compare(val) > 0;
    }

    sign() {
      return gmp.mpz_sgn(this.mpz_t);
    }

    toNumber() {
      if (gmp.mpz_fits_slong_p(this.mpz_t) === 0) {
        return gmp.mpz_get_d(this.mpz_t);
      }
      return gmp.mpz_get_si(this.mpz_t);
    }

    toString() {
      const strptr = gmp.mpz_get_str(0, 10, this.mpz_t);
      const endptr = gmp.mem.indexOf(0, strptr);
      const ret = decoder.decode(gmp.mem.subarray(strptr, endptr));
      gmp.free(strptr);
      return ret;
    }
  
    destroy() {
      gmp.mpz_clear(this.mpz_t);
      gmp.mpz_t_free(this.mpz_t);
    }
  }

  return Integer;
};
