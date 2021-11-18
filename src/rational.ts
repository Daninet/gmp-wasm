import type { GMPFunctions } from './functions';
import { Float } from './float';
import { Integer } from './integer';
import { assertInt32 } from './util';

const decoder = new TextDecoder();

type RationalFactoryReturn = ReturnType<typeof getRationalContext>['Rational'];
export interface RationalFactory extends RationalFactoryReturn {};
type RationalReturn = ReturnType<RationalFactoryReturn>;
export interface Rational extends RationalReturn {};

// these should not be exported
type AllTypes = Integer | Rational | Float | number;
type OutputType<T> = 
  T extends number ? Rational :
  T extends Integer ? Rational :
  T extends Rational ? Rational :
  T extends Float ? Float :
  never;

const INVALID_PARAMETER_ERROR = 'Invalid parameter!';

export function getRationalContext(gmp: GMPFunctions, ctx: any) {
  const mpq_t_arr: number[] = [];

  const isInteger = (val): boolean => ctx.intContext.isInteger(val);
  const isRational = (val): boolean => ctx.rationalContext.isRational(val);
  const isFloat = (val): boolean => ctx.floatContext.isFloat(val);

  const compare = (mpq_t: number, val: AllTypes): number => {
    if (typeof val === 'number') {
      assertInt32(val);
      return gmp.mpq_cmp_si(mpq_t, val, 1);
    }
    if (isInteger(val)) {
      return gmp.mpq_cmp_z(mpq_t, (val as Integer).mpz_t);
    }
    if (isRational(val)) {
      return gmp.mpq_cmp(mpq_t, (val as Rational).mpq_t);
    }
    if (isFloat(val)) {
      return -gmp.mpfr_cmp_q((val as Float).mpfr_t, mpq_t);
    }
    throw new Error(INVALID_PARAMETER_ERROR);
  }

  const RationalPrototype = {
    mpq_t: 0,
    type: 'rational',

    add<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number' || isInteger(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_add(n.mpq_t, this.mpq_t, RationalFn(val as number | Integer).mpq_t);
        return n as OutputType<T>;
      }
      if (isRational(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_add(n.mpq_t, this.mpq_t, (val as Rational).mpq_t);
        return n as OutputType<T>;
      }
      if (isFloat(val)) {
        return val.add(this) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    sub<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number' || isInteger(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_sub(n.mpq_t, this.mpq_t, RationalFn(val as number | Integer).mpq_t);
        return n as OutputType<T>;
      }
      if (isRational(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_sub(n.mpq_t, this.mpq_t, (val as Rational).mpq_t);
        return n as OutputType<T>;
      }
      if (isFloat(val)) {
        return val.neg().add(this) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    mul<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number' || isInteger(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_mul(n.mpq_t, this.mpq_t, RationalFn(val as number | Integer).mpq_t);
        return n as OutputType<T>;
      }
      if (isRational(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_mul(n.mpq_t, this.mpq_t, (val as Rational).mpq_t);
        return n as OutputType<T>;
      }
      if (isFloat(val)) {
        return val.mul(this) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    neg(): Rational {
      const n = RationalFn(0, 1);
      gmp.mpq_neg(n.mpq_t, this.mpq_t);
      return n;
    },

    invert(): Rational {
      const n = RationalFn(0, 1);
      gmp.mpq_inv(n.mpq_t, this.mpq_t);
      return n;
    },

    abs(): Rational {
      const n = RationalFn(0, 1);
      gmp.mpq_abs(n.mpq_t, this.mpq_t);
      return n;
    },

    div<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number' || isInteger(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_div(n.mpq_t, this.mpq_t, RationalFn(val as number | Integer).mpq_t);
        return n as OutputType<T>;
      }
      if (isRational(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_div(n.mpq_t, this.mpq_t, (val as Rational).mpq_t);
        return n as OutputType<T>;
      }
      if (isFloat(val)) {
        return val.mul(this.invert()) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    isEqual(val: AllTypes): boolean {
      if (typeof val === 'number' || isInteger(val)) {
        return gmp.mpq_equal(this.mpq_t, RationalFn(val as number | Integer).mpq_t) !== 0;
      }
      if (isRational(val)) {
        return gmp.mpq_equal(this.mpq_t, (val as Rational).mpq_t) !== 0;
      }
      if (isFloat(val)) {
        return val.isEqual(this);
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    lessThan(val: AllTypes): boolean {
      return compare(this.mpq_t, val) < 0;
    },

    lessOrEqual(val: AllTypes): boolean {
      return compare(this.mpq_t, val) <= 0;
    },

    greaterThan(val: AllTypes): boolean {
      return compare(this.mpq_t, val) > 0;
    },

    greaterOrEqual(val: AllTypes): boolean {
      return compare(this.mpq_t, val) >= 0;
    },

    numerator(): Integer {
      const n = ctx.intContext.Integer() as Integer;
      gmp.mpq_get_num(n.mpz_t, this.mpq_t);
      return n;
    },

    denominator(): Integer {
      const n = ctx.intContext.Integer() as Integer;
      gmp.mpq_get_den(n.mpz_t, this.mpq_t);
      return n;
    },

    sign() {
      return gmp.mpq_sgn(this.mpq_t);
    },

    toNumber() {
      return gmp.mpq_get_d(this.mpq_t);
    },

    toString() {
      const strptr = gmp.mpq_get_str(0, 10, this.mpq_t);
      const endptr = gmp.mem.indexOf(0, strptr);
      const str = decoder.decode(gmp.mem.subarray(strptr, endptr));
      gmp.free(strptr);
      return str;
    },
  };

  const parseParameters = (mpq_t: number, p1: string | number | Rational | Integer, p2?: string | number | Integer) => {
    if (typeof p1 === 'number' && (p2 === undefined || typeof p2 === 'number')) {
      assertInt32(p1 as number);
      if (p2 !== undefined) {
        assertInt32(p2 as number);
        gmp.mpq_set_si(mpq_t, p1 as number, Math.abs(p2 as number));
        if (p2 < 0) {
          gmp.mpq_neg(mpq_t, mpq_t);
        }
      } else {
        gmp.mpq_set_si(mpq_t, p1 as number, 1);
      }
      return;
    }

    if (isInteger(p1) && p2 === undefined) {
      gmp.mpq_set_z(mpq_t, (p1 as Integer).mpz_t);
      return;
    }

    if (isRational(p1) && p2 === undefined) {
      gmp.mpq_set(mpq_t, (p1 as Rational).mpq_t);
      return;
    }

    const finalString = p2 !== undefined ? `${p1.toString()}/${p2.toString()}` : p1.toString();
    const strPtr = gmp.malloc_cstr(finalString);
    gmp.mpq_set_str(mpq_t, strPtr, 10);
    gmp.free(strPtr);
  }

  const RationalFn = (p1: string | number | Rational | Integer, p2?: string | number | Integer) => {
    const instance = Object.create(RationalPrototype) as typeof RationalPrototype;
    instance.mpq_t = gmp.mpq_t();
    gmp.mpq_init(instance.mpq_t);

    parseParameters(instance.mpq_t, p1, p2);

    gmp.mpq_canonicalize(instance.mpq_t);

    mpq_t_arr.push(instance.mpq_t);

    return instance;
  }

  return {
    Rational: RationalFn,
    isRational: (val) => RationalPrototype.isPrototypeOf(val),
    destroy: () => {
      for (let i = mpq_t_arr.length - 1; i >= 0; i--) {
        gmp.mpq_clear(mpq_t_arr[i]);
        gmp.mpq_t_free(mpq_t_arr[i]);
      }
      mpq_t_arr.length = 0;
    }
  };
};
