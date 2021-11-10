import type { GMPFunctions } from './functions';
import { assertInt32, assertUint32 } from './util';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

type IntegerFactoryReturn = ReturnType<typeof getIntegerContext>;
export interface IntegerFactory extends IntegerFactoryReturn {};
type IntegerReturn = ReturnType<IntegerFactoryReturn>;
export interface Integer extends IntegerReturn {};

export enum DivMode {
  CEIL = 0,
  FLOOR = 1,
  TRUNCATE = 2,
};

export function getIntegerContext(gmp: GMPFunctions, onSetDestroy?: (callback: () => void) => void) {
  const IntegerFn = (num: string | number | Integer) => {
    const mpz_t = gmp.mpz_t();

    if (typeof num === 'string') {
      const encoded = encoder.encode(num);
      const strptr = gmp.malloc(encoded.length + 1);
      gmp.mem.set(encoded, strptr);
      gmp.mpz_init_set_str(mpz_t, strptr, 10);
      gmp.free(strptr);
    } else if (typeof num === 'number') {
      assertInt32(num);
      gmp.mpz_init_set_si(mpz_t, num);
    } else if (num?.type === 'integer') {
      gmp.mpz_init_set(mpz_t, num.__getMPZT());
    } else {
      throw new Error('Invalid value for the Integer type!');
    }

    const compare = (val: Integer | number) => {
      if (typeof val === 'number') {
        assertInt32(val);
        return gmp.mpz_cmp_si(mpz_t, val);
      } else {
        return gmp.mpz_cmp(mpz_t, val.__getMPZT());
      }
    }

    const ret = {
      type: 'integer',

      __getMPZT() {
        return mpz_t;
      },

      add(val: Integer | number): Integer {
        if (typeof val === 'number') {
          assertInt32(val);
          if (val < 0) {
            gmp.mpz_sub_ui(mpz_t, mpz_t, -val);
          } else {
            gmp.mpz_add_ui(mpz_t, mpz_t, val);
          }
        } else {
          gmp.mpz_add(mpz_t, mpz_t, val.__getMPZT());
        }
        return ret;
      },
  
      sub(val: Integer | number): Integer {
        if (typeof val === 'number') {
          assertInt32(val);
          if (val < 0) {
            gmp.mpz_add_ui(mpz_t, mpz_t, -val);
          } else {
            gmp.mpz_sub_ui(mpz_t, mpz_t, val);
          }
        } else {
          gmp.mpz_sub(mpz_t, mpz_t, val.__getMPZT());
        }
        return ret;
      },
  
      mul(val: Integer | number): Integer {
        if (typeof val === 'number') {
          assertInt32(val);
          gmp.mpz_mul_si(mpz_t, mpz_t, val);
        } else {
          gmp.mpz_mul(mpz_t, mpz_t, val.__getMPZT());
        }
        return ret;
      },
  
      addmul(val: Integer | number): Integer {
        if (typeof val === 'number') {
          assertInt32(val);
          if (val < 0) {
            gmp.mpz_submul_ui(mpz_t, mpz_t, -val);
          } else {
            gmp.mpz_addmul_ui(mpz_t, mpz_t, val);
          }
        } else {
          gmp.mpz_addmul(mpz_t, mpz_t, val.__getMPZT());
        }
        return ret;
      },
  
      submul(val: Integer | number): Integer {
        if (typeof val === 'number') {
          assertInt32(val);
          if (val < 0) {
            gmp.mpz_addmul_ui(mpz_t, mpz_t, -val);
          } else {
            gmp.mpz_submul_ui(mpz_t, mpz_t, val);
          }
        } else {
          gmp.mpz_submul(mpz_t, mpz_t, val.__getMPZT());
        }
        return ret;
      },
  
      neg(): Integer {
        gmp.mpz_neg(mpz_t, mpz_t);
        return ret;
      },
  
      abs(): Integer {
        gmp.mpz_abs(mpz_t, mpz_t);
        return ret;
      },

      div(val: Integer | number, mode = DivMode.CEIL): Integer {
        if (typeof val === 'number') {
          assertInt32(val);
          if (val < 0) {
            gmp.mpz_neg(mpz_t, mpz_t);
            val = -val;
          }
          if (mode === DivMode.CEIL) {
            gmp.mpz_cdiv_q_ui(mpz_t, mpz_t, val);
          } else if (mode === DivMode.FLOOR) {
            gmp.mpz_fdiv_q_ui(mpz_t, mpz_t, val);
          } else if (mode === DivMode.TRUNCATE) {
            gmp.mpz_tdiv_q_ui(mpz_t, mpz_t, val);
          }
        } else {
          if (mode === DivMode.CEIL) {
            gmp.mpz_cdiv_q(mpz_t, mpz_t, val.__getMPZT());
          } else if (mode === DivMode.FLOOR) {
            gmp.mpz_fdiv_q(mpz_t, mpz_t, val.__getMPZT());
          } else if (mode === DivMode.TRUNCATE) {
            gmp.mpz_tdiv_q(mpz_t, mpz_t, val.__getMPZT());
          }
        }
        return ret;
      },
  
      pow(exp: Integer | number, mod?: Integer | number): Integer {
        if (typeof exp === 'number') {
          assertUint32(exp);
          if (mod !== undefined) {
            if (typeof mod === 'number') {
              assertUint32(mod);
              gmp.mpz_powm_ui(mpz_t, mpz_t, exp, IntegerFn(mod).__getMPZT());
            } else {
              gmp.mpz_powm_ui(mpz_t, mpz_t, exp, mod.__getMPZT());
            }
          } else {
            gmp.mpz_pow_ui(mpz_t, mpz_t, exp);
          }
        } else {
          if (mod !== undefined) {
            if (typeof mod === 'number') {
              assertUint32(mod);
              gmp.mpz_powm(mpz_t, mpz_t, exp.__getMPZT(), IntegerFn(mod).__getMPZT());
            } else {
              gmp.mpz_powm(mpz_t, mpz_t, exp.__getMPZT(), mod.__getMPZT());
            }
          } else {
            const expNum = exp.toNumber();
            assertUint32(expNum);
            gmp.mpz_pow_ui(mpz_t, mpz_t, expNum);
          }
        }
        return ret;
      },
  
      sqrt(): Integer {
        gmp.mpz_sqrt(mpz_t, mpz_t);
        return ret;
      },
  
      nthRoot(nth: number): Integer {
        assertUint32(nth);
        gmp.mpz_root(mpz_t, mpz_t, nth);
        return ret;
      },
  
      factorial(): Integer {
        if (gmp.mpz_fits_ulong_p(mpz_t) === 0) {
          throw new Error('Out of bounds!');
        }
        const value = gmp.mpz_get_ui(mpz_t);
        gmp.mpz_fac_ui(mpz_t, value);
        return ret;
      },
  
      doubleFactorial(): Integer {
        if (gmp.mpz_fits_ulong_p(mpz_t) === 0) {
          throw new Error('Out of bounds!');
        }
        const value = gmp.mpz_get_ui(mpz_t);
        gmp.mpz_2fac_ui(mpz_t, value);
        return ret;
      },
  
      isPrime(reps: number = 20) {
        assertUint32(reps);
        const ret = gmp.mpz_probab_prime_p(mpz_t, reps);
        if (ret === 0) return false; // definitely non-prime
        if (ret === 1) return 'probably-prime';
        if (ret === 2) return true; // definitely prime
      },
  
      nextPrime(): Integer {
        gmp.mpz_nextprime(mpz_t, mpz_t);
        return ret;
      },
  
      gcd(val: Integer | number): Integer {
        if (typeof val === 'number') {
          assertUint32(val);
          gmp.mpz_gcd_ui(mpz_t, mpz_t, val);
        } else {
          gmp.mpz_gcd(mpz_t, mpz_t, val.__getMPZT());
        }
        return ret;
      },
  
      lcm(val: Integer | number): Integer {
        if (typeof val === 'number') {
          assertUint32(val);
          gmp.mpz_lcm_ui(mpz_t, mpz_t, val);
        } else {
          gmp.mpz_lcm(mpz_t, mpz_t, val.__getMPZT());
        }
        return ret;
      },
  
      and(val: Integer | number): Integer {
        if (typeof val === 'number') {
          assertUint32(val);
          gmp.mpz_and(mpz_t, mpz_t, IntegerFn(val).__getMPZT());
        } else {
          gmp.mpz_and(mpz_t, mpz_t, val.__getMPZT());
        }
        return ret;
      },
  
      or(val: Integer | number): Integer {
        if (typeof val === 'number') {
          assertUint32(val);
          gmp.mpz_ior(mpz_t, mpz_t, IntegerFn(val).__getMPZT());
        } else {
          gmp.mpz_ior(mpz_t, mpz_t, val.__getMPZT());
        }
        return ret;
      },
  
      xor(val: Integer | number): Integer {
        if (typeof val === 'number') {
          assertUint32(val);
          gmp.mpz_xor(mpz_t, mpz_t, IntegerFn(val).__getMPZT());
        } else {
          gmp.mpz_xor(mpz_t, mpz_t, val.__getMPZT());
        }
        return ret;
      },
  
      shiftLeft(val: number): Integer {
        assertUint32(val);
        gmp.mpz_mul_2exp(mpz_t, mpz_t, val);
        return ret;
      },
  
      shiftRight(val: number): Integer {
        assertUint32(val);
        gmp.mpz_fdiv_q_2exp(mpz_t, mpz_t, val);
        return ret;
      },
  
      isEqual(val: Integer | number) {
        return compare(val) === 0;
      },
  
      lessThan(val: Integer | number) {
        return compare(val) < 0;
      },
  
      greaterThan(val: Integer | number) {
        return compare(val) > 0;
      },
  
      sign() {
        return gmp.mpz_sgn(mpz_t);
      },
  
      toNumber() {
        if (gmp.mpz_fits_slong_p(mpz_t) === 0) {
          return gmp.mpz_get_d(mpz_t);
        }
        return gmp.mpz_get_si(mpz_t);
      },
  
      toString() {
        const strptr = gmp.mpz_get_str(0, 10, mpz_t);
        const endptr = gmp.mem.indexOf(0, strptr);
        const str = decoder.decode(gmp.mem.subarray(strptr, endptr));
        gmp.free(strptr);
        return str;
      },
    
      destroy() {
        gmp.mpz_clear(mpz_t);
        gmp.mpz_t_free(mpz_t);
      },
    };

    onSetDestroy?.(() => ret.destroy());
    return ret;
  }
  return IntegerFn;
};
