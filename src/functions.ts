import {
  mpz_ptr,
  mpz_srcptr,
  mpfr_ptr,
  mpfr_srcptr,
  mpq_ptr,
  mpq_srcptr,
  mp_bitcnt_t,
  gmp_randstate_t,
  __gmp_randstate_struct_ptr,
  c_unsigned_long_int,
  c_void_ptr,
  c_str_ptr,
  c_int,
  c_int_ptr,
  c_long_ptr,
  c_double,
  c_signed_long_int,
  c_signed_long_int_ptr,
  c_size_t,
  c_size_t_ptr,
  mp_limb_t,
  mp_srcptr,
  mp_size_t,
  mpfr_prec_t,
  mpfr_flags_t,
  mpfr_ptr_ptr,
  mp_ptr,
  mpfr_exp_t_ptr,
  c_str_ptr_ptr,
  mpfr_exp_t,
  mpfr_t,
  mpfr_prec_t_ptr,
  mpfr_rnd_t,
  mpfr_flags,
  mpfr_free_cache_t,
} from './bindingTypes';

import { getBinding } from './bindingWASM';

export type mpz_ptr = number;
export type mpz_srcptr = number;

export type mpfr_ptr = number;
export type mpfr_srcptr = number;

export type mpq_ptr = number;
export type mpq_srcptr = number;

export type mp_bitcnt_t = number;

export type gmp_randstate_t = number;
export type __gmp_randstate_struct_ptr = number;
export type c_unsigned_long_int = number;
export type c_void_ptr = number;
export type c_str_ptr = number;
export type c_int = number;
export type c_int_ptr = number;
export type c_long_ptr = number;
export type c_double = number;
export type c_signed_long_int = number;
export type c_signed_long_int_ptr = number;
export type c_size_t = number;
export type c_size_t_ptr = number;
export type mp_limb_t = number;
export type mp_srcptr = number;
export type mp_size_t = number;
export type mpfr_prec_t = number;
export type mpfr_flags_t = number;
export type mpfr_ptr_ptr = number;
export type mp_ptr = number;
export type mpfr_exp_t_ptr = number;
export type c_str_ptr_ptr = number;

export type mpfr_exp_t = number;
export type mpfr_t = number;
export type mpfr_prec_t_ptr = number;

export enum mpfr_rnd_t {
  /** Round to nearest, with ties to even */
  MPFR_RNDN = 0,
  /** Round toward zero */
  MPFR_RNDZ = 1,
  /** Round toward +Inf */
  MPFR_RNDU = 2,
  /** Round toward -Inf */
  MPFR_RNDD = 3,
  /** Round away from zero */
  MPFR_RNDA = 4,
  /** (Experimental) Faithful rounding */
  MPFR_RNDF = 5,
  /** (Experimental) Round to nearest, with ties away from zero (mpfr_round) */
  MPFR_RNDNA = -1,
};

export enum mpfr_flags {
  MPFR_FLAGS_UNDERFLOW = 1,
  MPFR_FLAGS_OVERFLOW = 2,
  MPFR_FLAGS_NAN = 4,
  MPFR_FLAGS_INEXACT = 8,
  MPFR_FLAGS_ERANGE = 16,
  MPFR_FLAGS_DIVBY0 = 32,
  MPFR_FLAGS_ALL = 1 | 2 | 4 | 8 | 16 | 32,
};

export enum mpfr_free_cache_t {
  MPFR_FREE_LOCAL_CACHE  = 1,  /* 1 << 0 */
  MPFR_FREE_GLOBAL_CACHE = 2   /* 1 << 1 */
};

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
type GMPFunctionsType = Awaited<ReturnType<typeof getGMPInterface>>;
export interface GMPFunctions extends GMPFunctionsType {}

const encoder = new TextEncoder();

