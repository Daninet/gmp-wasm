import type { GMPFunctions } from './functions';
import { assertInt32, assertUint32 } from './util';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

type IntegerFactoryReturn = ReturnType<typeof getIntegerContext>['Integer'];
export interface IntegerFactory extends IntegerFactoryReturn {};
type IntegerReturn = ReturnType<IntegerFactoryReturn>;
export interface Integer extends IntegerReturn {};

export enum DivMode {
  CEIL = 0,
  FLOOR = 1,
  TRUNCATE = 2,
};

export function getIntegerContext(gmp: GMPFunctions) {
  const mpz_t_arr: number[] = [];

  const compare = (mpz_t: number, val: Integer | number) => {
    if (typeof val === 'number') {
      assertInt32(val);
      return gmp.mpz_cmp_si(mpz_t, val);
    } else {
      return gmp.mpz_cmp(mpz_t, val.mpz_t);
    }
  }

  const IntPrototype = {
    mpz_t: 0,
    type: 'integer',

    add(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertInt32(val);
        if (val < 0) {
          gmp.mpz_sub_ui(n.mpz_t, this.mpz_t, -val);
        } else {
          gmp.mpz_add_ui(n.mpz_t, this.mpz_t, val);
        }
      } else {
        gmp.mpz_add(n.mpz_t, this.mpz_t, val.mpz_t);
      }
      return n;
    },

    sub(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertInt32(val);
        if (val < 0) {
          gmp.mpz_add_ui(n.mpz_t, this.mpz_t, -val);
        } else {
          gmp.mpz_sub_ui(n.mpz_t, this.mpz_t, val);
        }
      } else {
        gmp.mpz_sub(n.mpz_t, this.mpz_t, val.mpz_t);
      }
      return n;
    },

    mul(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertInt32(val);
        gmp.mpz_mul_si(n.mpz_t, this.mpz_t, val);
      } else {
        gmp.mpz_mul(n.mpz_t, this.mpz_t, val.mpz_t);
      }
      return n;
    },

    neg(): Integer {
      const n = IntegerFn();
      gmp.mpz_neg(n.mpz_t, this.mpz_t);
      return n;
    },

    abs(): Integer {
      const n = IntegerFn();
      gmp.mpz_abs(n.mpz_t, this.mpz_t);
      return n;
    },

    div(val: Integer | number, mode = DivMode.CEIL): Integer {
      const n = IntegerFn(this);
      if (typeof val === 'number') {
        assertInt32(val);
        if (val < 0) {
          gmp.mpz_neg(n.mpz_t, n.mpz_t);
          val = -val;
        }
        if (mode === DivMode.CEIL) {
          gmp.mpz_cdiv_q_ui(n.mpz_t, n.mpz_t, val);
        } else if (mode === DivMode.FLOOR) {
          gmp.mpz_fdiv_q_ui(n.mpz_t, n.mpz_t, val);
        } else if (mode === DivMode.TRUNCATE) {
          gmp.mpz_tdiv_q_ui(n.mpz_t, n.mpz_t, val);
        }
      } else {
        if (mode === DivMode.CEIL) {
          gmp.mpz_cdiv_q(n.mpz_t, this.mpz_t, val.mpz_t);
        } else if (mode === DivMode.FLOOR) {
          gmp.mpz_fdiv_q(n.mpz_t, this.mpz_t, val.mpz_t);
        } else if (mode === DivMode.TRUNCATE) {
          gmp.mpz_tdiv_q(n.mpz_t, this.mpz_t, val.mpz_t);
        }
      }
      return n;
    },

    pow(exp: Integer | number, mod?: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof exp === 'number') {
        assertUint32(exp);
        if (mod !== undefined) {
          if (typeof mod === 'number') {
            assertUint32(mod);
            gmp.mpz_powm_ui(n.mpz_t, this.mpz_t, exp, IntegerFn(mod).mpz_t);
          } else {
            gmp.mpz_powm_ui(n.mpz_t, this.mpz_t, exp, mod.mpz_t);
          }
        } else {
          gmp.mpz_pow_ui(n.mpz_t, this.mpz_t, exp);
        }
      } else {
        if (mod !== undefined) {
          if (typeof mod === 'number') {
            assertUint32(mod);
            gmp.mpz_powm(n.mpz_t, this.mpz_t, exp.mpz_t, IntegerFn(mod).mpz_t);
          } else {
            gmp.mpz_powm(n.mpz_t, this.mpz_t, exp.mpz_t, mod.mpz_t);
          }
        } else {
          const expNum = exp.toNumber();
          assertUint32(expNum);
          gmp.mpz_pow_ui(n.mpz_t, this.mpz_t, expNum);
        }
      }
      return n;
    },

    sqrt(): Integer {
      const n = IntegerFn();
      gmp.mpz_sqrt(n.mpz_t, this.mpz_t);
      return n;
    },

    nthRoot(nth: number): Integer {
      const n = IntegerFn();
      assertUint32(nth);
      gmp.mpz_root(n.mpz_t, this.mpz_t, nth);
      return n;
    },

    factorial(): Integer {
      if (gmp.mpz_fits_ulong_p(this.mpz_t) === 0) {
        throw new Error('Out of bounds!');
      }
      const n = IntegerFn();
      const value = gmp.mpz_get_ui(this.mpz_t);
      gmp.mpz_fac_ui(n.mpz_t, value);
      return n;
    },

    doubleFactorial(): Integer {
      if (gmp.mpz_fits_ulong_p(this.mpz_t) === 0) {
        throw new Error('Out of bounds!');
      }
      const n = IntegerFn();
      const value = gmp.mpz_get_ui(this.mpz_t);
      gmp.mpz_2fac_ui(n.mpz_t, value);
      return n;
    },

    isPrime(reps: number = 20) {
      assertUint32(reps);
      const ret = gmp.mpz_probab_prime_p(this.mpz_t, reps);
      if (ret === 0) return false; // definitely non-prime
      if (ret === 1) return 'probably-prime';
      if (ret === 2) return true; // definitely prime
    },

    nextPrime(): Integer {
      const n = IntegerFn();
      gmp.mpz_nextprime(n.mpz_t, this.mpz_t);
      return n;
    },

    gcd(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_gcd_ui(n.mpz_t, this.mpz_t, val);
      } else {
        gmp.mpz_gcd(n.mpz_t, this.mpz_t, val.mpz_t);
      }
      return n;
    },

    lcm(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_lcm_ui(n.mpz_t, this.mpz_t, val);
      } else {
        gmp.mpz_lcm(n.mpz_t, this.mpz_t, val.mpz_t);
      }
      return n;
    },

    and(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_and(n.mpz_t, this.mpz_t, IntegerFn(val).mpz_t);
      } else {
        gmp.mpz_and(n.mpz_t, this.mpz_t, val.mpz_t);
      }
      return n;
    },

    or(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_ior(n.mpz_t, this.mpz_t, IntegerFn(val).mpz_t);
      } else {
        gmp.mpz_ior(n.mpz_t, this.mpz_t, val.mpz_t);
      }
      return n;
    },

    xor(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_xor(n.mpz_t, this.mpz_t, IntegerFn(val).mpz_t);
      } else {
        gmp.mpz_xor(n.mpz_t, this.mpz_t, val.mpz_t);
      }
      return n;
    },

    shiftLeft(val: number): Integer {
      assertUint32(val);
      const n = IntegerFn();
      gmp.mpz_mul_2exp(n.mpz_t, this.mpz_t, val);
      return n;
    },

    shiftRight(val: number): Integer {
      assertUint32(val);
      const n = IntegerFn();
      gmp.mpz_fdiv_q_2exp(n.mpz_t, this.mpz_t, val);
      return n;
    },

    isEqual(val: Integer | number) {
      return compare(this.mpz_t, val) === 0;
    },

    lessThan(val: Integer | number) {
      return compare(this.mpz_t, val) < 0;
    },

    greaterThan(val: Integer | number) {
      return compare(this.mpz_t, val) > 0;
    },

    sign() {
      return gmp.mpz_sgn(this.mpz_t);
    },

    toNumber() {
      if (gmp.mpz_fits_slong_p(this.mpz_t) === 0) {
        return gmp.mpz_get_d(this.mpz_t);
      }
      return gmp.mpz_get_si(this.mpz_t);
    },

    toString() {
      const strptr = gmp.mpz_get_str(0, 10, this.mpz_t);
      const endptr = gmp.mem.indexOf(0, strptr);
      const str = decoder.decode(gmp.mem.subarray(strptr, endptr));
      gmp.free(strptr);
      return str;
    },
  };

  const IntegerFn = (num?: string | number | Integer) => {
    const instance = Object.create(IntPrototype) as typeof IntPrototype;
    instance.mpz_t = gmp.mpz_t();

    if (num === undefined) {
      gmp.mpz_init(instance.mpz_t);
    } else if (typeof num === 'string') {
      const encoded = encoder.encode(num);
      const strptr = gmp.malloc(encoded.length + 1);
      gmp.mem.set(encoded, strptr);
      gmp.mpz_init_set_str(instance.mpz_t, strptr, 10);
      gmp.free(strptr);
    } else if (typeof num === 'number') {
      assertInt32(num);
      gmp.mpz_init_set_si(instance.mpz_t, num);
    } else if (num?.type === 'integer') {
      gmp.mpz_init_set(instance.mpz_t, num.mpz_t);
    } else {
      gmp.mpz_t_free(instance.mpz_t);
      throw new Error('Invalid value for the Integer type!');
    }

    mpz_t_arr.push(instance.mpz_t);

    return instance;
  };

  return {
    Integer: IntegerFn,
    destroy: () => mpz_t_arr.forEach(mpz_t => {
      gmp.mpz_clear(mpz_t);
      gmp.mpz_t_free(mpz_t);
    }),
  };
};
