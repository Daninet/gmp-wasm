import type { GMPFunctions } from './functions';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

type RationalFactoryReturn = ReturnType<typeof getRationalContext>;
export interface RationalFactory extends RationalFactoryReturn {};
type RationalReturn = ReturnType<RationalFactoryReturn>;
export interface Rational extends RationalReturn {};

export function getRationalContext(gmp: GMPFunctions, onSetDestroy?: (callback: () => void) => void) {
  const RationalFn = (str: string) => {
    const mpq_t = gmp.mpq_t();
    gmp.mpq_init(mpq_t);
    const encoded = encoder.encode(str);
    const strptr = gmp.malloc(encoded.length + 1);
    gmp.mem.set(encoded, strptr);
    gmp.mpq_set_str(mpq_t, strptr, 10);
    gmp.free(strptr);
    gmp.mpq_canonicalize(mpq_t);

    const ret = {
      __getMPQT() {
        return mpq_t;
      },

      add(val: Rational): Rational {
        gmp.mpq_add(mpq_t, mpq_t, val.__getMPQT());
        return ret;
      },
  
      sub(val: Rational): Rational {
        gmp.mpq_sub(mpq_t, mpq_t, val.__getMPQT());
        return ret;
      },
  
      mul(val: Rational): Rational {
        gmp.mpq_mul(mpq_t, mpq_t, val.__getMPQT());
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
  
      div(val: Rational): Rational {
        gmp.mpq_div(mpq_t, mpq_t, val.__getMPQT());
        return ret;
      },
  
      isEqual(val: Rational) {
        return gmp.mpq_equal(mpq_t, val.__getMPQT()) !== 0;
      },
  
      lessThan(val: Rational) {
        return gmp.mpq_cmp(mpq_t, val.__getMPQT()) < 0;
      },
  
      greaterThan(val: Rational) {
        return gmp.mpq_cmp(mpq_t, val.__getMPQT()) > 0;
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