export async function getGMPInterface() {
  let gmp = await getBinding();

  return {
    reset: async () => { gmp = await getBinding(true); },
    malloc: (size: c_size_t): c_void_ptr => gmp.g_malloc(size),
    malloc_cstr: (str: string): number => {
      const buf = encoder.encode(str);
      const ptr = gmp.g_malloc(buf.length + 1);
      gmp.heap.HEAP8.set(buf, ptr);
      gmp.heap.HEAP8[ptr + buf.length] = 0;
      return ptr;
    },
    free: (ptr: c_void_ptr): void => gmp.g_free(ptr),
    get mem() { return gmp.heap.HEAP8 as Uint8Array },
    get memView() { return new DataView(gmp.heap.HEAP8.buffer, gmp.heap.HEAP8.byteOffset, gmp.heap.HEAP8.byteLength) },

    /**************** Random number routines.  ****************/
    /** Initialize state with a default algorithm. */
    gmp_randinit_default: (state: gmp_randstate_t): void => { gmp.g_randinit_default(state); },
    /** Initialize state with a linear congruential algorithm X = (aX + c) mod 2^m2exp. */
    gmp_randinit_lc_2exp: (state: gmp_randstate_t, a: mpz_srcptr, c: c_unsigned_long_int, m2exp: mp_bitcnt_t): void => { gmp.g_randinit_lc_2exp(state, a, c, m2exp); },
    /** Initialize state for a linear congruential algorithm as per gmp_randinit_lc_2exp. */
    gmp_randinit_lc_2exp_size: (state: gmp_randstate_t, size: mp_bitcnt_t): c_int => { return gmp.g_randinit_lc_2exp_size(state, size); },
    /** Initialize state for a Mersenne Twister algorithm. */
    gmp_randinit_mt: (state: gmp_randstate_t): void => { gmp.g_randinit_mt(state); },
    /** Initialize rop with a copy of the algorithm and state from op. */
    gmp_randinit_set: (rop: gmp_randstate_t, op: __gmp_randstate_struct_ptr): void => { gmp.g_randinit_set(rop, op); },
    /** Set an initial seed value into state. */
    gmp_randseed: (state: gmp_randstate_t, seed: mpz_srcptr): void => { gmp.g_randseed(state, seed); },
    /** Set an initial seed value into state. */
    gmp_randseed_ui: (state: gmp_randstate_t, seed: c_unsigned_long_int): void => { gmp.g_randseed_ui(state, seed); },
    /** Free all memory occupied by state. */
    gmp_randclear: (state: gmp_randstate_t): void => { gmp.g_randclear(state); },
    /** Generate a uniformly distributed random number of n bits, i.e. in the range 0 to 2^n - 1 inclusive. */
    gmp_urandomb_ui: (state: gmp_randstate_t, n: c_unsigned_long_int): c_unsigned_long_int => { return gmp.g_urandomb_ui(state, n); },
    /** Generate a uniformly distributed random number in the range 0 to n - 1, inclusive. */
    gmp_urandomm_ui: (state: gmp_randstate_t, n: c_unsigned_long_int): c_unsigned_long_int => { return gmp.g_urandomm_ui(state, n); },
    
    /**************** Formatted output routines.  ****************/
    
    /**************** Formatted input routines.  ****************/
    
    /**************** Integer (i.e. Z) routines.  ****************/
    /** Get GMP limb size */
    mp_bits_per_limb: (): number => gmp.z_limb_size(),

    /** Allocates memory for the mpfr_t C struct and returns pointer */
    mpz_t: (): mpz_ptr => gmp.z_t(),
    /** Deallocates memory of a mpfr_t C struct */
    mpz_t_free: (ptr: mpz_ptr): void => { gmp.z_t_free(ptr); },
    /** Deallocates memory of a NULL-terminated list of mpfr_t variables */
    mpz_t_frees: (...ptrs: mpz_ptr[]): void => {
      for (let i = 0; i < ptrs.length; i++) {
        if (!ptrs[i]) return;
        gmp.z_t_free(ptrs[i]);
      }
    },

    /** Set rop to the absolute value of op. */
    mpz_abs: (rop: mpz_ptr, op: mpz_srcptr): void => { gmp.z_abs(rop, op); },
    /** Set rop to op1 + op2. */
    mpz_add: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): void => { gmp.z_add(rop, op1, op2); },
    /** Set rop to op1 + op2. */
    mpz_add_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int): void => { gmp.z_add_ui(rop, op1, op2); },
    /** Set rop to rop + op1 * op2. */
    mpz_addmul: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): void => { gmp.z_addmul(rop, op1, op2); },
    /** Set rop to rop + op1 * op2. */
    mpz_addmul_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int): void => { gmp.z_addmul_ui(rop, op1, op2); },
    /** Set rop to op1 bitwise-and op2. */
    mpz_and: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): void => { gmp.z_and(rop, op1, op2); },
    /** Compute the binomial coefficient n over k and store the result in rop. */
    mpz_bin_ui: (rop: mpz_ptr, n: mpz_srcptr, k: c_unsigned_long_int): void => { gmp.z_bin_ui(rop, n, k); },
    /** Compute the binomial coefficient n over k and store the result in rop. */
    mpz_bin_uiui: (rop: mpz_ptr, n: c_unsigned_long_int, k: c_unsigned_long_int): void => { gmp.z_bin_uiui(rop, n, k); },
    /** Set the quotient q to ceiling(n / d). */
    mpz_cdiv_q: (q: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_cdiv_q(q, n, d); },
    /** Set the quotient q to ceiling(n / 2^b). */
    mpz_cdiv_q_2exp: (q: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t): void => { gmp.z_cdiv_q_2exp(q, n, b); },
    /** Set the quotient q to ceiling(n / d), and return the remainder r = | n - q * d |. */
    mpz_cdiv_q_ui: (q: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_cdiv_q_ui(q, n, d),
    /** Set the quotient q to ceiling(n / d), and set the remainder r to n - q * d. */
    mpz_cdiv_qr: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_cdiv_qr(q, r, n, d); },
    /** Set quotient q to ceiling(n / d), set the remainder r to n - q * d, and return | r |. */
    mpz_cdiv_qr_ui: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_cdiv_qr_ui(q, r, n, d),
    /** Set the remainder r to n - q * d where q = ceiling(n / d). */
    mpz_cdiv_r: (r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_cdiv_r(r, n, d); },
    /** Set the remainder r to n - q * 2^b where q = ceiling(n / 2^b). */
    mpz_cdiv_r_2exp: (r: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t): void => { gmp.z_cdiv_r_2exp(r, n, b); },
    /** Set the remainder r to n - q * d where q = ceiling(n / d), and return | r |. */
    mpz_cdiv_r_ui: (r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_cdiv_r_ui(r, n, d),
    /** Return the remainder | r | where r = n - q * d, and where q = ceiling(n / d). */
    mpz_cdiv_ui: (n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_cdiv_ui(n, d),
    /** Free the space occupied by x. */
    mpz_clear: (x: mpz_ptr): void => { gmp.z_clear(x); },
    /** Free the space occupied by a NULL-terminated list of mpz_t variables. */
    mpz_clears: (...ptrs: mpz_ptr[]): void => {
      for (let i = 0; i < ptrs.length; i++) {
        if (!ptrs[i]) return;
        gmp.z_clear(ptrs[i]);
      }
    },
    /** Clear bit bit_index in rop. */
    mpz_clrbit: (rop: mpz_ptr, bit_index: mp_bitcnt_t): void => { gmp.z_clrbit(rop, bit_index); },
    /** Compare op1 and op2. */
    mpz_cmp: (op1: mpz_srcptr, op2: mpz_srcptr): c_int => gmp.z_cmp(op1, op2),
    /** Compare op1 and op2. */
    mpz_cmp_d: (op1: mpz_srcptr, op2: c_double): c_int => gmp.z_cmp_d(op1, op2),
    /** Compare op1 and op2. */
    mpz_cmp_si: (op1: mpz_srcptr, op2: c_signed_long_int): c_int => gmp.z_cmp_si(op1, op2),
    /** Compare op1 and op2. */
    mpz_cmp_ui: (op1: mpz_srcptr, op2: c_unsigned_long_int): c_int => gmp.z_cmp_ui(op1, op2),
    /** Compare the absolute values of op1 and op2. */
    mpz_cmpabs: (op1: mpz_srcptr, op2: mpz_srcptr): c_int => gmp.z_cmpabs(op1, op2),
    /** Compare the absolute values of op1 and op2. */
    mpz_cmpabs_d: (op1: mpz_srcptr, op2: c_double): c_int => gmp.z_cmpabs_d(op1, op2),
    /** Compare the absolute values of op1 and op2. */
    mpz_cmpabs_ui: (op1: mpz_srcptr, op2: c_unsigned_long_int): c_int => gmp.z_cmpabs_ui(op1, op2),
    /** Set rop to the one’s complement of op. */
    mpz_com: (rop: mpz_ptr, op: mpz_srcptr): void => { gmp.z_com(rop, op); },
    /** Complement bit bitIndex in rop. */
    mpz_combit: (rop: mpz_ptr, bitIndex: mp_bitcnt_t): void => { gmp.z_combit(rop, bitIndex); },
    /** Return non-zero if n is congruent to c modulo d. */
    mpz_congruent_p: (n: mpz_srcptr, c: mpz_srcptr, d: mpz_srcptr): c_int => gmp.z_congruent_p(n, c, d),
    /** Return non-zero if n is congruent to c modulo 2^b. */
    mpz_congruent_2exp_p: (n: mpz_srcptr, c: mpz_srcptr, b: mp_bitcnt_t): c_int => gmp.z_congruent_2exp_p(n, c, b),
    /** Return non-zero if n is congruent to c modulo d. */
    mpz_congruent_ui_p: (n: mpz_srcptr, c: c_unsigned_long_int, d: c_unsigned_long_int): c_int => gmp.z_congruent_ui_p(n, c, d),
    /** Set q to n / d when it is known in advance that d divides n. */
    mpz_divexact: (q: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_divexact(q, n, d); },
    /** Set q to n / d when it is known in advance that d divides n. */
    mpz_divexact_ui: (q: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int): void => { gmp.z_divexact_ui(q, n, d); },
    /** Return non-zero if n is exactly divisible by d. */
    mpz_divisible_p: (n: mpz_srcptr, d: mpz_srcptr): c_int => gmp.z_divisible_p(n, d),
    /** Return non-zero if n is exactly divisible by d. */
    mpz_divisible_ui_p: (n: mpz_srcptr, d: c_unsigned_long_int): c_int => gmp.z_divisible_ui_p(n, d),
    /** Return non-zero if n is exactly divisible by 2^b. */
    mpz_divisible_2exp_p: (n: mpz_srcptr, b: mp_bitcnt_t): c_int => gmp.z_divisible_2exp_p(n, b),
    /** Determine whether op is even. */
    mpz_even_p: (op: mpz_srcptr): void => { gmp.z_even_p(op); },
    /** Fill rop with word data from op. */
    mpz_export: (rop: c_void_ptr, countp: c_size_t_ptr, order: c_int, size: c_size_t, endian: c_int, nails: c_size_t, op: mpz_srcptr): c_void_ptr => gmp.z_export(rop, countp, order, size, endian, nails, op),
    /** Set rop to the factorial n!. */
    mpz_fac_ui: (rop: mpz_ptr, n: c_unsigned_long_int): void => { gmp.z_fac_ui(rop, n); },
    /** Set rop to the double-factorial n!!. */
    mpz_2fac_ui: (rop: mpz_ptr, n: c_unsigned_long_int): void => { gmp.z_2fac_ui(rop, n); },
    /** Set rop to the m-multi-factorial n!^(m)n. */
    mpz_mfac_uiui: (rop: mpz_ptr, n: c_unsigned_long_int, m: c_unsigned_long_int): void => { gmp.z_mfac_uiui(rop, n, m); },
    /** Set rop to the primorial of n, i.e. the product of all positive prime numbers ≤ n. */
    mpz_primorial_ui: (rop: mpz_ptr, n: c_unsigned_long_int): void => { gmp.z_primorial_ui(rop, n); },
    /** Set the quotient q to floor(n / d). */
    mpz_fdiv_q: (q: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_fdiv_q(q, n, d); },
    /** Set the quotient q to floor(n / 2^b). */
    mpz_fdiv_q_2exp: (q: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t): void => { gmp.z_fdiv_q_2exp(q, n, b); },
    /** Set the quotient q to floor(n / d), and return the remainder r = | n - q * d |. */
    mpz_fdiv_q_ui: (q: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_fdiv_q_ui(q, n, d),
    /** Set the quotient q to floor(n / d), and set the remainder r to n - q * d. */
    mpz_fdiv_qr: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_fdiv_qr(q, r, n, d); },
    /** Set quotient q to floor(n / d), set the remainder r to n - q * d, and return | r |. */
    mpz_fdiv_qr_ui: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_fdiv_qr_ui(q, r, n, d),
    /** Set the remainder r to n - q * d where q = floor(n / d). */
    mpz_fdiv_r: (r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_fdiv_r(r, n, d); },
    /** Set the remainder r to n - q * 2^b where q = floor(n / 2^b). */
    mpz_fdiv_r_2exp: (r: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t): void => { gmp.z_fdiv_r_2exp(r, n, b); },
    /** Set the remainder r to n - q * d where q = floor(n / d), and return | r |. */
    mpz_fdiv_r_ui: (r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_fdiv_r_ui(r, n, d),
    /** Return the remainder | r | where r = n - q * d, and where q = floor(n / d). */
    mpz_fdiv_ui: (n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_fdiv_ui(n, d),
    /** Sets fn to to F[n], the n’th Fibonacci number. */
    mpz_fib_ui: (fn: mpz_ptr, n: c_unsigned_long_int): void => { gmp.z_fib_ui(fn, n); },
    /** Sets fn to F[n], and fnsub1 to F[n - 1]. */
    mpz_fib2_ui: (fn: mpz_ptr, fnsub1: mpz_ptr, n: c_unsigned_long_int): void => { gmp.z_fib2_ui(fn, fnsub1, n); },
    /** Return non-zero iff the value of op fits in a signed 32-bit integer. Otherwise, return zero. */
    mpz_fits_sint_p: (op: mpz_srcptr): c_int => gmp.z_fits_sint_p(op),
    /** Return non-zero iff the value of op fits in a signed 32-bit integer. Otherwise, return zero. */
    mpz_fits_slong_p: (op: mpz_srcptr): c_int => gmp.z_fits_slong_p(op),
    /** Return non-zero iff the value of op fits in a signed 16-bit integer. Otherwise, return zero. */
    mpz_fits_sshort_p: (op: mpz_srcptr): c_int => gmp.z_fits_sshort_p(op),
    /** Return non-zero iff the value of op fits in an unsigned 32-bit integer. Otherwise, return zero. */
    mpz_fits_uint_p: (op: mpz_srcptr): c_int => gmp.z_fits_uint_p(op),
    /** Return non-zero iff the value of op fits in an unsigned 32-bit integer. Otherwise, return zero. */
    mpz_fits_ulong_p: (op: mpz_srcptr): c_int => gmp.z_fits_ulong_p(op),
    /** Return non-zero iff the value of op fits in an unsigned 16-bit integer. Otherwise, return zero. */
    mpz_fits_ushort_p: (op: mpz_srcptr): c_int => gmp.z_fits_ushort_p(op),
    /** Set rop to the greatest common divisor of op1 and op2. */
    mpz_gcd: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): void => { gmp.z_gcd(rop, op1, op2); },
    /** Compute the greatest common divisor of op1 and op2. If rop is not null, store the result there. */
    mpz_gcd_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int): c_unsigned_long_int => gmp.z_gcd_ui(rop, op1, op2),
    /** Set g to the greatest common divisor of a and b, and in addition set s and t to coefficients satisfying a * s + b * t = g. */
    mpz_gcdext: (g: mpz_ptr, s: mpz_ptr, t: mpz_ptr, a: mpz_srcptr, b: mpz_srcptr): void => { gmp.z_gcdext(g, s, t, a, b); },
    /** Convert op to a double, truncating if necessary (i.e. rounding towards zero). */
    mpz_get_d: (op: mpz_srcptr): c_double => gmp.z_get_d(op),
    /** Convert op to a double, truncating if necessary (i.e. rounding towards zero), and returning the exponent separately. */
    mpz_get_d_2exp: (exp: c_signed_long_int_ptr, op: mpz_srcptr): c_double => gmp.z_get_d_2exp(exp, op),
    /** Return the value of op as an signed long. */
    mpz_get_si: (op: mpz_srcptr): c_signed_long_int => gmp.z_get_si(op),
    /** Convert op to a string of digits in base base. */
    mpz_get_str: (str: c_str_ptr, base: c_int, op: mpz_srcptr): c_str_ptr => gmp.z_get_str(str, base, op),
    /** Return the value of op as an unsigned long. */
    mpz_get_ui: (op: mpz_srcptr): c_unsigned_long_int => gmp.z_get_ui(op),
    /** Return limb number n from op. */
    mpz_getlimbn: (op: mpz_srcptr, n: mp_size_t): mp_limb_t => gmp.z_getlimbn(op, n),
    /** Return the hamming distance between the two operands. */
    mpz_hamdist: (op1: mpz_srcptr, op2: mpz_srcptr): mp_bitcnt_t => gmp.z_hamdist(op1, op2),
    /** Set rop from an array of word data at op. */
    mpz_import: (rop: mpz_ptr, count: c_size_t, order: c_int, size: c_size_t, endian: c_int, nails: c_size_t, op: c_void_ptr): void => { gmp.z_import(rop, count, order, size, endian, nails, op); },
    /** Initialize x, and set its value to 0. */
    mpz_init: (x: mpz_ptr): void => { gmp.z_init(x); },
    /** Initialize a NULL-terminated list of mpz_t variables, and set their values to 0. */
    mpz_inits: (...ptrs: mpz_ptr[]): void => {
      for (let i = 0; i < ptrs.length; i++) {
        if (!ptrs[i]) return;
        gmp.z_init(ptrs[i]);
      }
    },
    /** Initialize x, with space for n-bit numbers, and set its value to 0. */
    mpz_init2: (x: mpz_ptr, n: mp_bitcnt_t): void => { gmp.z_init2(x, n); },
    /** Initialize rop with limb space and set the initial numeric value from op. */
    mpz_init_set: (rop: mpz_ptr, op: mpz_srcptr): void => { gmp.z_init_set(rop, op); },
    /** Initialize rop with limb space and set the initial numeric value from op. */
    mpz_init_set_d: (rop: mpz_ptr, op: c_double): void => { gmp.z_init_set_d(rop, op); },
    /** Initialize rop with limb space and set the initial numeric value from op. */
    mpz_init_set_si: (rop: mpz_ptr, op: c_signed_long_int): void => { gmp.z_init_set_si(rop, op); },
    /** Initialize rop and set its value like mpz_set_str. */
    mpz_init_set_str: (rop: mpz_ptr, str: c_str_ptr, base: c_int): c_int => gmp.z_init_set_str(rop, str, base),
    /** Initialize rop with limb space and set the initial numeric value from op. */
    mpz_init_set_ui: (rop: mpz_ptr, op: c_unsigned_long_int): void => { gmp.z_init_set_ui(rop, op); },
    /** Compute the inverse of op1 modulo op2 and put the result in rop. */
    mpz_invert: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): c_int => gmp.z_invert(rop, op1, op2),
    /** Set rop to op1 bitwise inclusive-or op2. */
    mpz_ior: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): void => { gmp.z_ior(rop, op1, op2); },
    /** Calculate the Jacobi symbol (a/b). */
    mpz_jacobi: (a: mpz_srcptr, b: mpz_srcptr): c_int => gmp.z_jacobi(a, b),
    /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
    mpz_kronecker: (a: mpz_srcptr, b: mpz_srcptr): c_int => gmp.z_kronecker(a, b),
    /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
    mpz_kronecker_si: (a: mpz_srcptr, b: c_signed_long_int): c_int => gmp.z_kronecker_si(a, b),
    /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
    mpz_kronecker_ui: (a: mpz_srcptr, b: c_unsigned_long_int): c_int => gmp.z_kronecker_ui(a, b),
    /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
    mpz_si_kronecker: (a: c_signed_long_int, b: mpz_srcptr): c_int => gmp.z_si_kronecker(a, b),
    /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
    mpz_ui_kronecker: (a: c_unsigned_long_int, b: mpz_srcptr): c_int => gmp.z_ui_kronecker(a, b),
    /** Set rop to the least common multiple of op1 and op2. */
    mpz_lcm: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): void => { gmp.z_lcm(rop, op1, op2); },
    /** Set rop to the least common multiple of op1 and op2. */
    mpz_lcm_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int): void => { gmp.z_lcm_ui(rop, op1, op2); },
    /** Calculate the Legendre symbol (a/p). */
    mpz_legendre: (a: mpz_srcptr, p: mpz_srcptr): c_int => gmp.z_legendre(a, p),
    /** Sets ln to to L[n], the n’th Lucas number. */
    mpz_lucnum_ui: (ln: mpz_ptr, n: c_unsigned_long_int): void => { gmp.z_lucnum_ui(ln, n); },
    /** Sets ln to L[n], and lnsub1 to L[n - 1]. */
    mpz_lucnum2_ui: (ln: mpz_ptr, lnsub1: mpz_ptr, n: c_unsigned_long_int): void => { gmp.z_lucnum2_ui(ln, lnsub1, n); },
    /** An implementation of the probabilistic primality test found in Knuth's Seminumerical Algorithms book. */
    mpz_millerrabin: (n: mpz_srcptr, reps: c_int): c_int => gmp.z_millerrabin(n, reps),
    /** Set r to n mod d. */
    mpz_mod: (r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_mod(r, n, d); },
    /** Set r to n mod d. */
    mpz_mod_ui: (r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_mod_ui(r, n, d); },
    /** Set rop to op1 * op2. */
    mpz_mul: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): void => { gmp.z_mul(rop, op1, op2); },
    /** Set rop to op1 * 2^op2. */
    mpz_mul_2exp: (rop: mpz_ptr, op1: mpz_srcptr, op2: mp_bitcnt_t): void => { gmp.z_mul_2exp(rop, op1, op2); },
    /** Set rop to op1 * op2. */
    mpz_mul_si: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_signed_long_int): void => { gmp.z_mul_si(rop, op1, op2); },
    /** Set rop to op1 * op2. */
    mpz_mul_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int): void => { gmp.z_mul_ui(rop, op1, op2); },
    /** Set rop to -op. */
    mpz_neg: (rop: mpz_ptr, op: mpz_srcptr): void => { gmp.z_neg(rop, op); },
    /** Set rop to the next prime greater than op. */
    mpz_nextprime: (rop: mpz_ptr, op: mpz_srcptr): void => { gmp.z_nextprime(rop, op); },
    /** Determine whether op is odd. */
    mpz_odd_p: (op: mpz_srcptr): void => { gmp.z_odd_p(op); },
    /** Return non-zero if op is a perfect power, i.e., if there exist integers a and b, with b > 1, such that op = a^b. */
    mpz_perfect_power_p: (op: mpz_srcptr): c_int => gmp.z_perfect_power_p(op),
    /** Return non-zero if op is a perfect square, i.e., if the square root of op is an integer. */
    mpz_perfect_square_p: (op: mpz_srcptr): c_int => gmp.z_perfect_square_p(op),
    /** Return the population count of op. */
    mpz_popcount: (op: mpz_srcptr): mp_bitcnt_t => gmp.z_popcount(op),
    /** Set rop to base^exp. The case 0^0 yields 1. */
    mpz_pow_ui: (rop: mpz_ptr, base: mpz_srcptr, exp: c_unsigned_long_int): void => { gmp.z_pow_ui(rop, base, exp); },
    /** Set rop to (base^exp) modulo mod. */
    mpz_powm: (rop: mpz_ptr, base: mpz_srcptr, exp: mpz_srcptr, mod: mpz_srcptr): void => { gmp.z_powm(rop, base, exp, mod); },
    /** Set rop to (base^exp) modulo mod. */
    mpz_powm_sec: (rop: mpz_ptr, base: mpz_srcptr, exp: mpz_srcptr, mod: mpz_srcptr): void => { gmp.z_powm_sec(rop, base, exp, mod); },
    /** Set rop to (base^exp) modulo mod. */
    mpz_powm_ui: (rop: mpz_ptr, base: mpz_srcptr, exp: c_unsigned_long_int, mod: mpz_srcptr): void => { gmp.z_powm_ui(rop, base, exp, mod); },
    /** Determine whether n is prime. */
    mpz_probab_prime_p: (n: mpz_srcptr, reps: c_int): c_int => gmp.z_probab_prime_p(n, reps),
    /** Generate a random integer of at most maxSize limbs. */
    mpz_random: (rop: mpz_ptr, maxSize: mp_size_t): void => { gmp.z_random(rop, maxSize); },
    /** Generate a random integer of at most maxSize limbs, with long strings of zeros and ones in the binary representation. */
    mpz_random2: (rop: mpz_ptr, maxSize: mp_size_t): void => { gmp.z_random2(rop, maxSize); },
    /** Change the space allocated for x to n bits. */
    mpz_realloc2: (x: mpz_ptr, n: mp_bitcnt_t): void => { gmp.z_realloc2(x, n); },
    /** Remove all occurrences of the factor f from op and store the result in rop. */
    mpz_remove: (rop: mpz_ptr, op: mpz_srcptr, f: mpz_srcptr): mp_bitcnt_t => gmp.z_remove(rop, op, f),
    /** Set rop to the truncated integer part of the nth root of op. */
    mpz_root: (rop: mpz_ptr, op: mpz_srcptr, n: c_unsigned_long_int): c_int => gmp.z_root(rop, op, n),
    /** Set root to the truncated integer part of the nth root of u. Set rem to the remainder, u - root^n. */
    mpz_rootrem: (root: mpz_ptr, rem: mpz_ptr, u: mpz_srcptr, n: c_unsigned_long_int): void => { gmp.z_rootrem(root, rem, u, n); },
    /** Generate a random integer with long strings of zeros and ones in the binary representation. */
    mpz_rrandomb: (rop: mpz_ptr, state: gmp_randstate_t, n: mp_bitcnt_t): void => { gmp.z_rrandomb(rop, state, n); },
    /** Scan op for 0 bit. */
    mpz_scan0: (op: mpz_srcptr, startingBit: mp_bitcnt_t): mp_bitcnt_t => gmp.z_scan0(op, startingBit),
    /** Scan op for 1 bit. */
    mpz_scan1: (op: mpz_srcptr, startingBit: mp_bitcnt_t): mp_bitcnt_t => gmp.z_scan1(op, startingBit),
    /** Set the value of rop from op. */
    mpz_set: (rop: mpz_ptr, op: mpz_srcptr): void => { gmp.z_set(rop, op); },
    /** Set the value of rop from op. */
    mpz_set_d: (rop: mpz_ptr, op: c_double): void => { gmp.z_set_d(rop, op); },
    /** Set the value of rop from op. */
    mpz_set_q: (rop: mpz_ptr, op: mpq_srcptr): void => { gmp.z_set_q(rop, op); },
    /** Set the value of rop from op. */
    mpz_set_si: (rop: mpz_ptr, op: c_signed_long_int): void => { gmp.z_set_si(rop, op); },
    /** Set the value of rop from str, a null-terminated C string in base base. */
    mpz_set_str: (rop: mpz_ptr, str: c_str_ptr, base: c_int): c_int => gmp.z_set_str(rop, str, base),
    /** Set the value of rop from op. */
    mpz_set_ui: (rop: mpz_ptr, op: c_unsigned_long_int): void => { gmp.z_set_ui(rop, op); },
    /** Set bit bitIndex in rop. */
    mpz_setbit: (rop: mpz_ptr, bitIndex: mp_bitcnt_t): void => { gmp.z_setbit(rop, bitIndex); },
    /** Return +1 if op > 0, 0 if op = 0, and -1 if op < 0. */
    mpz_sgn: (op: mpz_ptr): c_int => gmp.z_sgn(op),
    /** Return the size of op measured in number of limbs. */
    mpz_size: (op: mpz_srcptr): c_size_t => gmp.z_size(op),
    /** Return the size of op measured in number of digits in the given base. */
    mpz_sizeinbase: (op: mpz_srcptr, base: c_int): c_size_t => gmp.z_sizeinbase(op, base),
    /** Set rop to the truncated integer part of the square root of op. */
    mpz_sqrt: (rop: mpz_ptr, op: mpz_srcptr): void => { gmp.z_sqrt(rop, op); },
    /** Set rop1 to the truncated integer part of the square root of op, like mpz_sqrt. Set rop2 to the remainder op - rop1 * rop1, which will be zero if op is a perfect square. */
    mpz_sqrtrem: (rop1: mpz_ptr, rop2: mpz_ptr, op: mpz_srcptr): void => { gmp.z_sqrtrem(rop1, rop2, op); },
    /** Set rop to op1 - op2. */
    mpz_sub: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): void => { gmp.z_sub(rop, op1, op2); },
    /** Set rop to op1 - op2. */
    mpz_sub_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int): void => { gmp.z_sub_ui(rop, op1, op2); },
    /** Set rop to op1 - op2. */
    mpz_ui_sub: (rop: mpz_ptr, op1: c_unsigned_long_int, op2: mpz_srcptr): void => { gmp.z_ui_sub(rop, op1, op2); },
    /** Set rop to rop - op1 * op2. */
    mpz_submul: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): void => { gmp.z_submul(rop, op1, op2); },
    /** Set rop to rop - op1 * op2. */
    mpz_submul_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int): void => { gmp.z_submul_ui(rop, op1, op2); },
    /** Swap the values rop1 and rop2 efficiently. */
    mpz_swap: (rop1: mpz_ptr, rop2: mpz_ptr): void => { gmp.z_swap(rop1, rop2); },
    /** Return the remainder | r | where r = n - q * d, and where q = trunc(n / d). */
    mpz_tdiv_ui: (n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_tdiv_ui(n, d),
    /** Set the quotient q to trunc(n / d). */
    mpz_tdiv_q: (q: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_tdiv_q(q, n, d); },
    /** Set the quotient q to trunc(n / 2^b). */
    mpz_tdiv_q_2exp: (q: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t): void => { gmp.z_tdiv_q_2exp(q, n, b); },
    /** Set the quotient q to trunc(n / d), and return the remainder r = | n - q * d |. */
    mpz_tdiv_q_ui: (q: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_tdiv_q_ui(q, n, d),
    /** Set the quotient q to trunc(n / d), and set the remainder r to n - q * d. */
    mpz_tdiv_qr: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_tdiv_qr(q, r, n, d); },
    /** Set quotient q to trunc(n / d), set the remainder r to n - q * d, and return | r |. */
    mpz_tdiv_qr_ui: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => { return gmp.z_tdiv_qr_ui(q, r, n, d); },
    /** Set the remainder r to n - q * d where q = trunc(n / d). */
    mpz_tdiv_r: (r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr): void => { gmp.z_tdiv_r(r, n, d); },
    /** Set the remainder r to n - q * 2^b where q = trunc(n / 2^b). */
    mpz_tdiv_r_2exp: (r: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t): void => { gmp.z_tdiv_r_2exp(r, n, b); },
    /** Set the remainder r to n - q * d where q = trunc(n / d), and return | r |. */
    mpz_tdiv_r_ui: (r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int): c_unsigned_long_int => gmp.z_tdiv_r_ui(r, n, d),
    /** Test bit bitIndex in op and return 0 or 1 accordingly. */
    mpz_tstbit: (op: mpz_srcptr, bitIndex: mp_bitcnt_t): c_int => gmp.z_tstbit(op, bitIndex),
    /** Set rop to base^exp. The case 0^0 yields 1. */
    mpz_ui_pow_ui: (rop: mpz_ptr, base: c_unsigned_long_int, exp: c_unsigned_long_int): void => { gmp.z_ui_pow_ui(rop, base, exp); },
    /** Generate a uniformly distributed random integer in the range 0 to 2^n - 1, inclusive. */
    mpz_urandomb: (rop: mpz_ptr, state: gmp_randstate_t, n: mp_bitcnt_t): void => { gmp.z_urandomb(rop, state, n); },
    /** Generate a uniform random integer in the range 0 to n - 1, inclusive. */
    mpz_urandomm: (rop: mpz_ptr, state: gmp_randstate_t, n: mpz_srcptr): void => { gmp.z_urandomm(rop, state, n); },
    /** Set rop to op1 bitwise exclusive-or op2. */
    mpz_xor: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr): void => { gmp.z_xor(rop, op1, op2); },
    /** Return a pointer to the limb array representing the absolute value of x. */
    mpz_limbs_read: (x: mpz_srcptr): mp_srcptr => gmp.z_limbs_read(x),
    /** Return a pointer to the limb array of x, intended for write access. */
    mpz_limbs_write: (x: mpz_ptr, n: mp_size_t): mp_ptr => gmp.z_limbs_write(x, n),
    /** Return a pointer to the limb array of x, intended for write access. */
    mpz_limbs_modify: (x: mpz_ptr, n: mp_size_t): mp_ptr => gmp.z_limbs_modify(x, n),
    /** Updates the internal size field of x. */
    mpz_limbs_finish: (x: mpz_ptr, s: mp_size_t): void => { gmp.z_limbs_finish(x, s); },
    /** Special initialization of x, using the given limb array and size. */
    mpz_roinit_n: (x: mpz_ptr, xp: mp_srcptr, xs: mp_size_t): mpz_srcptr => gmp.z_roinit_n(x, xp, xs),
    
    /**************** Rational (i.e. Q) routines.  ****************/
    /** Allocates memory for the mpq_t C struct and returns pointer */
    mpq_t: (): mpq_ptr => gmp.q_t(),
    /** Deallocates memory of a mpq_t C struct */
    mpq_t_free: (mpq_ptr: mpq_ptr): void => { gmp.q_t_free(mpq_ptr); },
    /** Deallocates memory of a NULL-terminated list of mpq_t variables */
    mpq_t_frees: (...ptrs: mpq_ptr[]): void => {
      for (let i = 0; i < ptrs.length; i++) {
        if (!ptrs[i]) return;
        gmp.q_t_free(ptrs[i]);
      }
    },
    
    /** Set rop to the absolute value of op. */
    mpq_abs: (rop: mpq_ptr, op: mpq_srcptr): void => { gmp.q_abs(rop, op); },
    /** Set sum to addend1 + addend2. */
    mpq_add: (sum: mpq_ptr, addend1: mpq_srcptr, addend2: mpq_srcptr): void => { gmp.q_add(sum, addend1, addend2); },
    /** Remove any factors that are common to the numerator and denominator of op, and make the denominator positive. */
    mpq_canonicalize: (op: mpq_ptr): void => { gmp.q_canonicalize(op); },
    /** Free the space occupied by x. */
    mpq_clear: (x: mpq_ptr): void => { gmp.q_clear(x); },
    /** Free the space occupied by a NULL-terminated list of mpq_t variables. */
    mpq_clears: (...ptrs: mpq_ptr[]): void => {
      for (let i = 0; i < ptrs.length; i++) {
        if (!ptrs[i]) return;
        gmp.q_clear(ptrs[i]);
      }
    },
    /** Compare op1 and op2. */
    mpq_cmp: (op1: mpq_srcptr, op2: mpq_srcptr): c_int => gmp.q_cmp(op1, op2),
    /** Compare op1 and num2 / den2. */
    mpq_cmp_si: (op1: mpq_srcptr, num2: c_signed_long_int, den2: c_unsigned_long_int): c_int => gmp.q_cmp_si(op1, num2, den2),
    /** Compare op1 and num2 / den2. */
    mpq_cmp_ui: (op1: mpq_srcptr, num2: c_unsigned_long_int, den2: c_unsigned_long_int): c_int => gmp.q_cmp_ui(op1, num2, den2),
    /** Compare op1 and op2. */
    mpq_cmp_z: (op1: mpq_srcptr, op2: mpz_srcptr): c_int => gmp.q_cmp_z(op1, op2),
    /** Set quotient to dividend / divisor. */
    mpq_div: (quotient: mpq_ptr, dividend: mpq_srcptr, divisor: mpq_srcptr): void => { gmp.q_div(quotient, dividend, divisor); },
    /** Set rop to op1 / 2^op2. */
    mpq_div_2exp: (rop: mpq_ptr, op1: mpq_srcptr, op2: mp_bitcnt_t): void => { gmp.q_div_2exp(rop, op1, op2); },
    /** Return non-zero if op1 and op2 are equal, zero if they are non-equal. */
    mpq_equal: (op1: mpq_srcptr, op2: mpq_srcptr): c_int => gmp.q_equal(op1, op2),
    /** Set numerator to the numerator of rational. */
    mpq_get_num: (numerator: mpz_ptr, rational: mpq_srcptr): void => { gmp.q_get_num(numerator, rational); },
    /** Set denominator to the denominator of rational. */
    mpq_get_den: (denominator: mpz_ptr, rational: mpq_srcptr): void => { gmp.q_get_den(denominator, rational); },
    /** Convert op to a double, truncating if necessary (i.e. rounding towards zero). */
    mpq_get_d: (op: mpq_srcptr): c_double => gmp.q_get_d(op),
    /** Convert op to a string of digits in base base. */
    mpq_get_str: (str: c_str_ptr, base: c_int, op: mpq_srcptr): c_str_ptr => gmp.q_get_str(str, base, op),
    /** Initialize x and set it to 0/1. */
    mpq_init: (x: mpq_ptr): void => { gmp.q_init(x); },
    /** Initialize a NULL-terminated list of mpq_t variables, and set their values to 0/1. */
    mpq_inits: (...ptrs: mpq_ptr[]): void => {
      for (let i = 0; i < ptrs.length; i++) {
        if (!ptrs[i]) return;
        gmp.q_init(ptrs[i]);
      }
    },
    /** Set inverted_number to 1 / number. */
    mpq_inv: (inverted_number: mpq_ptr, number: mpq_srcptr): void => { gmp.q_inv(inverted_number, number); },
    /** Set product to multiplier * multiplicand. */
    mpq_mul: (product: mpq_ptr, multiplier: mpq_srcptr, multiplicand: mpq_srcptr): void => { gmp.q_mul(product, multiplier, multiplicand); },
    /** Set rop to op1 * 2*op2. */
    mpq_mul_2exp: (rop: mpq_ptr, op1: mpq_srcptr, op2: mp_bitcnt_t): void => { gmp.q_mul_2exp(rop, op1, op2); },
    /** Set negated_operand to -operand. */
    mpq_neg: (negated_operand: mpq_ptr, operand: mpq_srcptr): void => { gmp.q_neg(negated_operand, operand); },
    /** Assign rop from op. */
    mpq_set: (rop: mpq_ptr, op: mpq_srcptr): void => { gmp.q_set(rop, op); },
    /** Set rop to the value of op. There is no rounding, this conversion is exact. */
    mpq_set_d: (rop: mpq_ptr, op: c_double): void => { gmp.q_set_d(rop, op); },
    /** Set the denominator of rational to denominator. */
    mpq_set_den: (rational: mpq_ptr, denominator: mpz_srcptr): void => { gmp.q_set_den(rational, denominator); },
    /** Set the numerator of rational to numerator. */
    mpq_set_num: (rational: mpq_ptr, numerator: mpz_srcptr): void => { gmp.q_set_num(rational, numerator); },
    /** Set the value of rop to op1 / op2. */
    mpq_set_si: (rop: mpq_ptr, op1: c_signed_long_int, op2: c_unsigned_long_int): void => { gmp.q_set_si(rop, op1, op2); },
    /** Set rop from a null-terminated string str in the given base. */
    mpq_set_str: (rop: mpq_ptr, str: c_str_ptr, base: c_int): c_int => gmp.q_set_str(rop, str, base),
    /** Set the value of rop to op1 / op2. */
    mpq_set_ui: (rop: mpq_ptr, op1: c_unsigned_long_int, op2: c_unsigned_long_int): void => { gmp.q_set_ui(rop, op1, op2); },
    /** Assign rop from op. */
    mpq_set_z: (rop: mpq_ptr, op: mpz_srcptr): void => { gmp.q_set_z(rop, op); },
    /** Return +1 if op > 0, 0 if op = 0, and -1 if op < 0. */
    mpq_sgn: (op: mpq_ptr): c_int => gmp.q_sgn(op),
    /** Set difference to minuend - subtrahend. */
    mpq_sub: (difference: mpq_ptr, minuend: mpq_srcptr, subtrahend: mpq_srcptr): void => { gmp.q_sub(difference, minuend, subtrahend); },
    /** Swap the values rop1 and rop2 efficiently. */
    mpq_swap: (rop1: mpq_ptr, rop2: mpq_ptr): void => { gmp.q_swap(rop1, rop2); },

    /**************** MPFR  ****************/
    /** Allocates memory for the mpfr_t C struct and returns pointer */
    mpfr_t: (): mpfr_ptr => gmp.r_t(),
    /** Deallocates memory of a mpfr_t C struct */
    mpfr_t_free: (mpfr_ptr: mpfr_ptr): void => { gmp.r_t_free(mpfr_ptr); },
    /** Deallocates memory of a NULL-terminated list of mpfr_t variables */
    mpfr_t_frees: (...ptrs: mpfr_ptr[]): void => {
      for (let i = 0; i < ptrs.length; i++) {
        if (!ptrs[i]) return;
        gmp.r_t_free(ptrs[i]);
      }
    },

    /** Return the MPFR version, as a null-terminated string. */
    mpfr_get_version: (): c_str_ptr => gmp.r_get_version(),
    /** Return a null-terminated string containing the ids of the patches applied to the MPFR library (contents of the PATCHES file), separated by spaces. */
    mpfr_get_patches: (): c_str_ptr => gmp.r_get_patches(),
    /** Return a non-zero value if MPFR was compiled as thread safe using compiler-level Thread Local Storage, return zero otherwise. */
    mpfr_buildopt_tls_p: (): c_int => gmp.r_buildopt_tls_p(),
    /** Return a non-zero value if MPFR was compiled with ‘__float128’ support, return zero otherwise. */
    mpfr_buildopt_float128_p: (): c_int => gmp.r_buildopt_float128_p(),
    /** Return a non-zero value if MPFR was compiled with decimal float support, return zero otherwise. */
    mpfr_buildopt_decimal_p: (): c_int => gmp.r_buildopt_decimal_p(),
    /** Return a non-zero value if MPFR was compiled with GMP internals, return zero otherwise. */
    mpfr_buildopt_gmpinternals_p: (): c_int => gmp.r_buildopt_gmpinternals_p(),
    /** Return a non-zero value if MPFR was compiled so that all threads share the same cache for one MPFR constant, return zero otherwise. */
    mpfr_buildopt_sharedcache_p: (): c_int => gmp.r_buildopt_sharedcache_p(),
    /** Return a string saying which thresholds file has been used at compile time. */
    mpfr_buildopt_tune_case: (): c_str_ptr => gmp.r_buildopt_tune_case(),
    /** Return the (current) smallest exponent allowed for a floating-point variable. */
    mpfr_get_emin: (): mpfr_exp_t => gmp.r_get_emin(),
    /** Set the smallest exponent allowed for a floating-point variable. */
    mpfr_set_emin: (exp: mpfr_exp_t): c_int => gmp.r_set_emin(exp),
    /** Return the minimum exponent allowed for mpfr_set_emin. */
    mpfr_get_emin_min: (): mpfr_exp_t => gmp.r_get_emin_min(),
    /** Return the maximum exponent allowed for mpfr_set_emin. */
    mpfr_get_emin_max: (): mpfr_exp_t => gmp.r_get_emin_max(),
    /** Return the (current) largest exponent allowed for a floating-point variable. */
    mpfr_get_emax: (): mpfr_exp_t => gmp.r_get_emax(),
    /** Set the largest exponent allowed for a floating-point variable. */
    mpfr_set_emax: (exp: mpfr_exp_t) : c_int => gmp.r_set_emax(exp),
    /** Return the minimum exponent allowed for mpfr_set_emax. */
    mpfr_get_emax_min: (): mpfr_exp_t => gmp.r_get_emax_min(),
    /** Return the maximum exponent allowed for mpfr_set_emax. */
    mpfr_get_emax_max: (): mpfr_exp_t => gmp.r_get_emax_max(),
    /** Set the default rounding mode to rnd. */
    mpfr_set_default_rounding_mode: (rnd: mpfr_rnd_t): void => { gmp.r_set_default_rounding_mode(rnd); },
    /** Get the default rounding mode. */
    mpfr_get_default_rounding_mode: (): mpfr_rnd_t => gmp.r_get_default_rounding_mode(),
    /** Return a string ("MPFR_RNDD", "MPFR_RNDU", "MPFR_RNDN", "MPFR_RNDZ", "MPFR_RNDA") corresponding to the rounding mode rnd, or a null pointer if rnd is an invalid rounding mode. */
    mpfr_print_rnd_mode: (rnd: mpfr_rnd_t): c_str_ptr => gmp.r_print_rnd_mode(rnd),
    /** Clear (lower) all global flags (underflow, overflow, divide-by-zero, invalid, inexact, erange). */
    mpfr_clear_flags: (): void => { gmp.r_clear_flags(); },
    /** Clear (lower) the underflow flag. */
    mpfr_clear_underflow: (): void => { gmp.r_clear_underflow(); },
    /** Clear (lower) the overflow flag. */
    mpfr_clear_overflow: (): void => { gmp.r_clear_overflow(); },
    /** Clear (lower) the divide-by-zero flag. */
    mpfr_clear_divby0: (): void => { gmp.r_clear_divby0(); },
    /** Clear (lower) the invalid flag. */
    mpfr_clear_nanflag: (): void => { gmp.r_clear_nanflag(); },
    /** Clear (lower) the inexact flag. */
    mpfr_clear_inexflag: (): void => { gmp.r_clear_inexflag(); },
    /** Clear (lower) the erange flag. */
    mpfr_clear_erangeflag: (): void => { gmp.r_clear_erangeflag(); },
    /** Set (raised) the underflow flag. */
    mpfr_set_underflow: (): void => { gmp.r_set_underflow(); },
    /** Set (raised) the overflow flag. */
    mpfr_set_overflow: (): void => { gmp.r_set_overflow(); },
    /** Set (raised) the divide-by-zero flag. */
    mpfr_set_divby0: (): void => { gmp.r_set_divby0(); },
    /** Set (raised) the invalid flag. */
    mpfr_set_nanflag: (): void => { gmp.r_set_nanflag(); },
    /** Set (raised) the inexact flag. */
    mpfr_set_inexflag: (): void => { gmp.r_set_inexflag(); },
    /** Set (raised) the erange flag. */
    mpfr_set_erangeflag: (): void => { gmp.r_set_erangeflag(); },
    /** Return the underflow flag, which is non-zero iff the flag is set. */
    mpfr_underflow_p: (): c_int => gmp.r_underflow_p(),
    /** Return the overflow flag, which is non-zero iff the flag is set. */
    mpfr_overflow_p: (): c_int => gmp.r_overflow_p(),
    /** Return the divide-by-zero flag, which is non-zero iff the flag is set. */
    mpfr_divby0_p: (): c_int => gmp.r_divby0_p(),
    /** Return the invalid flag, which is non-zero iff the flag is set. */
    mpfr_nanflag_p: (): c_int => gmp.r_nanflag_p(),
    /** Return the inexact flag, which is non-zero iff the flag is set. */
    mpfr_inexflag_p: (): c_int => gmp.r_inexflag_p(),
    /** Return the erange flag, which is non-zero iff the flag is set. */
    mpfr_erangeflag_p: (): c_int => gmp.r_erangeflag_p(),
    /** Clear (lower) the group of flags specified by mask. */
    mpfr_flags_clear: (mask: mpfr_flags_t): void => { gmp.r_flags_clear(mask); },
    /** Set (raise) the group of flags specified by mask. */
    mpfr_flags_set: (mask: mpfr_flags_t): void => { gmp.r_flags_set(mask); },
    /** Return the flags specified by mask. */
    mpfr_flags_test: (mask: mpfr_flags_t): mpfr_flags_t => gmp.r_flags_test(mask),
    /** Return all the flags. */
    mpfr_flags_save: (): mpfr_flags_t => gmp.r_flags_save(),
    /** Restore the flags specified by mask to their state represented in flags. */
    mpfr_flags_restore: (flags: mpfr_flags_t, mask: mpfr_flags_t): void => { gmp.r_flags_restore(flags, mask); },
    /** Check that x is within the current range of acceptable values. */
    mpfr_check_range: (x: mpfr_ptr, t: c_int, rnd: mpfr_rnd_t): c_int => gmp.r_check_range(x, t, rnd),
    /** Initialize x, set its precision to be exactly prec bits and its value to NaN. */
    mpfr_init2: (x: mpfr_ptr, prec: mpfr_prec_t): void => { gmp.r_init2(x, prec); },
    /** Initialize all the mpfr_t variables of the given variable argument x, set their precision to be exactly prec bits and their value to NaN. */
    mpfr_inits2: (prec: mpfr_prec_t, ...ptrs: mpfr_ptr[]): void => {
      for (let i = 0; i < ptrs.length; i++) {
        if (!ptrs[i]) return;
        gmp.r_init2(ptrs[i], prec);
      }
    },
    /** Initialize x, set its precision to the default precision, and set its value to NaN. */
    mpfr_init: (x: mpfr_ptr): void => { gmp.r_init(x); },
    /** Initialize all the mpfr_t variables of the given list x, set their precision to the default precision and their value to NaN. */
    mpfr_inits: (...ptrs: mpfr_ptr[]): void => {
      for (let i = 0; i < ptrs.length; i++) {
        if (!ptrs[i]) return;
        gmp.r_init(ptrs[i]);
      }
    },
    /** Free the space occupied by the significand of x. */
    mpfr_clear: (x: mpfr_ptr): void => { gmp.r_clear(x); },
    /** Free the space occupied by all the mpfr_t variables of the given list x. */
    mpfr_clears: (...ptrs: mpfr_ptr[]): void => {
      for (let i = 0; i < ptrs.length; i++) {
        if (!ptrs[i]) return;
        gmp.r_clear(ptrs[i]);
      }
    },
    /** Round x according to rnd with precision prec, which must be an integer between MPFR_PREC_MIN and MPFR_PREC_MAX (otherwise the behavior is undefined). */
    mpfr_prec_round: (x: mpfr_ptr, prec: mpfr_prec_t, rnd: mpfr_rnd_t): c_int => gmp.r_prec_round(x, prec, rnd),
    /** Return non-zero value if one is able to round correctly x to precision prec with the direction rnd2, and 0 otherwise. */
    mpfr_can_round: (b: mpfr_srcptr, err: mpfr_exp_t, rnd1: mpfr_rnd_t, rnd2: mpfr_rnd_t, prec: mpfr_prec_t): c_int => gmp.r_can_round(b, err, rnd1, rnd2, prec),
    /** Return the minimal number of bits required to store the significand of x, and 0 for special values, including 0. */
    mpfr_min_prec: (x: mpfr_srcptr): mpfr_prec_t => gmp.r_min_prec(x),
    /** Return the exponent of x, assuming that x is a non-zero ordinary number and the significand is considered in [1/2,1). */
    mpfr_get_exp: (x: mpfr_srcptr): mpfr_exp_t => gmp.r_get_exp(x),
    /** Set the exponent of x if e is in the current exponent range. */
    mpfr_set_exp: (x: mpfr_ptr, e: mpfr_exp_t): c_int => gmp.r_set_exp(x, e),
    /** Return the precision of x, i.e., the number of bits used to store its significand. */
    mpfr_get_prec: (x: mpfr_srcptr): mpfr_prec_t => gmp.r_get_prec(x),
    /** Reset the precision of x to be exactly prec bits, and set its value to NaN. */
    mpfr_set_prec: (x: mpfr_ptr, prec: mpfr_prec_t): void => { gmp.r_set_prec(x, prec); },
    /** Reset the precision of x to be exactly prec bits. */
    mpfr_set_prec_raw: (x: mpfr_ptr, prec: mpfr_prec_t): void => { gmp.r_set_prec_raw(x, prec); },
    /** Set the default precision to be exactly prec bits, where prec can be any integer between MPFR_PREC_MINand MPFR_PREC_MAX. */
    mpfr_set_default_prec: (prec: mpfr_prec_t): void => { gmp.r_set_default_prec(prec); },
    /** Return the current default MPFR precision in bits. */
    mpfr_get_default_prec: (): mpfr_prec_t => gmp.r_get_default_prec(),
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set_d: (rop: mpfr_ptr, op: c_double, rnd: mpfr_rnd_t): c_int => gmp.r_set_d(rop, op, rnd),
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set_z: (rop: mpfr_ptr, op: mpz_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_set_z(rop, op, rnd),
    /** Set the value of rop from op multiplied by two to the power e, rounded toward the given direction rnd. */
    mpfr_set_z_2exp: (rop: mpfr_ptr, op: mpz_srcptr, e: mpfr_exp_t, rnd: mpfr_rnd_t): c_int => gmp.r_set_z_2exp(rop, op, e, rnd),
    /** Set the variable x to NaN (Not-a-Number). */
    mpfr_set_nan: (x: mpfr_ptr): void => { gmp.r_set_nan(x); },
    /** Set the variable x to infinity. */
    mpfr_set_inf: (x: mpfr_ptr, sign: c_int): void => { gmp.r_set_inf(x, sign); },
    /** Set the variable x to zero. */
    mpfr_set_zero: (x: mpfr_ptr, sign: c_int): void => { gmp.r_set_zero(x, sign); },
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set_si: (rop: mpfr_ptr, op: c_signed_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_set_si(rop, op, rnd),
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set_ui: (rop: mpfr_ptr, op: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_set_ui(rop, op, rnd),
    /** Set the value of rop from op multiplied by two to the power e, rounded toward the given direction rnd. */
    mpfr_set_si_2exp: (rop: mpfr_ptr, op: c_signed_long_int, e: mpfr_exp_t, rnd: mpfr_rnd_t): c_int => gmp.r_set_si_2exp(rop, op, e, rnd),
    /** Set the value of rop from op multiplied by two to the power e, rounded toward the given direction rnd. */
    mpfr_set_ui_2exp: (rop: mpfr_ptr, op: c_unsigned_long_int, e: mpfr_exp_t, rnd: mpfr_rnd_t): c_int => gmp.r_set_ui_2exp(rop, op, e, rnd),
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set_q: (rop: mpfr_ptr, op: mpq_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_set_q(rop, op, rnd),
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul_q: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpq_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_mul_q(rop, op1, op2, rnd),
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div_q: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpq_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_div_q(rop, op1, op2, rnd),
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add_q: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpq_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_add_q(rop, op1, op2, rnd),
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub_q: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpq_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sub_q(rop, op1, op2, rnd),
    /** Compare op1 and op2. */
    mpfr_cmp_q: (op1: mpfr_srcptr, op2: mpq_srcptr): c_int => gmp.r_cmp_q(op1, op2),
    /** Convert op to a mpq_t. */
    mpfr_get_q: (rop: mpq_ptr, op: mpfr_srcptr): void => gmp.r_get_q(rop, op),
    /** Set rop to the value of the string s in base base, rounded in the direction rnd. */
    mpfr_set_str: (rop: mpfr_ptr, s: c_str_ptr, base: c_int, rnd: mpfr_rnd_t): c_int => gmp.r_set_str(rop, s, base, rnd),
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => gmp.r_init_set(rop, op, rnd),
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set_ui: (rop: mpfr_ptr, op: number, rnd: mpfr_rnd_t) => gmp.r_init_set_ui(rop, op, rnd),
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set_si: (rop: mpfr_ptr, op: number, rnd: mpfr_rnd_t) => gmp.r_init_set_si(rop, op, rnd),
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set_d: (rop: mpfr_ptr, op: number, rnd: mpfr_rnd_t) => gmp.r_init_set_d(rop, op, rnd),
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set_z: (rop: mpfr_ptr, op: mpz_srcptr, rnd: mpfr_rnd_t) => gmp.r_init_set_z(rop, op, rnd),
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set_q: (rop: mpfr_ptr, op: mpq_srcptr, rnd: mpfr_rnd_t) => gmp.r_init_set_q(rop, op, rnd),
    /** Initialize x and set its value from the string s in base base, rounded in the direction rnd. */
    mpfr_init_set_str: (x: mpfr_ptr, s: c_str_ptr, base: c_int, rnd: mpfr_rnd_t): c_int => gmp.r_init_set_str(x, s, base, rnd),
    /** Set rop to the absolute value of op rounded in the direction rnd. */
    mpfr_abs: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_abs(rop, op, rnd),
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_set(rop, op, rnd),
    /** Set rop to -op rounded in the direction rnd. */
    mpfr_neg: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_neg(rop, op, rnd),
    /** Return a non-zero value iff op has its sign bit set (i.e., if it is negative, -0, or a NaN whose representation has its sign bit set). */
    mpfr_signbit: (op: mpfr_srcptr): c_int => gmp.r_signbit(op),
    /** Set the value of rop from op, rounded toward the given direction rnd, then set (resp. clear) its sign bit if s is non-zero (resp. zero), even when op is a NaN. */
    mpfr_setsign: (rop: mpfr_ptr, op: mpfr_srcptr, s: c_int, rnd: mpfr_rnd_t): c_int => gmp.r_setsign(rop, op, s, rnd),
    /** Set the value of rop from op1, rounded toward the given direction rnd, then set its sign bit to that of op2 (even when op1 or op2 is a NaN). */
    mpfr_copysign: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_copysign(rop, op1, op2, rnd),
    /** Put the scaled significand of op (regarded as an integer, with the precision of op) into rop, and return the exponent exp (which may be outside the current exponent range) such that op = rop * 2^exp. */
    mpfr_get_z_2exp: (rop: mpz_ptr, op: mpfr_srcptr): mpfr_exp_t => gmp.r_get_z_2exp(rop, op),
    /** Convert op to a double, using the rounding mode rnd. */
    mpfr_get_d: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_double => gmp.r_get_d(op, rnd),
    /** Return d and set exp such that 0.5 ≤ abs(d) <1 and d * 2^exp = op rounded to double precision, using the given rounding mode. */
    mpfr_get_d_2exp: (exp: c_long_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_double => gmp.r_get_d_2exp(exp, op, rnd),
    /** Set exp and y such that 0.5 ≤ abs(y) < 1 and y * 2^exp = x rounded to the precision of y, using the given rounding mode. */
    mpfr_frexp: (exp: mpfr_exp_t_ptr, y: mpfr_ptr, x: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_frexp(exp, y, x, rnd),
    /** Convert op to a long after rounding it with respect to rnd. */
    mpfr_get_si: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_signed_long_int => gmp.r_get_si(op, rnd),
    /** Convert op to an unsigned long after rounding it with respect to rnd. */
    mpfr_get_ui: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_unsigned_long_int => gmp.r_get_ui(op, rnd),
    /** Return the minimal integer m such that any number of p bits, when output with m digits in radix b with rounding to nearest, can be recovered exactly when read again, still with rounding to nearest. More precisely, we have m = 1 + ceil(p*log(2)/log(b)), with p replaced by p-1 if b is a power of 2. */
    mpfr_get_str_ndigits: (b: c_int, p: mpfr_prec_t): c_size_t => gmp.r_get_str_ndigits(b, p),
    /** Convert op to a string of digits in base b, with rounding in the direction rnd, where n is either zero (see below) or the number of significant digits output in the string; in the latter case, n must be greater or equal to 2. */
    mpfr_get_str: (str: c_str_ptr, expptr: mpfr_exp_t_ptr, base: c_int, n: c_size_t, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_str_ptr => gmp.r_get_str(str, expptr, base, n, op, rnd),
    /** Convert op to a mpz_t, after rounding it with respect to rnd. */
    mpfr_get_z: (rop: mpz_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_get_z(rop, op, rnd),
    /** Free a string allocated by mpfr_get_str using the unallocation function (see GNU MPFR - Memory Handling). */
    mpfr_free_str: (str: c_str_ptr): void => { gmp.r_free_str(str); },
    /** Generate a uniformly distributed random float. */
    mpfr_urandom: (rop: mpfr_ptr, state: gmp_randstate_t, rnd: mpfr_rnd_t): c_int => gmp.r_urandom(rop, state, rnd),
    /** Generate one random float according to a standard normal gaussian distribution (with mean zero and variance one). */
    mpfr_nrandom: (rop: mpfr_ptr, state: gmp_randstate_t, rnd: mpfr_rnd_t): c_int => gmp.r_nrandom(rop, state, rnd),
    /** Generate one random float according to an exponential distribution, with mean one. */
    mpfr_erandom: (rop: mpfr_ptr, state: gmp_randstate_t, rnd: mpfr_rnd_t): c_int => gmp.r_erandom(rop, state, rnd),
    /** Generate a uniformly distributed random float in the interval 0 ≤ rop < 1. */
    mpfr_urandomb: (rop: mpfr_ptr, state: gmp_randstate_t): c_int => gmp.r_urandomb(rop, state),

    /** Equivalent to mpfr_nexttoward where y is plus infinity. */
    mpfr_nextabove: (x: mpfr_ptr): void => { gmp.r_nextabove(x); },
    /** Equivalent to mpfr_nexttoward where y is minus infinity. */
    mpfr_nextbelow: (x: mpfr_ptr): void => { gmp.r_nextbelow(x); },
    /** Replace x by the next floating-point number in the direction of y. */
    mpfr_nexttoward: (x: mpfr_ptr, y: mpfr_srcptr): void => { gmp.r_nexttoward(x, y); },

    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_pow: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_pow(rop, op1, op2, rnd),
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_pow_si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_pow_si(rop, op1, op2, rnd),
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_pow_ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_pow_ui(rop, op1, op2, rnd),
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_ui_pow_ui: (rop: mpfr_ptr, op1: c_unsigned_long_int, op2: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_ui_pow_ui(rop, op1, op2, rnd),
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_ui_pow: (rop: mpfr_ptr, op1: c_unsigned_long_int, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_ui_pow(rop, op1, op2, rnd),
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_pow_z: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpz_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_pow_z(rop, op1, op2, rnd),
    /** Set rop to the square root of op rounded in the direction rnd. */
    mpfr_sqrt: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sqrt(rop, op, rnd),
    /** Set rop to the square root of op rounded in the direction rnd. */
    mpfr_sqrt_ui: (rop: mpfr_ptr, op: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_sqrt_ui(rop, op, rnd),
    /** Set rop to the reciprocal square root of op rounded in the direction rnd. */
    mpfr_rec_sqrt: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_rec_sqrt(rop, op, rnd),
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_add(rop, op1, op2, rnd),
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sub(rop, op1, op2, rnd),
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_mul(rop, op1, op2, rnd),
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_div(rop, op1, op2, rnd),
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add_ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_add_ui(rop, op1, op2, rnd),
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub_ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_sub_ui(rop, op1, op2, rnd),
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_ui_sub: (rop: mpfr_ptr, op1: c_unsigned_long_int, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_ui_sub(rop, op1, op2, rnd),
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul_ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_mul_ui(rop, op1, op2, rnd),
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div_ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_div_ui(rop, op1, op2, rnd),
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_ui_div: (rop: mpfr_ptr, op1: c_unsigned_long_int, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_ui_div(rop, op1, op2, rnd),
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add_si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_add_si(rop, op1, op2, rnd),
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub_si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_sub_si(rop, op1, op2, rnd),
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_si_sub: (rop: mpfr_ptr, op1: c_signed_long_int, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_si_sub(rop, op1, op2, rnd),
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul_si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_mul_si(rop, op1, op2, rnd),
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div_si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_div_si(rop, op1, op2, rnd),
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_si_div: (rop: mpfr_ptr, op1: c_signed_long_int, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_si_div(rop, op1, op2, rnd),
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add_d: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_double, rnd: mpfr_rnd_t): c_int => gmp.r_add_d(rop, op1, op2, rnd),
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub_d: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_double, rnd: mpfr_rnd_t): c_int => gmp.r_sub_d(rop, op1, op2, rnd),
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_d_sub: (rop: mpfr_ptr, op1: c_double, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_d_sub(rop, op1, op2, rnd),
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul_d: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_double, rnd: mpfr_rnd_t): c_int => gmp.r_mul_d(rop, op1, op2, rnd),
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div_d: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_double, rnd: mpfr_rnd_t): c_int => gmp.r_div_d(rop, op1, op2, rnd),
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_d_div: (rop: mpfr_ptr, op1: c_double, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_d_div(rop, op1, op2, rnd),
    /** Set rop to the square of op rounded in the direction rnd. */
    mpfr_sqr: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sqr(rop, op, rnd),
    
    /** Set rop to the value of Pi rounded in the direction rnd. */
    mpfr_const_pi: (rop: mpfr_ptr, rnd: mpfr_rnd_t): c_int => gmp.r_const_pi(rop, rnd),
    /** Set rop to the logarithm of 2 rounded in the direction rnd. */
    mpfr_const_log2: (rop: mpfr_ptr, rnd: mpfr_rnd_t): c_int => gmp.r_const_log2(rop, rnd),
    /** Set rop to the value of Euler’s constant 0.577… rounded in the direction rnd. */
    mpfr_const_euler: (rop: mpfr_ptr, rnd: mpfr_rnd_t): c_int => gmp.r_const_euler(rop, rnd),
    /** Set rop to the value of Catalan’s constant 0.915… rounded in the direction rnd. */
    mpfr_const_catalan: (rop: mpfr_ptr, rnd: mpfr_rnd_t): c_int => gmp.r_const_catalan(rop, rnd),
    /** Set rop to the arithmetic-geometric mean of op1 and op2 rounded in the direction rnd. */
    mpfr_agm: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_agm(rop, op1, op2, rnd),
    /** Set rop to the natural logarithm of op rounded in the direction rnd. */
    mpfr_log: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_log(rop, op, rnd),
    /** Set rop to log2(op) rounded in the direction rnd. */
    mpfr_log2: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_log2(rop, op, rnd),
    /** Set rop to log10(op) rounded in the direction rnd. */
    mpfr_log10: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_log10(rop, op, rnd),
    /** Set rop to the logarithm of one plus op, rounded in the direction rnd. */
    mpfr_log1p: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_log1p(rop, op, rnd),
    /** Set rop to the natural logarithm of op rounded in the direction rnd. */
    mpfr_log_ui: (rop: mpfr_ptr, op: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_log_ui(rop, op, rnd),
    /** Set rop to the exponential of op rounded in the direction rnd. */
    mpfr_exp: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_exp(rop, op, rnd),
    /** Set rop to 2^op rounded in the direction rnd. */
    mpfr_exp2: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_exp2(rop, op, rnd),
    /** Set rop to 10^op rounded in the direction rnd. */
    mpfr_exp10: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_exp10(rop, op, rnd),
    /** Set rop to the e^op - 1, rounded in the direction rnd. */
    mpfr_expm1: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_expm1(rop, op, rnd),
    /** Set rop to the exponential integral of op rounded in the direction rnd. */
    mpfr_eint: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_eint(rop, op, rnd),
    /** Set rop to real part of the dilogarithm of op rounded in the direction rnd. */
    mpfr_li2: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_li2(rop, op, rnd),
    /** Compare op1 and op2. */
    mpfr_cmp:  (op1: mpfr_srcptr, op2: mpfr_srcptr): c_int => gmp.r_cmp(op1, op2),
    /** Compare op1 and op2. */
    mpfr_cmp_d: (op1: mpfr_srcptr, op2: c_double): c_int => gmp.r_cmp_d(op1, op2),
    /** Compare op1 and op2. */
    mpfr_cmp_ui: (op1: mpfr_srcptr, op2: c_unsigned_long_int): c_int => gmp.r_cmp_ui(op1, op2),
    /** Compare op1 and op2. */
    mpfr_cmp_si: (op1: mpfr_srcptr, op2: c_signed_long_int): c_int => gmp.r_cmp_si(op1, op2),
    /** Compare op1 and op2 * 2^e. */
    mpfr_cmp_ui_2exp: (op1: mpfr_srcptr, op2: c_unsigned_long_int, e: mpfr_exp_t): c_int => gmp.r_cmp_ui_2exp(op1, op2, e),
    /** Compare op1 and op2 * 2^e. */
    mpfr_cmp_si_2exp: (op1: mpfr_srcptr, op2: c_signed_long_int, e: mpfr_exp_t): c_int => gmp.r_cmp_si_2exp(op1, op2, e),
    /** Compare |op1| and |op2|. */
    mpfr_cmpabs: (op1: mpfr_srcptr, op2: mpfr_srcptr): c_int => gmp.r_cmpabs(op1, op2),
    /** Compare |op1| and |op2|. */
    mpfr_cmpabs_ui: (op1: mpfr_srcptr, op2: c_unsigned_long_int): c_int => gmp.r_cmpabs_ui(op1, op2),
    /** Compute the relative difference between op1 and op2 and store the result in rop. */
    mpfr_reldiff: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): void => { gmp.r_reldiff(rop, op1, op2, rnd); },
    /** Return non-zero if op1 and op2 are both non-zero ordinary numbers with the same exponent and the same first op3 bits. */
    mpfr_eq: (op1: mpfr_srcptr, op2: mpfr_srcptr, op3: c_unsigned_long_int): c_int => gmp.r_eq(op1, op2, op3),
    /** Return a positive value if op > 0, zero if op = 0, and a negative value if op < 0. */
    mpfr_sgn: (op: mpfr_srcptr): c_int => gmp.r_sgn(op),
    
    /** Set rop to op1 * 2^op2 rounded in the direction rnd. */
    mpfr_mul_2exp: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_mul_2exp(rop, op1, op2, rnd),
    /** Set rop to op1 divided by 2^op2 rounded in the direction rnd. */
    mpfr_div_2exp: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_div_2exp(rop, op1, op2, rnd),
    /** Set rop to op1 * 2^op2 rounded in the direction rnd. */
    mpfr_mul_2ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_mul_2ui(rop, op1, op2, rnd),
    /** Set rop to op1 divided by 2^op2 rounded in the direction rnd. */
    mpfr_div_2ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_div_2ui(rop, op1, op2, rnd),
    /** Set rop to op1 * 2^op2 rounded in the direction rnd. */
    mpfr_mul_2si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_mul_2si(rop, op1, op2, rnd),
    /** Set rop to op1 divided by 2^op2 rounded in the direction rnd. */
    mpfr_div_2si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_div_2si(rop, op1, op2, rnd),
    
    /** Set rop to op rounded to the nearest representable integer in the given direction rnd. */
    mpfr_rint: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_rint(rop, op, rnd),
    /** Set rop to op rounded to the nearest representable integer, rounding halfway cases with the even-rounding rule zero (like mpfr_rint(mpfr_t, mpfr_t, mpfr_rnd_t) with MPFR_RNDN). */
    mpfr_roundeven: (rop: mpfr_ptr, op: mpfr_srcptr): c_int => gmp.r_roundeven(rop, op),
    /** Set rop to op rounded to the nearest representable integer, rounding halfway cases away from zero (as in the roundTiesToAway mode of IEEE 754-2008). */
    mpfr_round: (rop: mpfr_ptr, op: mpfr_srcptr): c_int => gmp.r_round(rop, op),
    /** Set rop to op rounded to the next representable integer toward zero (like mpfr_rint(mpfr_t, mpfr_t, mpfr_rnd_t) with MPFR_RNDZ). */
    mpfr_trunc: (rop: mpfr_ptr, op: mpfr_srcptr): c_int => gmp.r_trunc(rop, op),
    /** Set rop to op rounded to the next higher or equal representable integer (like mpfr_rint(mpfr_t, mpfr_t, mpfr_rnd_t) with MPFR_RNDU). */
    mpfr_ceil: (rop: mpfr_ptr, op: mpfr_srcptr): c_int => gmp.r_ceil(rop, op),
    /** Set rop to op rounded to the next lower or equal representable integer. */
    mpfr_floor: (rop: mpfr_ptr, op: mpfr_srcptr): c_int => gmp.r_floor(rop, op),
    /** Set rop to op rounded to the nearest integer, rounding halfway cases to the nearest even integer. */
    mpfr_rint_roundeven: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_rint_roundeven(rop, op, rnd),
    /** Set rop to op rounded to the nearest integer, rounding halfway cases away from zero. */
    mpfr_rint_round: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_rint_round(rop, op, rnd),
    /** Set rop to op rounded to the next integer toward zero. */
    mpfr_rint_trunc: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_rint_trunc(rop, op, rnd),
    /** Set rop to op rounded to the next higher or equal integer. */
    mpfr_rint_ceil: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_rint_ceil(rop, op, rnd),
    /** Set rop to op rounded to the next lower or equal integer. */
    mpfr_rint_floor: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_rint_floor(rop, op, rnd),
    /** Set rop to the fractional part of op, having the same sign as op, rounded in the direction rnd. */
    mpfr_frac: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_frac(rop, op, rnd),
    /** Set simultaneously iop to the integral part of op and fop to the fractional part of op, rounded in the direction rnd with the corresponding precision of iop and fop. */
    mpfr_modf: (rop: mpfr_ptr, fop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_modf(rop, fop, op, rnd),
    /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded to the nearest integer (ties rounded to even). */
    mpfr_remquo: (r: mpfr_ptr, q: c_long_ptr, x: mpfr_srcptr, y: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_remquo(r, q, x, y, rnd),
    /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded to the nearest integer (ties rounded to even). */
    mpfr_remainder: (rop: mpfr_ptr, x: mpfr_srcptr, y: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_remainder(rop, x, y, rnd),
    /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded toward zero. */
    mpfr_fmod: (rop: mpfr_ptr, x: mpfr_srcptr, y: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fmod(rop, x, y, rnd),
    /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded toward zero. */
    mpfr_fmodquo: (rop: mpfr_ptr, q: c_long_ptr, x: mpfr_srcptr, y: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fmodquo(rop, q, x, y, rnd),
    
    /** Return non-zero if op would fit in the C data type (32-bit) unsigned long when rounded to an integer in the direction rnd. */
    mpfr_fits_ulong_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fits_ulong_p(op, rnd),
    /** Return non-zero if op would fit in the C data type (32-bit) long when rounded to an integer in the direction rnd. */
    mpfr_fits_slong_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fits_slong_p(op, rnd),
    /** Return non-zero if op would fit in the C data type (32-bit) unsigned int when rounded to an integer in the direction rnd. */
    mpfr_fits_uint_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fits_uint_p(op, rnd),
    /** Return non-zero if op would fit in the C data type (32-bit) int when rounded to an integer in the direction rnd. */
    mpfr_fits_sint_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fits_sint_p(op, rnd),
    /** Return non-zero if op would fit in the C data type (16-bit) unsigned short when rounded to an integer in the direction rnd. */
    mpfr_fits_ushort_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fits_ushort_p(op, rnd),
    /** Return non-zero if op would fit in the C data type (16-bit) short when rounded to an integer in the direction rnd. */
    mpfr_fits_sshort_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fits_sshort_p(op, rnd),
    /** Return non-zero if op would fit in the C data type (32-bit) unsigned long when rounded to an integer in the direction rnd. */
    mpfr_fits_uintmax_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fits_uintmax_p(op, rnd),
    /** Return non-zero if op would fit in the C data type (32-bit) long when rounded to an integer in the direction rnd. */
    mpfr_fits_intmax_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fits_intmax_p(op, rnd),
    /** Swap the structures pointed to by x and y. */
    mpfr_swap: (x: mpfr_ptr, y: mpfr_ptr): void => { gmp.r_swap(x, y); },
    /** Output op on stdout in some unspecified format, then a newline character. This function is mainly for debugging purpose. Thus invalid data may be supported. */
    mpfr_dump: (op: mpfr_srcptr): void => { gmp.r_dump(op); },
    /** Return non-zero if op is NaN. Return zero otherwise. */
    mpfr_nan_p: (op: mpfr_srcptr): c_int => gmp.r_nan_p(op),
    /** Return non-zero if op is an infinity. Return zero otherwise. */
    mpfr_inf_p: (op: mpfr_srcptr): c_int => gmp.r_inf_p(op),
    /** Return non-zero if op is an ordinary number (i.e., neither NaN nor an infinity). Return zero otherwise. */
    mpfr_number_p: (op: mpfr_srcptr): c_int => gmp.r_number_p(op),
    /** Return non-zero iff op is an integer. */
    mpfr_integer_p: (op: mpfr_srcptr): c_int => gmp.r_integer_p(op),
    /** Return non-zero if op is zero. Return zero otherwise. */
    mpfr_zero_p: (op: mpfr_srcptr): c_int => gmp.r_zero_p(op),
    /** Return non-zero if op is a regular number (i.e., neither NaN, nor an infinity nor zero). Return zero otherwise. */
    mpfr_regular_p: (op: mpfr_srcptr): c_int => gmp.r_regular_p(op),
    /** Return non-zero if op1 > op2, and zero otherwise. */
    mpfr_greater_p: (op1: mpfr_srcptr, op2: mpfr_srcptr): c_int => gmp.r_greater_p(op1, op2),
    /** Return non-zero if op1 ≥ op2, and zero otherwise. */
    mpfr_greaterequal_p: (op1: mpfr_srcptr, op2: mpfr_srcptr): c_int => gmp.r_greaterequal_p(op1, op2),
    /** Return non-zero if op1 < op2, and zero otherwise. */
    mpfr_less_p: (op1: mpfr_srcptr, op2: mpfr_srcptr): c_int => gmp.r_less_p(op1, op2),
    /** Return non-zero if op1 ≤ op2, and zero otherwise. */
    mpfr_lessequal_p: (op1: mpfr_srcptr, op2: mpfr_srcptr): c_int => gmp.r_lessequal_p(op1, op2),
    /** Return non-zero if op1 < op2 or op1 > op2 (i.e., neither op1, nor op2 is NaN, and op1 ≠ op2), zero otherwise (i.e., op1 and/or op2 is NaN, or op1 = op2). */
    mpfr_lessgreater_p: (op1: mpfr_srcptr, op2: mpfr_srcptr): c_int => gmp.r_lessgreater_p(op1, op2),
    /** Return non-zero if op1 = op2, and zero otherwise. */
    mpfr_equal_p: (op1: mpfr_srcptr, op2: mpfr_srcptr): c_int => gmp.r_equal_p(op1, op2),
    /** Return non-zero if op1 or op2 is a NaN (i.e., they cannot be compared), zero otherwise. */
    mpfr_unordered_p: (op1: mpfr_srcptr, op2: mpfr_srcptr): c_int => gmp.r_unordered_p(op1, op2),
    /** Set rop to the inverse hyperbolic tangent of op rounded in the direction rnd. */
    mpfr_atanh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_atanh(rop, op, rnd),
    /** Set rop to the inverse hyperbolic cosine of op rounded in the direction rnd. */
    mpfr_acosh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_acosh(rop, op, rnd),
    /** Set rop to the inverse hyperbolic sine of op rounded in the direction rnd. */
    mpfr_asinh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_asinh(rop, op, rnd),
    /** Set rop to the hyperbolic cosine of op rounded in the direction rnd. */
    mpfr_cosh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_cosh(rop, op, rnd),
    /** Set rop to the hyperbolic sine of op rounded in the direction rnd. */
    mpfr_sinh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sinh(rop, op, rnd),
    /** Set rop to the hyperbolic tangent of op rounded in the direction rnd. */
    mpfr_tanh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_tanh(rop, op, rnd),
    /** Set simultaneously sop to the hyperbolic sine of op and cop to the hyperbolic cosine of op, rounded in the direction rnd with the corresponding precision of sop and cop, which must be different variables. */
    mpfr_sinh_cosh: (sop: mpfr_ptr, cop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sinh_cosh(sop, cop, op, rnd),
    
    /** Set rop to the hyperbolic secant of op rounded in the direction rnd. */
    mpfr_sech: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sech(rop, op, rnd),
    /** Set rop to the hyperbolic cosecant of op rounded in the direction rnd. */
    mpfr_csch: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_csch(rop, op, rnd),
    /** Set rop to the hyperbolic cotangent of op rounded in the direction rnd. */
    mpfr_coth: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_coth(rop, op, rnd),
    /** Set rop to the arc-cosine of op rounded in the direction rnd. */
    mpfr_acos: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_acos(rop, op, rnd),
    /** Set rop to the arc-sine of op rounded in the direction rnd. */
    mpfr_asin: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_asin(rop, op, rnd),
    /** Set rop to the arc-tangent of op rounded in the direction rnd. */
    mpfr_atan: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_atan(rop, op, rnd),
    /** Set rop to the sine of op rounded in the direction rnd. */
    mpfr_sin: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sin(rop, op, rnd),
    /** Set simultaneously sop to the sine of op and cop to the cosine of op, rounded in the direction rnd with the corresponding precisions of sop and cop, which must be different variables. */
    mpfr_sin_cos: (sop: mpfr_ptr, cop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sin_cos(sop, cop, op, rnd),
    /** Set rop to the cosine of op rounded in the direction rnd. */
    mpfr_cos: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_cos(rop, op, rnd),
    /** Set rop to the tangent of op rounded in the direction rnd. */
    mpfr_tan: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_tan(rop, op, rnd),
    /** Set rop to the arc-tangent2 of y and x rounded in the direction rnd. */
    mpfr_atan2: (rop: mpfr_ptr, y: mpfr_srcptr, x: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_atan2(rop, y, x, rnd),
    /** Set rop to the secant of op rounded in the direction rnd. */
    mpfr_sec: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sec(rop, op, rnd),
    /** Set rop to the cosecant of op rounded in the direction rnd. */
    mpfr_csc: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_csc(rop, op, rnd),
    /** Set rop to the cotangent of op rounded in the direction rnd. */
    mpfr_cot: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_cot(rop, op, rnd),
    /** Set rop to the Euclidean norm of x and y, i.e., the square root of the sum of the squares of x and y rounded in the direction rnd. */
    mpfr_hypot: (rop: mpfr_ptr, x: mpfr_srcptr, y: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_hypot(rop, x, y, rnd),
    /** Set rop to the value of the error function on op rounded in the direction rnd. */
    mpfr_erf: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_erf(rop, op, rnd),
    /** Set rop to the value of the complementary error function on op rounded in the direction rnd. */
    mpfr_erfc: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_erfc(rop, op, rnd),
    /** Set rop to the cubic root of op rounded in the direction rnd. */
    mpfr_cbrt: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_cbrt(rop, op, rnd),
    /** Set rop to the kth root of op rounded in the direction rnd. */
    mpfr_rootn_ui: (rop: mpfr_ptr, op: mpfr_srcptr, k: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_rootn_ui(rop, op, k, rnd),
    /** Set rop to the value of the Gamma function on op rounded in the direction rnd. */
    mpfr_gamma: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_gamma(rop, op, rnd),
    /** Set rop to the value of the incomplete Gamma function on op and op2, rounded in the direction rnd. */
    mpfr_gamma_inc: (rop: mpfr_ptr, op: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_gamma_inc(rop, op, op2, rnd),
    /** Set rop to the value of the Beta function at arguments op1 and op2, rounded in the direction rnd. */
    mpfr_beta: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_beta(rop, op1, op2, rnd),
    /** Set rop to the value of the logarithm of the Gamma function on op rounded in the direction rnd. */
    mpfr_lngamma: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_lngamma(rop, op, rnd),
    /** Set rop to the value of the logarithm of the absolute value of the Gamma function on op rounded in the direction rnd. */
    mpfr_lgamma: (rop: mpfr_ptr, signp: c_int_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_lgamma(rop, signp, op, rnd),
    /** Set rop to the value of the Digamma (sometimes also called Psi) function on op rounded in the direction rnd. */
    mpfr_digamma: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_digamma(rop, op, rnd),
    /** Set rop to the value of the Riemann Zeta function on op rounded in the direction rnd. */
    mpfr_zeta: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_zeta(rop, op, rnd),
    /** Set rop to the value of the Riemann Zeta function on op rounded in the direction rnd. */
    mpfr_zeta_ui: (rop: mpfr_ptr, op: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_zeta_ui(rop, op, rnd),
    /** Set rop to the factorial of op rounded in the direction rnd. */
    mpfr_fac_ui: (rop: mpfr_ptr, op: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_fac_ui(rop, op, rnd),
    /** Set rop to the value of the first kind Bessel function of order 0 on op rounded in the direction rnd. */
    mpfr_j0: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_j0(rop, op, rnd),
    /** Set rop to the value of the first kind Bessel function of order 1 on op rounded in the direction rnd. */
    mpfr_j1: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_j1(rop, op, rnd),
    /** Set rop to the value of the first kind Bessel function of order n on op rounded in the direction rnd. */
    mpfr_jn: (rop: mpfr_ptr, n: c_signed_long_int, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_jn(rop, n, op, rnd),
    /** Set rop to the value of the first kind Bessel function of order 0 on op rounded in the direction rnd. */
    mpfr_y0: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_y0(rop, op, rnd),
    /** Set rop to the value of the first kind Bessel function of order 1 on op rounded in the direction rnd. */
    mpfr_y1: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_y1(rop, op, rnd),
    /** Set rop to the value of the first kind Bessel function of order n on op rounded in the direction rnd. */
    mpfr_yn: (rop: mpfr_ptr, n: c_signed_long_int, op: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_yn(rop, n, op, rnd),

    /** Set rop to the value of the Airy function Ai on x rounded in the direction rnd. */
    mpfr_ai: (rop: mpfr_ptr, x: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_ai(rop, x, rnd),
    /** Set rop to the minimum of op1 and op2. */
    mpfr_min: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_min(rop, op1, op2, rnd),
    /** Set rop to the maximum of op1 and op2. */
    mpfr_max: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_max(rop, op1, op2, rnd),
    /** Set rop to the positive difference of op1 and op2, i.e., op1 - op2 rounded in the direction rnd if op1 > op2, +0 if op1 ≤ op2, and NaN if op1 or op2 is NaN. */
    mpfr_dim: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_dim(rop, op1, op2, rnd),
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul_z: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpz_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_mul_z(rop, op1, op2, rnd),
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div_z: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpz_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_div_z(rop, op1, op2, rnd),
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add_z: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpz_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_add_z(rop, op1, op2, rnd),
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub_z: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpz_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_sub_z(rop, op1, op2, rnd),
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_z_sub: (rop: mpfr_ptr, op1: mpz_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_z_sub(rop, op1, op2, rnd),
    /** Compare op1 and op2. */
    mpfr_cmp_z: (op1: mpfr_srcptr, op2: mpz_srcptr): c_int => gmp.r_cmp_z(op1, op2),
    /** Set rop to (op1 * op2) + op3 rounded in the direction rnd. */
    mpfr_fma: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, op3: mpfr_srcptr,  rnd: mpfr_rnd_t): c_int => gmp.r_fma(rop, op1, op2, op3, rnd),
    /** Set rop to (op1 * op2) - op3 rounded in the direction rnd. */
    mpfr_fms: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, op3: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fms(rop, op1, op2, op3, rnd),
    /** Set rop to (op1 * op2) + (op3 * op4) rounded in the direction rnd. */
    mpfr_fmma: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, op3: mpfr_srcptr, op4: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fmma(rop, op1, op2, op3, op4, rnd),
    /** Set rop to (op1 * op2) - (op3 * op4) rounded in the direction rnd. */
    mpfr_fmms: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, op3: mpfr_srcptr, op4: mpfr_srcptr, rnd: mpfr_rnd_t): c_int => gmp.r_fmms(rop, op1, op2, op3, op4, rnd),
    /** Set rop to the sum of all elements of tab, whose size is n, correctly rounded in the direction rnd. */
    mpfr_sum: (rop: mpfr_ptr, tab: mpfr_ptr_ptr, n: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_sum(rop, tab, n, rnd),
    /** Set rop to the dot product of elements of a by those of b, whose common size is n, correctly rounded in the direction rnd. */
    mpfr_dot: (rop: mpfr_ptr, a: mpfr_ptr_ptr, b: mpfr_ptr_ptr, n: c_unsigned_long_int, rnd: mpfr_rnd_t): c_int => gmp.r_dot(rop, a, b, n, rnd),
    
    /** Free all caches and pools used by MPFR internally. */
    mpfr_free_cache: (): void => { gmp.r_free_cache(); },
    /** Free various caches and pools used by MPFR internally, as specified by way, which is a set of flags */
    mpfr_free_cache2: (way: mpfr_free_cache_t): void => { gmp.r_free_cache2(way); },
    /** Free the pools used by MPFR internally. */
    mpfr_free_pool: (): void => { gmp.r_free_pool(); },
    /** This function should be called before calling mp_set_memory_functions(allocate_function, reallocate_function, free_function). */
    mpfr_mp_memory_cleanup: (): c_int => gmp.r_mp_memory_cleanup(),
    /** This function rounds x emulating subnormal number arithmetic. */
    mpfr_subnormalize: (x: mpfr_ptr, t: c_int, rnd: mpfr_rnd_t): c_int => gmp.r_subnormalize(x, t, rnd),
    /** Read a floating-point number from a string nptr in base base, rounded in the direction rnd. */
    mpfr_strtofr: (rop: mpfr_ptr, nptr: c_str_ptr, endptr: c_str_ptr_ptr, base: c_int, rnd: mpfr_rnd_t): c_int => gmp.r_strtofr(rop, nptr, endptr, base, rnd),
    /** Return the needed size in bytes to store the significand of a floating-point number of precision prec. */
    mpfr_custom_get_size: (prec: mpfr_prec_t): c_size_t => gmp.r_custom_get_size(prec),
    /** Initialize a significand of precision prec. */
    mpfr_custom_init: (significand: c_void_ptr, prec: mpfr_prec_t): void => { gmp.r_custom_init(significand, prec); },
    /** Return a pointer to the significand used by a mpfr_t initialized with mpfr_custom_init_set. */
    mpfr_custom_get_significand: (x: mpfr_srcptr): c_void_ptr => gmp.r_custom_get_significand(x),
    /** Return the exponent of x */
    mpfr_custom_get_exp: (x: mpfr_srcptr): mpfr_exp_t => gmp.r_custom_get_exp(x),
    /** Inform MPFR that the significand of x has moved due to a garbage collect and update its new position to new_position. */
    mpfr_custom_move: (x: mpfr_ptr, new_position: c_void_ptr): void => { gmp.r_custom_move(x, new_position); },
    /** Perform a dummy initialization of a mpfr_t. */
    mpfr_custom_init_set: (x: mpfr_ptr, kind: c_int, exp: mpfr_exp_t, prec: mpfr_prec_t, significand: c_void_ptr): void => { gmp.r_custom_init_set(x, kind, exp, prec, significand); },
    /** Return the current kind of a mpfr_t as created by mpfr_custom_init_set. */
    mpfr_custom_get_kind: (x: mpfr_srcptr): c_int => gmp.r_custom_get_kind(x),
    /** This function implements the totalOrder predicate from IEEE 754-2008, where -NaN < -Inf < negative finite numbers < -0 < +0 < positive finite numbers < +Inf < +NaN. It returns a non-zero value (true) when x is smaller than or equal to y for this order relation, and zero (false) otherwise */
    mpfr_total_order_p: (x: mpfr_srcptr, y: mpfr_srcptr): c_int => gmp.r_total_order_p(x, y),
  };
};
