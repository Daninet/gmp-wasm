import type { GMPFunctions } from './functions';
import { Float } from './float';
import { Rational } from './rational';
import {assertArray, assertInt32, assertUint32, assertValidRadix} from './util';

const decoder = new TextDecoder();

type IntegerFactoryReturn = ReturnType<typeof getIntegerContext>['Integer'];
export interface IntegerFactory extends IntegerFactoryReturn {};
type IntegerReturn = ReturnType<IntegerFactoryReturn>;
export interface Integer extends IntegerReturn {};

// these should not be exported
type AllTypes = Integer | Rational | Float | string | number;
type OutputType<T> = 
  T extends number ? Integer :
  T extends Integer ? Integer :
  T extends Rational ? Rational :
  T extends Float ? Float :
  never;

export enum DivMode {
  CEIL = 0,
  FLOOR = 1,
  TRUNCATE = 2,
};

const INVALID_PARAMETER_ERROR = 'Invalid parameter!';

export function getIntegerContext(gmp: GMPFunctions, ctx: any) {
  const mpz_t_arr: number[] = [];

  const isInteger = (val): boolean => ctx.intContext.isInteger(val);
  const isRational = (val): boolean => ctx.rationalContext.isRational(val);
  const isFloat = (val): boolean => ctx.floatContext.isFloat(val);

  const compare = (mpz_t: number, val: AllTypes): number => {
    if (typeof val === 'number') {
      assertInt32(val);
      return gmp.mpz_cmp_si(mpz_t, val);
    }
    if (typeof val === 'string') {
      const i = IntegerFn(val);
      return gmp.mpz_cmp(mpz_t, i.mpz_t);
    }
    if (isInteger(val)) {
      return gmp.mpz_cmp(mpz_t, (val as Integer).mpz_t);
    }
    if (isRational(val)) {
      return -gmp.mpq_cmp_z((val as Rational).mpq_t, mpz_t);
    }
    if (isFloat(val)) {
      return -gmp.mpfr_cmp_z((val as Float).mpfr_t, mpz_t);
    }
    throw new Error(INVALID_PARAMETER_ERROR);
  }

  const IntPrototype = {
    mpz_t: 0,
    type: 'integer',

    /** Returns the sum of this number and the given one. */
    add<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number') {
        assertInt32(val);
        const n = IntegerFn();
        if (val < 0) {
          gmp.mpz_sub_ui(n.mpz_t, this.mpz_t, -val);
        } else {
          gmp.mpz_add_ui(n.mpz_t, this.mpz_t, val);
        }
        return n as OutputType<T>;
      }
      if (typeof val === 'string') {
        const n = IntegerFn(val);
        gmp.mpz_add(n.mpz_t, this.mpz_t, n.mpz_t);
        return n as OutputType<T>;
      }
      if (isInteger(val)) {
        const n = IntegerFn();
        gmp.mpz_add(n.mpz_t, this.mpz_t, (val as Integer).mpz_t);
        return n as OutputType<T>;
      }
      if (isRational(val) || isFloat(val)) {
        return val.add(this) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the difference of this number and the given one. */
    sub<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number') {
        const n = IntegerFn();
        assertInt32(val);
        if (val < 0) {
          gmp.mpz_add_ui(n.mpz_t, this.mpz_t, -val);
        } else {
          gmp.mpz_sub_ui(n.mpz_t, this.mpz_t, val);
        }
        return n as OutputType<T>;
      }
      if (typeof val === 'string') {
        const n = IntegerFn(val);
        gmp.mpz_sub(n.mpz_t, this.mpz_t, n.mpz_t);
        return n as OutputType<T>;
      }
      if (isInteger(val)) {
        const n = IntegerFn();
        gmp.mpz_sub(n.mpz_t, this.mpz_t, (val as Integer).mpz_t);
        return n as OutputType<T>;
      }
      if (isRational(val) || isFloat(val)) {
        return val.neg().add(this) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the product of this number and the given one. */
    mul<T extends AllTypes>(val: T): OutputType<T> {
      if (typeof val === 'number') {
        const n = IntegerFn();
        assertInt32(val);
        gmp.mpz_mul_si(n.mpz_t, this.mpz_t, val);
        return n as OutputType<T>;
      }
      if (typeof val === 'string') {
        const n = IntegerFn(val);
        gmp.mpz_mul(n.mpz_t, this.mpz_t, n.mpz_t);
        return n as OutputType<T>;
      }
      if (isInteger(val)) {
        const n = IntegerFn();
        gmp.mpz_mul(n.mpz_t, this.mpz_t, (val as Integer).mpz_t);
        return n as OutputType<T>;
      }
      if (isRational(val) || isFloat(val)) {
        return val.mul(this) as OutputType<T>;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the number with inverted sign. */
    neg(): Integer {
      const n = IntegerFn();
      gmp.mpz_neg(n.mpz_t, this.mpz_t);
      return n;
    },

    /** Returns the absolute value of this number. */
    abs(): Integer {
      const n = IntegerFn();
      gmp.mpz_abs(n.mpz_t, this.mpz_t);
      return n;
    },

    /** Returns the result of the division of this number by the given one. */
    div<T extends AllTypes>(val: T, mode = DivMode.CEIL): OutputType<T> {
      if (typeof val === 'number') {
        const n = IntegerFn(this);
        assertInt32(val);
        if (val < 0) {
          gmp.mpz_neg(n.mpz_t, n.mpz_t);
          val = -val as T;
        }
        if (mode === DivMode.CEIL) {
          gmp.mpz_cdiv_q_ui(n.mpz_t, n.mpz_t, val as number);
        } else if (mode === DivMode.FLOOR) {
          gmp.mpz_fdiv_q_ui(n.mpz_t, n.mpz_t, val as number);
        } else if (mode === DivMode.TRUNCATE) {
          gmp.mpz_tdiv_q_ui(n.mpz_t, n.mpz_t, val as number);
        }
        return n as OutputType<T>;
      }
      if (typeof val === 'string' || isInteger(val)) {
        const n = IntegerFn(this);
        const intVal = typeof val === 'string' ? IntegerFn(val) : val as Integer;

        if (mode === DivMode.CEIL) {
          gmp.mpz_cdiv_q(n.mpz_t, this.mpz_t, intVal.mpz_t);
        } else if (mode === DivMode.FLOOR) {
          gmp.mpz_fdiv_q(n.mpz_t, this.mpz_t, intVal.mpz_t);
        } else if (mode === DivMode.TRUNCATE) {
          gmp.mpz_tdiv_q(n.mpz_t, this.mpz_t, intVal.mpz_t);
        }
        return n as OutputType<T>;
      }
      if (isRational(val)) {
        return (val as Rational).invert().mul(this) as OutputType<T>;
      }
      if (isFloat(val)) {
        return ctx.floatContext.Float(this).div(val);
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns this number exponentiated to the given value. */
    pow(exp: Rational | Integer | number, mod?: Integer | number): Integer {
      if (typeof exp === 'number') {
        const n = IntegerFn();
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
        return n;
      }
      if (isInteger(exp)) {
        const n = IntegerFn();
        if (mod !== undefined) {
          if (typeof mod === 'number') {
            assertUint32(mod);
            gmp.mpz_powm(n.mpz_t, this.mpz_t, (exp as Integer).mpz_t, IntegerFn(mod).mpz_t);
          } else {
            gmp.mpz_powm(n.mpz_t, this.mpz_t, (exp as Integer).mpz_t, mod.mpz_t);
          }
        } else {
          const expNum = exp.toNumber();
          assertUint32(expNum);
          gmp.mpz_pow_ui(n.mpz_t, this.mpz_t, expNum);
        }
        return n;
      }
      if (isRational(exp) && mod === undefined) {
        const n = IntegerFn();
        const numerator = (exp as Rational).numerator().toNumber();
        assertUint32(numerator);
        const denominator = (exp as Rational).denominator().toNumber();
        assertUint32(denominator);
        gmp.mpz_pow_ui(n.mpz_t, this.mpz_t, numerator);
        gmp.mpz_root(n.mpz_t, n.mpz_t, denominator);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the integer square root number of this number, rounded down. */
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

    isPrime(reps: number = 20): boolean | 'probably-prime' {
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

    /** Returns the greatest common divisor of this number and the given one. */
    gcd(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_gcd_ui(n.mpz_t, this.mpz_t, val);
        return n;
      }
      if (isInteger(val)) {
        gmp.mpz_gcd(n.mpz_t, this.mpz_t, val.mpz_t);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    lcm(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_lcm_ui(n.mpz_t, this.mpz_t, val);
        return n;
      }
      if (isInteger(val)) {
        gmp.mpz_lcm(n.mpz_t, this.mpz_t, val.mpz_t);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    complement1(): Integer {
      const n = IntegerFn();
      gmp.mpz_com(n.mpz_t, this.mpz_t);
      return n;
    },

    complement2(): Integer {
      const n = IntegerFn();
      gmp.mpz_com(n.mpz_t, this.mpz_t);
      gmp.mpz_add_ui(n.mpz_t, n.mpz_t, 1);
      return n;
    },

    /** Returns the integer bitwise-and combined with another integer. */
    and(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_and(n.mpz_t, this.mpz_t, IntegerFn(val).mpz_t);
        return n;
      }
      if (isInteger(val)) {
        gmp.mpz_and(n.mpz_t, this.mpz_t, val.mpz_t);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the integer bitwise-or combined with another integer. */
    or(val: Integer | number): Integer {
      const n = IntegerFn();
      if (typeof val === 'number') {
        assertUint32(val);
        gmp.mpz_ior(n.mpz_t, this.mpz_t, IntegerFn(val).mpz_t);
        return n;
      }
      if (isInteger(val)) {
        gmp.mpz_ior(n.mpz_t, this.mpz_t, val.mpz_t);
        return n;
      }
      throw new Error(INVALID_PARAMETER_ERROR);
    },

    /** Returns the integer bitwise-xor combined with another integer. */
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

    /** Returns the integer left shifted by a given number of bits. */
    shiftLeft(val: number): Integer {
      assertUint32(val);
      const n = IntegerFn();
      gmp.mpz_mul_2exp(n.mpz_t, this.mpz_t, val);
      return n;
    },

    /** Returns the integer right shifted by a given number of bits. */
    shiftRight(val: number): Integer {
      assertUint32(val);
      const n = IntegerFn();
      gmp.mpz_fdiv_q_2exp(n.mpz_t, this.mpz_t, val);
      return n;
    },

    /** Sets the value of bit i to 1. The least significant bit is number 0 */
    setBit(i: number): Integer {
      const n = IntegerFn(this);
      assertUint32(i);
      gmp.mpz_setbit(n.mpz_t, i);
      return n;
    },

    /** Sets the value of multiple bits to 1. The least significant bit is number 0 */
    setBits(indices: number[]): Integer {
      const n = IntegerFn(this);
      assertArray(indices);
      indices.forEach(i => {
        assertUint32(i);
        gmp.mpz_setbit(n.mpz_t, i);
      });
      return n;
    },

    /** Sets the value of bit i to 0. The least significant bit is number 0 */
    clearBit(index: number): Integer {
      const n = IntegerFn(this);
      assertUint32(index);
      gmp.mpz_clrbit(n.mpz_t, index);
      return n;
    },

    /** Sets the value of multiple bits to 0. The least significant bit is number 0 */
    clearBits(indices: number[]): Integer {
      const n = IntegerFn(this);
      assertArray(indices);
      indices.forEach(i => {
        assertUint32(i);
        gmp.mpz_clrbit(n.mpz_t, i);
      });
      return n;
    },

    /** Inverts the value of bit i. The least significant bit is number 0 */
    flipBit(index: number): Integer {
      const n = IntegerFn(this);
      assertUint32(index);
      gmp.mpz_combit(n.mpz_t, index);
      return n;
    },

    /** Inverts the value of multiple bits. The least significant bit is number 0 */
    flipBits(indices: number[]): Integer {
      const n = IntegerFn(this);
      assertArray(indices);
      indices.forEach(i => {
        assertUint32(i);
        gmp.mpz_combit(n.mpz_t, i);
      });
      return n;
    },

    /** Returns 0 or 1 based on the value of a bit at the provided index. The least significant bit is number 0 */
    getBit(index: number): number {
      assertUint32(index);
      return gmp.mpz_tstbit(this.mpz_t, index);
    },

    // Returns the position of the most significant bit. The least significant bit is number 0.
    msbPosition() {
      return gmp.mpz_sizeinbase(this.mpz_t, 2) - 1;
    },

    /** Works similarly to JS Array.slice() but on bits. The least significant bit is number 0 */
    sliceBits(start?: number, end?: number): Integer {
      if (start === undefined) start = 0;
      assertInt32(start);
      const msb = gmp.mpz_sizeinbase(this.mpz_t, 2);
      if (start < 0) start = msb + start;
      start = Math.max(0, start);
      if (end === undefined) end = msb + 1;
      assertInt32(end);
      if (end < 0) end = msb + end;
      end = Math.min(msb + 1, end);
      if (start >= end) return IntegerFn(0);
      const n = IntegerFn(1);
      if (end < msb + 1) {
        gmp.mpz_mul_2exp(n.mpz_t, n.mpz_t, end);
        gmp.mpz_sub_ui(n.mpz_t, n.mpz_t, 1);
        gmp.mpz_and(n.mpz_t, this.mpz_t, n.mpz_t);
        gmp.mpz_fdiv_q_2exp(n.mpz_t, n.mpz_t, start);
      } else {
        gmp.mpz_fdiv_q_2exp(n.mpz_t, this.mpz_t, start);
      }
      return n;
    },

    /** Creates new integer with the copy of binary representation of num to position offset. Optionally bitCount can be used to zero-pad the number to a specific number of bits. The least significant bit is number 0 */
    writeTo(num: Integer, offset = 0, bitCount?: number) {
      assertUint32(offset);
      if (!isInteger(num)) throw new Error('Only Integers are supported');
      if (bitCount === undefined) {
        bitCount = gmp.mpz_sizeinbase(num.mpz_t, 2);
      }
      assertUint32(bitCount);
      const aux = IntegerFn();
      const n = IntegerFn();
      gmp.mpz_fdiv_q_2exp(n.mpz_t, this.mpz_t, offset + bitCount);
      gmp.mpz_mul_2exp(n.mpz_t, n.mpz_t, bitCount);
      gmp.mpz_tdiv_r_2exp(aux.mpz_t, num.mpz_t, bitCount);
      gmp.mpz_ior(n.mpz_t, n.mpz_t, aux.mpz_t);
      gmp.mpz_tdiv_r_2exp(aux.mpz_t, this.mpz_t, offset);
      gmp.mpz_mul_2exp(n.mpz_t, n.mpz_t, offset);
      gmp.mpz_ior(n.mpz_t, n.mpz_t, aux.mpz_t);
      return n;
    },

    isEqual(val: AllTypes): boolean {
      return compare(this.mpz_t, val) === 0;
    },

    lessThan(val: AllTypes): boolean {
      return compare(this.mpz_t, val) < 0;
    },

    lessOrEqual(val: AllTypes): boolean {
      return compare(this.mpz_t, val) <= 0;
    },

    greaterThan(val: AllTypes): boolean {
      return compare(this.mpz_t, val) > 0;
    },

    greaterOrEqual(val: AllTypes): boolean {
      return compare(this.mpz_t, val) >= 0;
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

    /** Exports integer into an Uint8Array. Sign is ignored. */
    toBuffer(littleEndian = false): Uint8Array {
      const countPtr = gmp.malloc(4);
      const startptr = gmp.mpz_export(0, countPtr, littleEndian ? -1 : 1, 1, 1, 0, this.mpz_t);
      const size = gmp.memView.getUint32(countPtr, true);
      const endptr = startptr + size;
      const buf = gmp.mem.slice(startptr, endptr);
      gmp.free(startptr);
      gmp.free(countPtr);
      return buf;
    },

    toString(radix: number = 10) {
      if (!Number.isSafeInteger(radix) || radix < 2 || radix > 62) {
        throw new Error('radix must have a value between 2 and 62');
      }
      const strptr = gmp.mpz_get_str(0, radix, this.mpz_t);
      const endptr = gmp.mem.indexOf(0, strptr);
      const str = decoder.decode(gmp.mem.subarray(strptr, endptr));
      gmp.free(strptr);
      return str;
    },

    toRational(): Rational {
      return ctx.rationalContext.Rational(this);
    },

    toFloat(): Float {
      return ctx.floatContext.Float(this);
    },
  };

  const IntegerFn = (num?: string | number | Integer | Uint8Array | Rational | Float, radix: number = 10) => {
    const instance = Object.create(IntPrototype) as typeof IntPrototype;
    instance.mpz_t = gmp.mpz_t();

    if (num === undefined) {
      gmp.mpz_init(instance.mpz_t);
    } else if (typeof num === 'string') {
      assertValidRadix(radix);
      const strPtr = gmp.malloc_cstr(num);
      const res = gmp.mpz_init_set_str(instance.mpz_t, strPtr, radix);
      gmp.free(strPtr);
      if (res !== 0) {
        throw new Error('Invalid number provided!');
      }
    } else if (typeof num === 'number') {
      assertInt32(num);
      gmp.mpz_init_set_si(instance.mpz_t, num);
    } else if (isInteger(num)) {
      gmp.mpz_init_set(instance.mpz_t, (num as Integer).mpz_t);
    } else if (ArrayBuffer.isView(num)) {
      if (!(num instanceof Uint8Array)) {
        throw new Error('Only Uint8Array is supported!');
      }
      const wasmBufPtr = gmp.malloc(num.length);
      gmp.mem.set(num, wasmBufPtr);
      gmp.mpz_import(instance.mpz_t, num.length, 1, 1, 1, 0, wasmBufPtr);
      gmp.free(wasmBufPtr);
    } else if (isRational(num)) {
      const f = ctx.floatContext.Float(num);
      gmp.mpfr_get_z(instance.mpz_t, f.mpfr_t, 0);
    } else if (isFloat(num)) {
      gmp.mpfr_get_z(instance.mpz_t, (num as Float).mpfr_t, (num as Float).rndMode);
    } else {
      gmp.mpz_t_free(instance.mpz_t);
      throw new Error('Invalid value for the Integer type!');
    }

    mpz_t_arr.push(instance.mpz_t);

    return instance;
  };

  return {
    Integer: IntegerFn,
    isInteger: (val) => IntPrototype.isPrototypeOf(val),
    destroy: () => {
      for (let i = mpz_t_arr.length - 1; i >= 0; i--) {
        gmp.mpz_clear(mpz_t_arr[i]);
        gmp.mpz_t_free(mpz_t_arr[i]);
      }
      mpz_t_arr.length = 0;
    }
  };
};
