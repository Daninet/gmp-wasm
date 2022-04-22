import type { GMPFunctions } from './functions';
import { Float } from './float';
import { Integer } from './integer';
import { assertInt32 } from './util';

type RationalFactoryReturn = ReturnType<typeof getRationalContext>['Rational'];
export interface RationalFactory extends RationalFactoryReturn {};
type RationalReturn = ReturnType<RationalFactoryReturn>;
export interface Rational extends RationalReturn {};

// these should not be exported
type AllTypes = Integer | Rational | Float | string | number;
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
    if (typeof val === 'string') {
      const r = RationalFn(val);
      return gmp.mpq_cmp(mpq_t, r.mpq_t);
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

    /** Returns the sum of this number and the given one. */
    add<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number' || isInteger(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_add(n.mpq_t, this.mpq_t, RationalFn(val as number | Integer).mpq_t);
        return n as OutputType<T>;
      }
      if (typeof val === 'string') {
        const n = RationalFn(val);
        gmp.mpq_add(n.mpq_t, this.mpq_t, n.mpq_t);
        return n as OutputType<T>;
      }
      if (isRational(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_add(n.mpq_t, this.mpq_t, (val as Rational).mpq_t);
        return n as OutputType<T>;
      }
      if (isFloat(val)) {
        return (val as Float).add(this) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the difference of this number and the given one. */
    sub<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number' || isInteger(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_sub(n.mpq_t, this.mpq_t, RationalFn(val as number | Integer).mpq_t);
        return n as OutputType<T>;
      }
      if (typeof val === 'string') {
        const n = RationalFn(val);
        gmp.mpq_sub(n.mpq_t, this.mpq_t, n.mpq_t);
        return n as OutputType<T>;
      }
      if (isRational(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_sub(n.mpq_t, this.mpq_t, (val as Rational).mpq_t);
        return n as OutputType<T>;
      }
      if (isFloat(val)) {
        return (val as Float).neg().add(this) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the product of this number and the given one. */
    mul<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number' || isInteger(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_mul(n.mpq_t, this.mpq_t, RationalFn(val as number | Integer).mpq_t);
        return n as OutputType<T>;
      }
      if (typeof val === 'string') {
        const n = RationalFn(val);
        gmp.mpq_mul(n.mpq_t, this.mpq_t, n.mpq_t);
        return n as OutputType<T>;
      }
      if (isRational(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_mul(n.mpq_t, this.mpq_t, (val as Rational).mpq_t);
        return n as OutputType<T>;
      }
      if (isFloat(val)) {
        return (val as Float).mul(this) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the number with inverted sign. */
    neg(): Rational {
      const n = RationalFn(0, 1);
      gmp.mpq_neg(n.mpq_t, this.mpq_t);
      return n;
    },

    /** Returns the inverse of the number. */
    invert(): Rational {
      const n = RationalFn(0, 1);
      gmp.mpq_inv(n.mpq_t, this.mpq_t);
      return n;
    },

    /** Returns the absolute value of this number. */
    abs(): Rational {
      const n = RationalFn(0, 1);
      gmp.mpq_abs(n.mpq_t, this.mpq_t);
      return n;
    },

    /** Returns the result of the division of this number by the given one. */
    div<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number' || isInteger(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_div(n.mpq_t, this.mpq_t, RationalFn(val as number | Integer).mpq_t);
        return n as OutputType<T>;
      }
      if (typeof val === 'string') {
        const n = RationalFn(val);
        gmp.mpq_div(n.mpq_t, this.mpq_t, n.mpq_t);
        return n as OutputType<T>;
      }
      if (isRational(val)) {
        const n = RationalFn(0, 1);
        gmp.mpq_div(n.mpq_t, this.mpq_t, (val as Rational).mpq_t);
        return n as OutputType<T>;
      }
      if (isFloat(val)) {
        return ctx.floatContext.Float(this).div(val) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns true if the current number is equal to the provided number */
    isEqual(val: AllTypes): boolean {
      if (typeof val === 'number' || isInteger(val)) {
        return gmp.mpq_equal(this.mpq_t, RationalFn(val as number | Integer).mpq_t) !== 0;
      }
      if (typeof val === 'string') {
        const n = RationalFn(val);
        return gmp.mpq_equal(this.mpq_t, n.mpq_t) !== 0;
      }
      if (isRational(val)) {
        return gmp.mpq_equal(this.mpq_t, (val as Rational).mpq_t) !== 0;
      }
      if (isFloat(val)) {
        return (val as Float).isEqual(this);
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns true if the current number is less than the provided number */
    lessThan(val: AllTypes): boolean {
      return compare(this.mpq_t, val) < 0;
    },

    /** Returns true if the current number is less than or equal to the provided number */
    lessOrEqual(val: AllTypes): boolean {
      return compare(this.mpq_t, val) <= 0;
    },

    /** Returns true if the current number is greater than the provided number */
    greaterThan(val: AllTypes): boolean {
      return compare(this.mpq_t, val) > 0;
    },

    /** Returns true if the current number is greater than or equal to the provided number */
    greaterOrEqual(val: AllTypes): boolean {
      return compare(this.mpq_t, val) >= 0;
    },

    /** Returns the numerator of the number */
    numerator(): Integer {
      const n = ctx.intContext.Integer() as Integer;
      gmp.mpq_get_num(n.mpz_t, this.mpq_t);
      return n;
    },

    /** Returns the denominator of the number */
    denominator(): Integer {
      const n = ctx.intContext.Integer() as Integer;
      gmp.mpq_get_den(n.mpz_t, this.mpq_t);
      return n;
    },

    /** Returns the sign of the current value (-1 or 0 or 1) */
    sign(): -1 | 0 | 1 {
      return gmp.mpq_sgn(this.mpq_t) as -1 | 0 | 1;
    },

    /** Converts current value to a JavaScript number */
    toNumber(): number {
      return gmp.mpq_get_d(this.mpq_t);
    },

    /** Converts the number to string */
    toString(radix: number = 10): string {
      if (!Number.isSafeInteger(radix) || radix < 2 || radix > 62) {
        throw new Error('radix must have a value between 2 and 62');
      }
      return gmp.mpq_to_string(this.mpq_t, radix);
    },

    /** Converts the number to an integer */
    toInteger(): Integer {
      return ctx.intContext.Integer(this);
    },

    /** Converts the number to a floating-point number */
    toFloat(): Float {
      return ctx.floatContext.Float(this);
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
    const res = gmp.mpq_set_string(mpq_t, finalString, 10);
    if (res !== 0) {
      throw new Error('Invalid number provided!');
    }
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
