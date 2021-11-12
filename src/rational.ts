import type { GMPFunctions } from './functions';
import { assertInt32 } from './util';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

type RationalFactoryReturn = ReturnType<typeof getRationalContext>;
export interface RationalFactory extends RationalFactoryReturn {};
type RationalReturn = ReturnType<RationalFactoryReturn>;
export interface Rational extends RationalReturn {};

export function getRationalContext(gmp: GMPFunctions, onSetDestroy?: (callback: () => void) => void) {
  const RationalFn = (p1: string | number | Rational, p2?: string | number) => {
    const mpq_t = gmp.mpq_t();
    gmp.mpq_init(mpq_t);
    if (typeof p1 === 'string' || typeof p2 === 'string') {
      const finalString = p2 !== undefined ? `${p1.toString()}/${p2.toString()}` : p1.toString();
      const encoded = encoder.encode(finalString);
      const strptr = gmp.malloc(encoded.length + 1);
      gmp.mem.set(encoded, strptr);
      gmp.mpq_set_str(mpq_t, strptr, 10);
      gmp.free(strptr);
    } else if (typeof p1 === 'number' || typeof p2 === 'number') {
      assertInt32(p1 as number);
      if (p2 !== undefined) {
        assertInt32(p2);
        gmp.mpq_set_si(mpq_t, p1 as number, Math.abs(p2));
        if (p2 < 0) {
          gmp.mpq_neg(mpq_t, mpq_t);
        }
      } else {
        gmp.mpq_set_si(mpq_t, p1 as number, 1);
      }
    } else if (p1?.type === 'rational') {
      gmp.mpq_set(mpq_t, p1.__getMPQT());
    }
    gmp.mpq_canonicalize(mpq_t);

    const ret = {
      type: 'rational',

      __getMPQT() {
        return mpq_t;
      },

      add(val: Rational | number): Rational {
        if (typeof val === 'number') {
          gmp.mpq_add(mpq_t, mpq_t, RationalFn(val).__getMPQT());
        } else {
          gmp.mpq_add(mpq_t, mpq_t, val.__getMPQT());
        }
        return ret;
      },
  
      sub(val: Rational | number): Rational {
        if (typeof val === 'number') {
          gmp.mpq_sub(mpq_t, mpq_t, RationalFn(val).__getMPQT());
        } else {
          gmp.mpq_sub(mpq_t, mpq_t, val.__getMPQT());
        }
        return ret;
      },
  
      mul(val: Rational | number): Rational {
        if (typeof val === 'number') {
          gmp.mpq_mul(mpq_t, mpq_t, RationalFn(val).__getMPQT());
        } else {
          gmp.mpq_mul(mpq_t, mpq_t, val.__getMPQT());
        }
        return ret;
      },
  
      neg(): Rational {
        gmp.mpq_neg(mpq_t, mpq_t);
        return ret;
      },
  
      invert(): Rational {
        gmp.mpq_inv(mpq_t, mpq_t);
        return ret;
      },
  
      abs(): Rational {
        gmp.mpq_abs(mpq_t, mpq_t);
        return ret;
      },
  
      div(val: Rational | number): Rational {
        if (typeof val === 'number') {
          gmp.mpq_div(mpq_t, mpq_t, RationalFn(val).__getMPQT());
        } else {
          gmp.mpq_div(mpq_t, mpq_t, val.__getMPQT());
        }
        return ret;
      },
  
      isEqual(val: Rational | number) {
        if (typeof val === 'number') {
          return gmp.mpq_equal(mpq_t, RationalFn(val).__getMPQT()) !== 0;
        } else {
          return gmp.mpq_equal(mpq_t, val.__getMPQT()) !== 0;
        }
      },
  
      lessThan(val: Rational | number) {
        if (typeof val === 'number') {
          return gmp.mpq_cmp(mpq_t, RationalFn(val).__getMPQT()) < 0;
        } else {
          return gmp.mpq_cmp(mpq_t, val.__getMPQT()) < 0;
        }
      },
  
      greaterThan(val: Rational | number) {
        if (typeof val === 'number') {
          return gmp.mpq_cmp(mpq_t, RationalFn(val).__getMPQT()) > 0;
        } else {
          return gmp.mpq_cmp(mpq_t, val.__getMPQT()) > 0;
        }
      },
  
      sign() {
        return gmp.mpq_sgn(mpq_t);
      },
  
      toNumber() {
        return gmp.mpq_get_d(mpq_t);
      },
  
      toString() {
        const strptr = gmp.mpq_get_str(0, 10, mpq_t);
        const endptr = gmp.mem.indexOf(0, strptr);
        const str = decoder.decode(gmp.mem.subarray(strptr, endptr));
        gmp.free(strptr);
        return str;
      },
    
      destroy() {
        gmp.mpq_clear(mpq_t);
        gmp.mpq_t_free(mpq_t);
      },
    };

    onSetDestroy?.(() => ret.destroy());
    return ret;
  }
  return RationalFn;
};
