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
  
    constructor(str: string) {
      this.mpz_t = gmp.mpz_t();
      // gmp.mpq_init(this.mpz_t);
      const encoded = encoder.encode(str);
      const strptr = gmp.malloc(encoded.length + 1);
      gmp.mem.set(encoded, strptr);
      gmp.mpz_init_set_str(this.mpz_t, strptr, 10);
      gmp.free(strptr);
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
        gmp.mpz_addmul(this.mpz_t, this.mpz_t, val.mpz_t);
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

    pow(val: number) {
      assertUint32(val);
      gmp.mpz_pow_ui(this.mpz_t, this.mpz_t, val);
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

    isPrime(reps: number) {
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

    and(val: Integer) {
      gmp.mpz_and(this.mpz_t, this.mpz_t, val.mpz_t);
      return this;
    }

    or(val: Integer) {
      gmp.mpz_ior(this.mpz_t, this.mpz_t, val.mpz_t);
      return this;
    }

    xor(val: Integer) {
      gmp.mpz_xor(this.mpz_t, this.mpz_t, val.mpz_t);
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
      return gmp.mpz_get_d(this.mpz_t);
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
