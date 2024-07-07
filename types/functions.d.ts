import { mpz_ptr, mpz_srcptr, mpfr_ptr, mpfr_srcptr, mpq_ptr, mpq_srcptr, mp_bitcnt_t, gmp_randstate_t, __gmp_randstate_struct_ptr, c_unsigned_long_int, c_void_ptr, c_str_ptr, c_int, c_int_ptr, c_long_ptr, c_double, c_signed_long_int, c_signed_long_int_ptr, c_size_t, c_size_t_ptr, mp_limb_t, mp_srcptr, mp_size_t, mpfr_prec_t, mpfr_flags_t, mpfr_ptr_ptr, mp_ptr, mpfr_exp_t_ptr, c_str_ptr_ptr, mpfr_exp_t, mpfr_t, mpfr_rnd_t, mpfr_free_cache_t } from './bindingTypes';
declare type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
declare type GMPFunctionsType = Awaited<ReturnType<typeof getGMPInterface>>;
export interface GMPFunctions extends GMPFunctionsType {
}
export declare function getGMPInterface(): Promise<{
    reset: () => Promise<void>;
    malloc: (size: c_size_t) => c_void_ptr;
    malloc_cstr: (str: string) => number;
    free: (ptr: c_void_ptr) => void;
    readonly mem: Uint8Array;
    readonly memView: DataView;
    /**************** Random number routines.  ****************/
    /** Initialize state with a default algorithm. */
    gmp_randinit_default: (state: gmp_randstate_t) => void;
    /** Initialize state with a linear congruential algorithm X = (aX + c) mod 2^m2exp. */
    gmp_randinit_lc_2exp: (state: gmp_randstate_t, a: mpz_srcptr, c: c_unsigned_long_int, m2exp: mp_bitcnt_t) => void;
    /** Initialize state for a linear congruential algorithm as per gmp_randinit_lc_2exp. */
    gmp_randinit_lc_2exp_size: (state: gmp_randstate_t, size: mp_bitcnt_t) => c_int;
    /** Initialize state for a Mersenne Twister algorithm. */
    gmp_randinit_mt: (state: gmp_randstate_t) => void;
    /** Initialize rop with a copy of the algorithm and state from op. */
    gmp_randinit_set: (rop: gmp_randstate_t, op: __gmp_randstate_struct_ptr) => void;
    /** Set an initial seed value into state. */
    gmp_randseed: (state: gmp_randstate_t, seed: mpz_srcptr) => void;
    /** Set an initial seed value into state. */
    gmp_randseed_ui: (state: gmp_randstate_t, seed: c_unsigned_long_int) => void;
    /** Free all memory occupied by state. */
    gmp_randclear: (state: gmp_randstate_t) => void;
    /** Generate a uniformly distributed random number of n bits, i.e. in the range 0 to 2^n - 1 inclusive. */
    gmp_urandomb_ui: (state: gmp_randstate_t, n: c_unsigned_long_int) => c_unsigned_long_int;
    /** Generate a uniformly distributed random number in the range 0 to n - 1, inclusive. */
    gmp_urandomm_ui: (state: gmp_randstate_t, n: c_unsigned_long_int) => c_unsigned_long_int;
    /**************** Formatted output routines.  ****************/
    /**************** Formatted input routines.  ****************/
    /**************** Integer (i.e. Z) routines.  ****************/
    /** Get GMP limb size */
    mp_bits_per_limb: () => number;
    /** Allocates memory for the mpfr_t C struct and returns pointer */
    mpz_t: () => mpz_ptr;
    /** Deallocates memory of a mpfr_t C struct */
    mpz_t_free: (ptr: mpz_ptr) => void;
    /** Deallocates memory of a NULL-terminated list of mpfr_t variables */
    mpz_t_frees: (...ptrs: mpz_ptr[]) => void;
    /** Set rop to the absolute value of op. */
    mpz_abs: (rop: mpz_ptr, op: mpz_srcptr) => void;
    /** Set rop to op1 + op2. */
    mpz_add: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => void;
    /** Set rop to op1 + op2. */
    mpz_add_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int) => void;
    /** Set rop to rop + op1 * op2. */
    mpz_addmul: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => void;
    /** Set rop to rop + op1 * op2. */
    mpz_addmul_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int) => void;
    /** Set rop to op1 bitwise-and op2. */
    mpz_and: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => void;
    /** Compute the binomial coefficient n over k and store the result in rop. */
    mpz_bin_ui: (rop: mpz_ptr, n: mpz_srcptr, k: c_unsigned_long_int) => void;
    /** Compute the binomial coefficient n over k and store the result in rop. */
    mpz_bin_uiui: (rop: mpz_ptr, n: c_unsigned_long_int, k: c_unsigned_long_int) => void;
    /** Set the quotient q to ceiling(n / d). */
    mpz_cdiv_q: (q: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set the quotient q to ceiling(n / 2^b). */
    mpz_cdiv_q_2exp: (q: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t) => void;
    /** Set the quotient q to ceiling(n / d), and return the remainder r = | n - q * d |. */
    mpz_cdiv_q_ui: (q: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Set the quotient q to ceiling(n / d), and set the remainder r to n - q * d. */
    mpz_cdiv_qr: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set quotient q to ceiling(n / d), set the remainder r to n - q * d, and return | r |. */
    mpz_cdiv_qr_ui: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Set the remainder r to n - q * d where q = ceiling(n / d). */
    mpz_cdiv_r: (r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set the remainder r to n - q * 2^b where q = ceiling(n / 2^b). */
    mpz_cdiv_r_2exp: (r: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t) => void;
    /** Set the remainder r to n - q * d where q = ceiling(n / d), and return | r |. */
    mpz_cdiv_r_ui: (r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Return the remainder | r | where r = n - q * d, and where q = ceiling(n / d). */
    mpz_cdiv_ui: (n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Free the space occupied by x. */
    mpz_clear: (x: mpz_ptr) => void;
    /** Free the space occupied by a NULL-terminated list of mpz_t variables. */
    mpz_clears: (...ptrs: mpz_ptr[]) => void;
    /** Clear bit bit_index in rop. */
    mpz_clrbit: (rop: mpz_ptr, bit_index: mp_bitcnt_t) => void;
    /** Compare op1 and op2. */
    mpz_cmp: (op1: mpz_srcptr, op2: mpz_srcptr) => c_int;
    /** Compare op1 and op2. */
    mpz_cmp_d: (op1: mpz_srcptr, op2: c_double) => c_int;
    /** Compare op1 and op2. */
    mpz_cmp_si: (op1: mpz_srcptr, op2: c_signed_long_int) => c_int;
    /** Compare op1 and op2. */
    mpz_cmp_ui: (op1: mpz_srcptr, op2: c_unsigned_long_int) => c_int;
    /** Compare the absolute values of op1 and op2. */
    mpz_cmpabs: (op1: mpz_srcptr, op2: mpz_srcptr) => c_int;
    /** Compare the absolute values of op1 and op2. */
    mpz_cmpabs_d: (op1: mpz_srcptr, op2: c_double) => c_int;
    /** Compare the absolute values of op1 and op2. */
    mpz_cmpabs_ui: (op1: mpz_srcptr, op2: c_unsigned_long_int) => c_int;
    /** Set rop to the one’s complement of op. */
    mpz_com: (rop: mpz_ptr, op: mpz_srcptr) => void;
    /** Complement bit bitIndex in rop. */
    mpz_combit: (rop: mpz_ptr, bitIndex: mp_bitcnt_t) => void;
    /** Return non-zero if n is congruent to c modulo d. */
    mpz_congruent_p: (n: mpz_srcptr, c: mpz_srcptr, d: mpz_srcptr) => c_int;
    /** Return non-zero if n is congruent to c modulo 2^b. */
    mpz_congruent_2exp_p: (n: mpz_srcptr, c: mpz_srcptr, b: mp_bitcnt_t) => c_int;
    /** Return non-zero if n is congruent to c modulo d. */
    mpz_congruent_ui_p: (n: mpz_srcptr, c: c_unsigned_long_int, d: c_unsigned_long_int) => c_int;
    /** Set q to n / d when it is known in advance that d divides n. */
    mpz_divexact: (q: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set q to n / d when it is known in advance that d divides n. */
    mpz_divexact_ui: (q: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => void;
    /** Return non-zero if n is exactly divisible by d. */
    mpz_divisible_p: (n: mpz_srcptr, d: mpz_srcptr) => c_int;
    /** Return non-zero if n is exactly divisible by d. */
    mpz_divisible_ui_p: (n: mpz_srcptr, d: c_unsigned_long_int) => c_int;
    /** Return non-zero if n is exactly divisible by 2^b. */
    mpz_divisible_2exp_p: (n: mpz_srcptr, b: mp_bitcnt_t) => c_int;
    /** Determine whether op is even. */
    mpz_even_p: (op: mpz_srcptr) => void;
    /** Fill rop with word data from op. */
    mpz_export: (rop: c_void_ptr, countp: c_size_t_ptr, order: c_int, size: c_size_t, endian: c_int, nails: c_size_t, op: mpz_srcptr) => c_void_ptr;
    /** Set rop to the factorial n!. */
    mpz_fac_ui: (rop: mpz_ptr, n: c_unsigned_long_int) => void;
    /** Set rop to the double-factorial n!!. */
    mpz_2fac_ui: (rop: mpz_ptr, n: c_unsigned_long_int) => void;
    /** Set rop to the m-multi-factorial n!^(m)n. */
    mpz_mfac_uiui: (rop: mpz_ptr, n: c_unsigned_long_int, m: c_unsigned_long_int) => void;
    /** Set rop to the primorial of n, i.e. the product of all positive prime numbers ≤ n. */
    mpz_primorial_ui: (rop: mpz_ptr, n: c_unsigned_long_int) => void;
    /** Set the quotient q to floor(n / d). */
    mpz_fdiv_q: (q: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set the quotient q to floor(n / 2^b). */
    mpz_fdiv_q_2exp: (q: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t) => void;
    /** Set the quotient q to floor(n / d), and return the remainder r = | n - q * d |. */
    mpz_fdiv_q_ui: (q: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Set the quotient q to floor(n / d), and set the remainder r to n - q * d. */
    mpz_fdiv_qr: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set quotient q to floor(n / d), set the remainder r to n - q * d, and return | r |. */
    mpz_fdiv_qr_ui: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Set the remainder r to n - q * d where q = floor(n / d). */
    mpz_fdiv_r: (r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set the remainder r to n - q * 2^b where q = floor(n / 2^b). */
    mpz_fdiv_r_2exp: (r: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t) => void;
    /** Set the remainder r to n - q * d where q = floor(n / d), and return | r |. */
    mpz_fdiv_r_ui: (r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Return the remainder | r | where r = n - q * d, and where q = floor(n / d). */
    mpz_fdiv_ui: (n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Sets fn to to F[n], the n’th Fibonacci number. */
    mpz_fib_ui: (fn: mpz_ptr, n: c_unsigned_long_int) => void;
    /** Sets fn to F[n], and fnsub1 to F[n - 1]. */
    mpz_fib2_ui: (fn: mpz_ptr, fnsub1: mpz_ptr, n: c_unsigned_long_int) => void;
    /** Return non-zero iff the value of op fits in a signed 32-bit integer. Otherwise, return zero. */
    mpz_fits_sint_p: (op: mpz_srcptr) => c_int;
    /** Return non-zero iff the value of op fits in a signed 32-bit integer. Otherwise, return zero. */
    mpz_fits_slong_p: (op: mpz_srcptr) => c_int;
    /** Return non-zero iff the value of op fits in a signed 16-bit integer. Otherwise, return zero. */
    mpz_fits_sshort_p: (op: mpz_srcptr) => c_int;
    /** Return non-zero iff the value of op fits in an unsigned 32-bit integer. Otherwise, return zero. */
    mpz_fits_uint_p: (op: mpz_srcptr) => c_int;
    /** Return non-zero iff the value of op fits in an unsigned 32-bit integer. Otherwise, return zero. */
    mpz_fits_ulong_p: (op: mpz_srcptr) => c_int;
    /** Return non-zero iff the value of op fits in an unsigned 16-bit integer. Otherwise, return zero. */
    mpz_fits_ushort_p: (op: mpz_srcptr) => c_int;
    /** Set rop to the greatest common divisor of op1 and op2. */
    mpz_gcd: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => void;
    /** Compute the greatest common divisor of op1 and op2. If rop is not null, store the result there. */
    mpz_gcd_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int) => c_unsigned_long_int;
    /** Set g to the greatest common divisor of a and b, and in addition set s and t to coefficients satisfying a * s + b * t = g. */
    mpz_gcdext: (g: mpz_ptr, s: mpz_ptr, t: mpz_ptr, a: mpz_srcptr, b: mpz_srcptr) => void;
    /** Convert op to a double, truncating if necessary (i.e. rounding towards zero). */
    mpz_get_d: (op: mpz_srcptr) => c_double;
    /** Convert op to a double, truncating if necessary (i.e. rounding towards zero), and returning the exponent separately. */
    mpz_get_d_2exp: (exp: c_signed_long_int_ptr, op: mpz_srcptr) => c_double;
    /** Return the value of op as an signed long. */
    mpz_get_si: (op: mpz_srcptr) => c_signed_long_int;
    /** Convert op to a string of digits in base base. */
    mpz_get_str: (str: c_str_ptr, base: c_int, op: mpz_srcptr) => c_str_ptr;
    /** Return the value of op as an unsigned long. */
    mpz_get_ui: (op: mpz_srcptr) => c_unsigned_long_int;
    /** Return limb number n from op. */
    mpz_getlimbn: (op: mpz_srcptr, n: mp_size_t) => mp_limb_t;
    /** Return the hamming distance between the two operands. */
    mpz_hamdist: (op1: mpz_srcptr, op2: mpz_srcptr) => mp_bitcnt_t;
    /** Set rop from an array of word data at op. */
    mpz_import: (rop: mpz_ptr, count: c_size_t, order: c_int, size: c_size_t, endian: c_int, nails: c_size_t, op: c_void_ptr) => void;
    /** Initialize x, and set its value to 0. */
    mpz_init: (x: mpz_ptr) => void;
    /** Initialize a NULL-terminated list of mpz_t variables, and set their values to 0. */
    mpz_inits: (...ptrs: mpz_ptr[]) => void;
    /** Initialize x, with space for n-bit numbers, and set its value to 0. */
    mpz_init2: (x: mpz_ptr, n: mp_bitcnt_t) => void;
    /** Initialize rop with limb space and set the initial numeric value from op. */
    mpz_init_set: (rop: mpz_ptr, op: mpz_srcptr) => void;
    /** Initialize rop with limb space and set the initial numeric value from op. */
    mpz_init_set_d: (rop: mpz_ptr, op: c_double) => void;
    /** Initialize rop with limb space and set the initial numeric value from op. */
    mpz_init_set_si: (rop: mpz_ptr, op: c_signed_long_int) => void;
    /** Initialize rop and set its value like mpz_set_str. */
    mpz_init_set_str: (rop: mpz_ptr, str: c_str_ptr, base: c_int) => c_int;
    /** Initialize rop with limb space and set the initial numeric value from op. */
    mpz_init_set_ui: (rop: mpz_ptr, op: c_unsigned_long_int) => void;
    /** Compute the inverse of op1 modulo op2 and put the result in rop. */
    mpz_invert: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => c_int;
    /** Set rop to op1 bitwise inclusive-or op2. */
    mpz_ior: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => void;
    /** Calculate the Jacobi symbol (a/b). */
    mpz_jacobi: (a: mpz_srcptr, b: mpz_srcptr) => c_int;
    /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
    mpz_kronecker: (a: mpz_srcptr, b: mpz_srcptr) => c_int;
    /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
    mpz_kronecker_si: (a: mpz_srcptr, b: c_signed_long_int) => c_int;
    /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
    mpz_kronecker_ui: (a: mpz_srcptr, b: c_unsigned_long_int) => c_int;
    /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
    mpz_si_kronecker: (a: c_signed_long_int, b: mpz_srcptr) => c_int;
    /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
    mpz_ui_kronecker: (a: c_unsigned_long_int, b: mpz_srcptr) => c_int;
    /** Set rop to the least common multiple of op1 and op2. */
    mpz_lcm: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => void;
    /** Set rop to the least common multiple of op1 and op2. */
    mpz_lcm_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int) => void;
    /** Calculate the Legendre symbol (a/p). */
    mpz_legendre: (a: mpz_srcptr, p: mpz_srcptr) => c_int;
    /** Sets ln to to L[n], the n’th Lucas number. */
    mpz_lucnum_ui: (ln: mpz_ptr, n: c_unsigned_long_int) => void;
    /** Sets ln to L[n], and lnsub1 to L[n - 1]. */
    mpz_lucnum2_ui: (ln: mpz_ptr, lnsub1: mpz_ptr, n: c_unsigned_long_int) => void;
    /** An implementation of the probabilistic primality test found in Knuth's Seminumerical Algorithms book. */
    mpz_millerrabin: (n: mpz_srcptr, reps: c_int) => c_int;
    /** Set r to n mod d. */
    mpz_mod: (r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set r to n mod d. */
    mpz_mod_ui: (r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => void;
    /** Set rop to op1 * op2. */
    mpz_mul: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => void;
    /** Set rop to op1 * 2^op2. */
    mpz_mul_2exp: (rop: mpz_ptr, op1: mpz_srcptr, op2: mp_bitcnt_t) => void;
    /** Set rop to op1 * op2. */
    mpz_mul_si: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_signed_long_int) => void;
    /** Set rop to op1 * op2. */
    mpz_mul_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int) => void;
    /** Set rop to -op. */
    mpz_neg: (rop: mpz_ptr, op: mpz_srcptr) => void;
    /** Set rop to the next prime greater than op. */
    mpz_nextprime: (rop: mpz_ptr, op: mpz_srcptr) => void;
    /** Determine whether op is odd. */
    mpz_odd_p: (op: mpz_srcptr) => void;
    /** Return non-zero if op is a perfect power, i.e., if there exist integers a and b, with b > 1, such that op = a^b. */
    mpz_perfect_power_p: (op: mpz_srcptr) => c_int;
    /** Return non-zero if op is a perfect square, i.e., if the square root of op is an integer. */
    mpz_perfect_square_p: (op: mpz_srcptr) => c_int;
    /** Return the population count of op. */
    mpz_popcount: (op: mpz_srcptr) => mp_bitcnt_t;
    /** Set rop to base^exp. The case 0^0 yields 1. */
    mpz_pow_ui: (rop: mpz_ptr, base: mpz_srcptr, exp: c_unsigned_long_int) => void;
    /** Set rop to (base^exp) modulo mod. */
    mpz_powm: (rop: mpz_ptr, base: mpz_srcptr, exp: mpz_srcptr, mod: mpz_srcptr) => void;
    /** Set rop to (base^exp) modulo mod. */
    mpz_powm_sec: (rop: mpz_ptr, base: mpz_srcptr, exp: mpz_srcptr, mod: mpz_srcptr) => void;
    /** Set rop to (base^exp) modulo mod. */
    mpz_powm_ui: (rop: mpz_ptr, base: mpz_srcptr, exp: c_unsigned_long_int, mod: mpz_srcptr) => void;
    /** Determine whether n is prime. */
    mpz_probab_prime_p: (n: mpz_srcptr, reps: c_int) => c_int;
    /** Generate a random integer of at most maxSize limbs. */
    mpz_random: (rop: mpz_ptr, maxSize: mp_size_t) => void;
    /** Generate a random integer of at most maxSize limbs, with long strings of zeros and ones in the binary representation. */
    mpz_random2: (rop: mpz_ptr, maxSize: mp_size_t) => void;
    /** Change the space allocated for x to n bits. */
    mpz_realloc2: (x: mpz_ptr, n: mp_bitcnt_t) => void;
    /** Remove all occurrences of the factor f from op and store the result in rop. */
    mpz_remove: (rop: mpz_ptr, op: mpz_srcptr, f: mpz_srcptr) => mp_bitcnt_t;
    /** Set rop to the truncated integer part of the nth root of op. */
    mpz_root: (rop: mpz_ptr, op: mpz_srcptr, n: c_unsigned_long_int) => c_int;
    /** Set root to the truncated integer part of the nth root of u. Set rem to the remainder, u - root^n. */
    mpz_rootrem: (root: mpz_ptr, rem: mpz_ptr, u: mpz_srcptr, n: c_unsigned_long_int) => void;
    /** Generate a random integer with long strings of zeros and ones in the binary representation. */
    mpz_rrandomb: (rop: mpz_ptr, state: gmp_randstate_t, n: mp_bitcnt_t) => void;
    /** Scan op for 0 bit. */
    mpz_scan0: (op: mpz_srcptr, startingBit: mp_bitcnt_t) => mp_bitcnt_t;
    /** Scan op for 1 bit. */
    mpz_scan1: (op: mpz_srcptr, startingBit: mp_bitcnt_t) => mp_bitcnt_t;
    /** Set the value of rop from op. */
    mpz_set: (rop: mpz_ptr, op: mpz_srcptr) => void;
    /** Set the value of rop from op. */
    mpz_set_d: (rop: mpz_ptr, op: c_double) => void;
    /** Set the value of rop from op. */
    mpz_set_q: (rop: mpz_ptr, op: mpq_srcptr) => void;
    /** Set the value of rop from op. */
    mpz_set_si: (rop: mpz_ptr, op: c_signed_long_int) => void;
    /** Set the value of rop from str, a null-terminated C string in base base. */
    mpz_set_str: (rop: mpz_ptr, str: c_str_ptr, base: c_int) => c_int;
    /** Set the value of rop from op. */
    mpz_set_ui: (rop: mpz_ptr, op: c_unsigned_long_int) => void;
    /** Set bit bitIndex in rop. */
    mpz_setbit: (rop: mpz_ptr, bitIndex: mp_bitcnt_t) => void;
    /** Return +1 if op > 0, 0 if op = 0, and -1 if op < 0. */
    mpz_sgn: (op: mpz_ptr) => c_int;
    /** Return the size of op measured in number of limbs. */
    mpz_size: (op: mpz_srcptr) => c_size_t;
    /** Return the size of op measured in number of digits in the given base. */
    mpz_sizeinbase: (op: mpz_srcptr, base: c_int) => c_size_t;
    /** Set rop to the truncated integer part of the square root of op. */
    mpz_sqrt: (rop: mpz_ptr, op: mpz_srcptr) => void;
    /** Set rop1 to the truncated integer part of the square root of op, like mpz_sqrt. Set rop2 to the remainder op - rop1 * rop1, which will be zero if op is a perfect square. */
    mpz_sqrtrem: (rop1: mpz_ptr, rop2: mpz_ptr, op: mpz_srcptr) => void;
    /** Set rop to op1 - op2. */
    mpz_sub: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => void;
    /** Set rop to op1 - op2. */
    mpz_sub_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int) => void;
    /** Set rop to op1 - op2. */
    mpz_ui_sub: (rop: mpz_ptr, op1: c_unsigned_long_int, op2: mpz_srcptr) => void;
    /** Set rop to rop - op1 * op2. */
    mpz_submul: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => void;
    /** Set rop to rop - op1 * op2. */
    mpz_submul_ui: (rop: mpz_ptr, op1: mpz_srcptr, op2: c_unsigned_long_int) => void;
    /** Swap the values rop1 and rop2 efficiently. */
    mpz_swap: (rop1: mpz_ptr, rop2: mpz_ptr) => void;
    /** Return the remainder | r | where r = n - q * d, and where q = trunc(n / d). */
    mpz_tdiv_ui: (n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Set the quotient q to trunc(n / d). */
    mpz_tdiv_q: (q: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set the quotient q to trunc(n / 2^b). */
    mpz_tdiv_q_2exp: (q: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t) => void;
    /** Set the quotient q to trunc(n / d), and return the remainder r = | n - q * d |. */
    mpz_tdiv_q_ui: (q: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Set the quotient q to trunc(n / d), and set the remainder r to n - q * d. */
    mpz_tdiv_qr: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set quotient q to trunc(n / d), set the remainder r to n - q * d, and return | r |. */
    mpz_tdiv_qr_ui: (q: mpz_ptr, r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Set the remainder r to n - q * d where q = trunc(n / d). */
    mpz_tdiv_r: (r: mpz_ptr, n: mpz_srcptr, d: mpz_srcptr) => void;
    /** Set the remainder r to n - q * 2^b where q = trunc(n / 2^b). */
    mpz_tdiv_r_2exp: (r: mpz_ptr, n: mpz_srcptr, b: mp_bitcnt_t) => void;
    /** Set the remainder r to n - q * d where q = trunc(n / d), and return | r |. */
    mpz_tdiv_r_ui: (r: mpz_ptr, n: mpz_srcptr, d: c_unsigned_long_int) => c_unsigned_long_int;
    /** Test bit bitIndex in op and return 0 or 1 accordingly. */
    mpz_tstbit: (op: mpz_srcptr, bitIndex: mp_bitcnt_t) => c_int;
    /** Set rop to base^exp. The case 0^0 yields 1. */
    mpz_ui_pow_ui: (rop: mpz_ptr, base: c_unsigned_long_int, exp: c_unsigned_long_int) => void;
    /** Generate a uniformly distributed random integer in the range 0 to 2^n - 1, inclusive. */
    mpz_urandomb: (rop: mpz_ptr, state: gmp_randstate_t, n: mp_bitcnt_t) => void;
    /** Generate a uniform random integer in the range 0 to n - 1, inclusive. */
    mpz_urandomm: (rop: mpz_ptr, state: gmp_randstate_t, n: mpz_srcptr) => void;
    /** Set rop to op1 bitwise exclusive-or op2. */
    mpz_xor: (rop: mpz_ptr, op1: mpz_srcptr, op2: mpz_srcptr) => void;
    /** Return a pointer to the limb array representing the absolute value of x. */
    mpz_limbs_read: (x: mpz_srcptr) => mp_srcptr;
    /** Return a pointer to the limb array of x, intended for write access. */
    mpz_limbs_write: (x: mpz_ptr, n: mp_size_t) => mp_ptr;
    /** Return a pointer to the limb array of x, intended for write access. */
    mpz_limbs_modify: (x: mpz_ptr, n: mp_size_t) => mp_ptr;
    /** Updates the internal size field of x. */
    mpz_limbs_finish: (x: mpz_ptr, s: mp_size_t) => void;
    /** Special initialization of x, using the given limb array and size. */
    mpz_roinit_n: (x: mpz_ptr, xp: mp_srcptr, xs: mp_size_t) => mpz_srcptr;
    /**************** Rational (i.e. Q) routines.  ****************/
    /** Allocates memory for the mpq_t C struct and returns pointer */
    mpq_t: () => mpq_ptr;
    /** Deallocates memory of a mpq_t C struct */
    mpq_t_free: (mpq_ptr: mpq_ptr) => void;
    /** Deallocates memory of a NULL-terminated list of mpq_t variables */
    mpq_t_frees: (...ptrs: mpq_ptr[]) => void;
    /** Set rop to the absolute value of op. */
    mpq_abs: (rop: mpq_ptr, op: mpq_srcptr) => void;
    /** Set sum to addend1 + addend2. */
    mpq_add: (sum: mpq_ptr, addend1: mpq_srcptr, addend2: mpq_srcptr) => void;
    /** Remove any factors that are common to the numerator and denominator of op, and make the denominator positive. */
    mpq_canonicalize: (op: mpq_ptr) => void;
    /** Free the space occupied by x. */
    mpq_clear: (x: mpq_ptr) => void;
    /** Free the space occupied by a NULL-terminated list of mpq_t variables. */
    mpq_clears: (...ptrs: mpq_ptr[]) => void;
    /** Compare op1 and op2. */
    mpq_cmp: (op1: mpq_srcptr, op2: mpq_srcptr) => c_int;
    /** Compare op1 and num2 / den2. */
    mpq_cmp_si: (op1: mpq_srcptr, num2: c_signed_long_int, den2: c_unsigned_long_int) => c_int;
    /** Compare op1 and num2 / den2. */
    mpq_cmp_ui: (op1: mpq_srcptr, num2: c_unsigned_long_int, den2: c_unsigned_long_int) => c_int;
    /** Compare op1 and op2. */
    mpq_cmp_z: (op1: mpq_srcptr, op2: mpz_srcptr) => c_int;
    /** Set quotient to dividend / divisor. */
    mpq_div: (quotient: mpq_ptr, dividend: mpq_srcptr, divisor: mpq_srcptr) => void;
    /** Set rop to op1 / 2^op2. */
    mpq_div_2exp: (rop: mpq_ptr, op1: mpq_srcptr, op2: mp_bitcnt_t) => void;
    /** Return non-zero if op1 and op2 are equal, zero if they are non-equal. */
    mpq_equal: (op1: mpq_srcptr, op2: mpq_srcptr) => c_int;
    /** Set numerator to the numerator of rational. */
    mpq_get_num: (numerator: mpz_ptr, rational: mpq_srcptr) => void;
    /** Set denominator to the denominator of rational. */
    mpq_get_den: (denominator: mpz_ptr, rational: mpq_srcptr) => void;
    /** Convert op to a double, truncating if necessary (i.e. rounding towards zero). */
    mpq_get_d: (op: mpq_srcptr) => c_double;
    /** Convert op to a string of digits in base base. */
    mpq_get_str: (str: c_str_ptr, base: c_int, op: mpq_srcptr) => c_str_ptr;
    /** Initialize x and set it to 0/1. */
    mpq_init: (x: mpq_ptr) => void;
    /** Initialize a NULL-terminated list of mpq_t variables, and set their values to 0/1. */
    mpq_inits: (...ptrs: mpq_ptr[]) => void;
    /** Set inverted_number to 1 / number. */
    mpq_inv: (inverted_number: mpq_ptr, number: mpq_srcptr) => void;
    /** Set product to multiplier * multiplicand. */
    mpq_mul: (product: mpq_ptr, multiplier: mpq_srcptr, multiplicand: mpq_srcptr) => void;
    /** Set rop to op1 * 2*op2. */
    mpq_mul_2exp: (rop: mpq_ptr, op1: mpq_srcptr, op2: mp_bitcnt_t) => void;
    /** Set negated_operand to -operand. */
    mpq_neg: (negated_operand: mpq_ptr, operand: mpq_srcptr) => void;
    /** Assign rop from op. */
    mpq_set: (rop: mpq_ptr, op: mpq_srcptr) => void;
    /** Set rop to the value of op. There is no rounding, this conversion is exact. */
    mpq_set_d: (rop: mpq_ptr, op: c_double) => void;
    /** Set the denominator of rational to denominator. */
    mpq_set_den: (rational: mpq_ptr, denominator: mpz_srcptr) => void;
    /** Set the numerator of rational to numerator. */
    mpq_set_num: (rational: mpq_ptr, numerator: mpz_srcptr) => void;
    /** Set the value of rop to op1 / op2. */
    mpq_set_si: (rop: mpq_ptr, op1: c_signed_long_int, op2: c_unsigned_long_int) => void;
    /** Set rop from a null-terminated string str in the given base. */
    mpq_set_str: (rop: mpq_ptr, str: c_str_ptr, base: c_int) => c_int;
    /** Set the value of rop to op1 / op2. */
    mpq_set_ui: (rop: mpq_ptr, op1: c_unsigned_long_int, op2: c_unsigned_long_int) => void;
    /** Assign rop from op. */
    mpq_set_z: (rop: mpq_ptr, op: mpz_srcptr) => void;
    /** Return +1 if op > 0, 0 if op = 0, and -1 if op < 0. */
    mpq_sgn: (op: mpq_ptr) => c_int;
    /** Set difference to minuend - subtrahend. */
    mpq_sub: (difference: mpq_ptr, minuend: mpq_srcptr, subtrahend: mpq_srcptr) => void;
    /** Swap the values rop1 and rop2 efficiently. */
    mpq_swap: (rop1: mpq_ptr, rop2: mpq_ptr) => void;
    /** Return a reference to the numerator of op. */
    mpq_numref: (op: mpq_ptr) => mpz_ptr;
    /** Return a reference to the denominator of op. */
    mpq_denref: (op: mpq_ptr) => mpz_ptr;
    /**************** MPFR  ****************/
    /** Allocates memory for the mpfr_t C struct and returns pointer */
    mpfr_t: () => mpfr_ptr;
    /** Deallocates memory of a mpfr_t C struct */
    mpfr_t_free: (mpfr_ptr: mpfr_ptr) => void;
    /** Deallocates memory of a NULL-terminated list of mpfr_t variables */
    mpfr_t_frees: (...ptrs: mpfr_ptr[]) => void;
    /** Return the MPFR version, as a null-terminated string. */
    mpfr_get_version: () => c_str_ptr;
    /** Return a null-terminated string containing the ids of the patches applied to the MPFR library (contents of the PATCHES file), separated by spaces. */
    /** Return a non-zero value if MPFR was compiled as thread safe using compiler-level Thread Local Storage, return zero otherwise. */
    /** Return a non-zero value if MPFR was compiled with ‘__float128’ support, return zero otherwise. */
    /** Return a non-zero value if MPFR was compiled with decimal float support, return zero otherwise. */
    /** Return a non-zero value if MPFR was compiled with GMP internals, return zero otherwise. */
    /** Return a non-zero value if MPFR was compiled so that all threads share the same cache for one MPFR constant, return zero otherwise. */
    /** Return a string saying which thresholds file has been used at compile time. */
    /** Return the (current) smallest exponent allowed for a floating-point variable. */
    mpfr_get_emin: () => mpfr_exp_t;
    /** Set the smallest exponent allowed for a floating-point variable. */
    mpfr_set_emin: (exp: mpfr_exp_t) => c_int;
    /** Return the minimum exponent allowed for mpfr_set_emin. */
    mpfr_get_emin_min: () => mpfr_exp_t;
    /** Return the maximum exponent allowed for mpfr_set_emin. */
    mpfr_get_emin_max: () => mpfr_exp_t;
    /** Return the (current) largest exponent allowed for a floating-point variable. */
    mpfr_get_emax: () => mpfr_exp_t;
    /** Set the largest exponent allowed for a floating-point variable. */
    mpfr_set_emax: (exp: mpfr_exp_t) => c_int;
    /** Return the minimum exponent allowed for mpfr_set_emax. */
    mpfr_get_emax_min: () => mpfr_exp_t;
    /** Return the maximum exponent allowed for mpfr_set_emax. */
    mpfr_get_emax_max: () => mpfr_exp_t;
    /** Set the default rounding mode to rnd. */
    mpfr_set_default_rounding_mode: (rnd: mpfr_rnd_t) => void;
    /** Get the default rounding mode. */
    mpfr_get_default_rounding_mode: () => mpfr_rnd_t;
    /** Return a string ("MPFR_RNDD", "MPFR_RNDU", "MPFR_RNDN", "MPFR_RNDZ", "MPFR_RNDA") corresponding to the rounding mode rnd, or a null pointer if rnd is an invalid rounding mode. */
    /** Clear (lower) all global flags (underflow, overflow, divide-by-zero, invalid, inexact, erange). */
    mpfr_clear_flags: () => void;
    /** Clear (lower) the underflow flag. */
    mpfr_clear_underflow: () => void;
    /** Clear (lower) the overflow flag. */
    mpfr_clear_overflow: () => void;
    /** Clear (lower) the divide-by-zero flag. */
    mpfr_clear_divby0: () => void;
    /** Clear (lower) the invalid flag. */
    mpfr_clear_nanflag: () => void;
    /** Clear (lower) the inexact flag. */
    mpfr_clear_inexflag: () => void;
    /** Clear (lower) the erange flag. */
    mpfr_clear_erangeflag: () => void;
    /** Set (raised) the underflow flag. */
    mpfr_set_underflow: () => void;
    /** Set (raised) the overflow flag. */
    mpfr_set_overflow: () => void;
    /** Set (raised) the divide-by-zero flag. */
    mpfr_set_divby0: () => void;
    /** Set (raised) the invalid flag. */
    mpfr_set_nanflag: () => void;
    /** Set (raised) the inexact flag. */
    mpfr_set_inexflag: () => void;
    /** Set (raised) the erange flag. */
    mpfr_set_erangeflag: () => void;
    /** Return the underflow flag, which is non-zero iff the flag is set. */
    mpfr_underflow_p: () => c_int;
    /** Return the overflow flag, which is non-zero iff the flag is set. */
    mpfr_overflow_p: () => c_int;
    /** Return the divide-by-zero flag, which is non-zero iff the flag is set. */
    mpfr_divby0_p: () => c_int;
    /** Return the invalid flag, which is non-zero iff the flag is set. */
    mpfr_nanflag_p: () => c_int;
    /** Return the inexact flag, which is non-zero iff the flag is set. */
    mpfr_inexflag_p: () => c_int;
    /** Return the erange flag, which is non-zero iff the flag is set. */
    mpfr_erangeflag_p: () => c_int;
    /** Clear (lower) the group of flags specified by mask. */
    mpfr_flags_clear: (mask: mpfr_flags_t) => void;
    /** Set (raise) the group of flags specified by mask. */
    mpfr_flags_set: (mask: mpfr_flags_t) => void;
    /** Return the flags specified by mask. */
    mpfr_flags_test: (mask: mpfr_flags_t) => mpfr_flags_t;
    /** Return all the flags. */
    mpfr_flags_save: () => mpfr_flags_t;
    /** Restore the flags specified by mask to their state represented in flags. */
    mpfr_flags_restore: (flags: mpfr_flags_t, mask: mpfr_flags_t) => void;
    /** Check that x is within the current range of acceptable values. */
    mpfr_check_range: (x: mpfr_ptr, t: c_int, rnd: mpfr_rnd_t) => c_int;
    /** Initialize x, set its precision to be exactly prec bits and its value to NaN. */
    mpfr_init2: (x: mpfr_ptr, prec: mpfr_prec_t) => void;
    /** Initialize all the mpfr_t variables of the given variable argument x, set their precision to be exactly prec bits and their value to NaN. */
    mpfr_inits2: (prec: mpfr_prec_t, ...ptrs: mpfr_ptr[]) => void;
    /** Initialize x, set its precision to the default precision, and set its value to NaN. */
    mpfr_init: (x: mpfr_ptr) => void;
    /** Initialize all the mpfr_t variables of the given list x, set their precision to the default precision and their value to NaN. */
    mpfr_inits: (...ptrs: mpfr_ptr[]) => void;
    /** Free the space occupied by the significand of x. */
    mpfr_clear: (x: mpfr_ptr) => void;
    /** Free the space occupied by all the mpfr_t variables of the given list x. */
    mpfr_clears: (...ptrs: mpfr_ptr[]) => void;
    /** Round x according to rnd with precision prec, which must be an integer between MPFR_PREC_MIN and MPFR_PREC_MAX (otherwise the behavior is undefined). */
    mpfr_prec_round: (x: mpfr_ptr, prec: mpfr_prec_t, rnd: mpfr_rnd_t) => c_int;
    /** Return non-zero value if one is able to round correctly x to precision prec with the direction rnd2, and 0 otherwise. */
    mpfr_can_round: (b: mpfr_srcptr, err: mpfr_exp_t, rnd1: mpfr_rnd_t, rnd2: mpfr_rnd_t, prec: mpfr_prec_t) => c_int;
    /** Return the minimal number of bits required to store the significand of x, and 0 for special values, including 0. */
    mpfr_min_prec: (x: mpfr_srcptr) => mpfr_prec_t;
    /** Return the exponent of x, assuming that x is a non-zero ordinary number and the significand is considered in [1/2,1). */
    mpfr_get_exp: (x: mpfr_srcptr) => mpfr_exp_t;
    /** Set the exponent of x if e is in the current exponent range. */
    mpfr_set_exp: (x: mpfr_ptr, e: mpfr_exp_t) => c_int;
    /** Return the precision of x, i.e., the number of bits used to store its significand. */
    mpfr_get_prec: (x: mpfr_srcptr) => mpfr_prec_t;
    /** Reset the precision of x to be exactly prec bits, and set its value to NaN. */
    mpfr_set_prec: (x: mpfr_ptr, prec: mpfr_prec_t) => void;
    /** Reset the precision of x to be exactly prec bits. */
    mpfr_set_prec_raw: (x: mpfr_ptr, prec: mpfr_prec_t) => void;
    /** Set the default precision to be exactly prec bits, where prec can be any integer between MPFR_PREC_MINand MPFR_PREC_MAX. */
    mpfr_set_default_prec: (prec: mpfr_prec_t) => void;
    /** Return the current default MPFR precision in bits. */
    mpfr_get_default_prec: () => mpfr_prec_t;
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set_d: (rop: mpfr_ptr, op: c_double, rnd: mpfr_rnd_t) => c_int;
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set_z: (rop: mpfr_ptr, op: mpz_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set the value of rop from op multiplied by two to the power e, rounded toward the given direction rnd. */
    mpfr_set_z_2exp: (rop: mpfr_ptr, op: mpz_srcptr, e: mpfr_exp_t, rnd: mpfr_rnd_t) => c_int;
    /** Set the variable x to NaN (Not-a-Number). */
    mpfr_set_nan: (x: mpfr_ptr) => void;
    /** Set the variable x to infinity. */
    mpfr_set_inf: (x: mpfr_ptr, sign: c_int) => void;
    /** Set the variable x to zero. */
    mpfr_set_zero: (x: mpfr_ptr, sign: c_int) => void;
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set_si: (rop: mpfr_ptr, op: c_signed_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set_ui: (rop: mpfr_ptr, op: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set the value of rop from op multiplied by two to the power e, rounded toward the given direction rnd. */
    mpfr_set_si_2exp: (rop: mpfr_ptr, op: c_signed_long_int, e: mpfr_exp_t, rnd: mpfr_rnd_t) => c_int;
    /** Set the value of rop from op multiplied by two to the power e, rounded toward the given direction rnd. */
    mpfr_set_ui_2exp: (rop: mpfr_ptr, op: c_unsigned_long_int, e: mpfr_exp_t, rnd: mpfr_rnd_t) => c_int;
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set_q: (rop: mpfr_ptr, op: mpq_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul_q: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpq_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div_q: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpq_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add_q: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpq_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub_q: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpq_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Compare op1 and op2. */
    mpfr_cmp_q: (op1: mpfr_srcptr, op2: mpq_srcptr) => c_int;
    /** Convert op to a mpq_t. */
    mpfr_get_q: (rop: mpq_ptr, op: mpfr_srcptr) => void;
    /** Set rop to the value of the string s in base base, rounded in the direction rnd. */
    mpfr_set_str: (rop: mpfr_ptr, s: c_str_ptr, base: c_int, rnd: mpfr_rnd_t) => c_int;
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => any;
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set_ui: (rop: mpfr_ptr, op: number, rnd: mpfr_rnd_t) => any;
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set_si: (rop: mpfr_ptr, op: number, rnd: mpfr_rnd_t) => any;
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set_d: (rop: mpfr_ptr, op: number, rnd: mpfr_rnd_t) => any;
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set_z: (rop: mpfr_ptr, op: mpz_srcptr, rnd: mpfr_rnd_t) => any;
    /** Initialize rop and set its value from op, rounded in the direction rnd. */
    mpfr_init_set_q: (rop: mpfr_ptr, op: mpq_srcptr, rnd: mpfr_rnd_t) => any;
    /** Initialize x and set its value from the string s in base base, rounded in the direction rnd. */
    mpfr_init_set_str: (x: mpfr_ptr, s: c_str_ptr, base: c_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the absolute value of op rounded in the direction rnd. */
    mpfr_abs: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set the value of rop from op rounded toward the given direction rnd. */
    mpfr_set: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to -op rounded in the direction rnd. */
    mpfr_neg: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Return a non-zero value iff op has its sign bit set (i.e., if it is negative, -0, or a NaN whose representation has its sign bit set). */
    mpfr_signbit: (op: mpfr_srcptr) => c_int;
    /** Set the value of rop from op, rounded toward the given direction rnd, then set (resp. clear) its sign bit if s is non-zero (resp. zero), even when op is a NaN. */
    mpfr_setsign: (rop: mpfr_ptr, op: mpfr_srcptr, s: c_int, rnd: mpfr_rnd_t) => c_int;
    /** Set the value of rop from op1, rounded toward the given direction rnd, then set its sign bit to that of op2 (even when op1 or op2 is a NaN). */
    mpfr_copysign: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Put the scaled significand of op (regarded as an integer, with the precision of op) into rop, and return the exponent exp (which may be outside the current exponent range) such that op = rop * 2^exp. */
    mpfr_get_z_2exp: (rop: mpz_ptr, op: mpfr_srcptr) => mpfr_exp_t;
    /** Convert op to a double, using the rounding mode rnd. */
    mpfr_get_d: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_double;
    /** Return d and set exp such that 0.5 ≤ abs(d) <1 and d * 2^exp = op rounded to double precision, using the given rounding mode. */
    mpfr_get_d_2exp: (exp: c_long_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_double;
    /** Set exp and y such that 0.5 ≤ abs(y) < 1 and y * 2^exp = x rounded to the precision of y, using the given rounding mode. */
    mpfr_frexp: (exp: mpfr_exp_t_ptr, y: mpfr_ptr, x: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Convert op to a long after rounding it with respect to rnd. */
    mpfr_get_si: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_signed_long_int;
    /** Convert op to an unsigned long after rounding it with respect to rnd. */
    mpfr_get_ui: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_unsigned_long_int;
    /** Return the minimal integer m such that any number of p bits, when output with m digits in radix b with rounding to nearest, can be recovered exactly when read again, still with rounding to nearest. More precisely, we have m = 1 + ceil(p*log(2)/log(b)), with p replaced by p-1 if b is a power of 2. */
    mpfr_get_str_ndigits: (b: c_int, p: mpfr_prec_t) => c_size_t;
    /** Convert op to a string of digits in base b, with rounding in the direction rnd, where n is either zero (see below) or the number of significant digits output in the string; in the latter case, n must be greater or equal to 2. */
    mpfr_get_str: (str: c_str_ptr, expptr: mpfr_exp_t_ptr, base: c_int, n: c_size_t, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_str_ptr;
    /** Convert op to a mpz_t, after rounding it with respect to rnd. */
    mpfr_get_z: (rop: mpz_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Free a string allocated by mpfr_get_str using the unallocation function (see GNU MPFR - Memory Handling). */
    mpfr_free_str: (str: c_str_ptr) => void;
    /** Generate a uniformly distributed random float. */
    mpfr_urandom: (rop: mpfr_ptr, state: gmp_randstate_t, rnd: mpfr_rnd_t) => c_int;
    /** Generate one random float according to a standard normal gaussian distribution (with mean zero and variance one). */
    mpfr_nrandom: (rop: mpfr_ptr, state: gmp_randstate_t, rnd: mpfr_rnd_t) => c_int;
    /** Generate one random float according to an exponential distribution, with mean one. */
    mpfr_erandom: (rop: mpfr_ptr, state: gmp_randstate_t, rnd: mpfr_rnd_t) => c_int;
    /** Generate a uniformly distributed random float in the interval 0 ≤ rop < 1. */
    mpfr_urandomb: (rop: mpfr_ptr, state: gmp_randstate_t) => c_int;
    /** Equivalent to mpfr_nexttoward where y is plus infinity. */
    mpfr_nextabove: (x: mpfr_ptr) => void;
    /** Equivalent to mpfr_nexttoward where y is minus infinity. */
    mpfr_nextbelow: (x: mpfr_ptr) => void;
    /** Replace x by the next floating-point number in the direction of y. */
    mpfr_nexttoward: (x: mpfr_ptr, y: mpfr_srcptr) => void;
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_pow: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_pow_si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_pow_ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_ui_pow_ui: (rop: mpfr_ptr, op1: c_unsigned_long_int, op2: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_ui_pow: (rop: mpfr_ptr, op1: c_unsigned_long_int, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 raised to op2, rounded in the direction rnd. */
    mpfr_pow_z: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpz_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the square root of op rounded in the direction rnd. */
    mpfr_sqrt: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the square root of op rounded in the direction rnd. */
    mpfr_sqrt_ui: (rop: mpfr_ptr, op: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the reciprocal square root of op rounded in the direction rnd. */
    mpfr_rec_sqrt: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add_ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub_ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_ui_sub: (rop: mpfr_ptr, op1: c_unsigned_long_int, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul_ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div_ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_ui_div: (rop: mpfr_ptr, op1: c_unsigned_long_int, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add_si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub_si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_si_sub: (rop: mpfr_ptr, op1: c_signed_long_int, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul_si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div_si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_si_div: (rop: mpfr_ptr, op1: c_signed_long_int, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add_d: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_double, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub_d: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_double, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_d_sub: (rop: mpfr_ptr, op1: c_double, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul_d: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_double, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div_d: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_double, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_d_div: (rop: mpfr_ptr, op1: c_double, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the square of op rounded in the direction rnd. */
    mpfr_sqr: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of Pi rounded in the direction rnd. */
    mpfr_const_pi: (rop: mpfr_ptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the logarithm of 2 rounded in the direction rnd. */
    mpfr_const_log2: (rop: mpfr_ptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of Euler’s constant 0.577… rounded in the direction rnd. */
    mpfr_const_euler: (rop: mpfr_ptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of Catalan’s constant 0.915… rounded in the direction rnd. */
    mpfr_const_catalan: (rop: mpfr_ptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the arithmetic-geometric mean of op1 and op2 rounded in the direction rnd. */
    mpfr_agm: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the natural logarithm of op rounded in the direction rnd. */
    mpfr_log: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to log2(op) rounded in the direction rnd. */
    mpfr_log2: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to log10(op) rounded in the direction rnd. */
    mpfr_log10: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the logarithm of one plus op, rounded in the direction rnd. */
    mpfr_log1p: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the natural logarithm of op rounded in the direction rnd. */
    mpfr_log_ui: (rop: mpfr_ptr, op: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the exponential of op rounded in the direction rnd. */
    mpfr_exp: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to 2^op rounded in the direction rnd. */
    mpfr_exp2: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to 10^op rounded in the direction rnd. */
    mpfr_exp10: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the e^op - 1, rounded in the direction rnd. */
    mpfr_expm1: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the exponential integral of op rounded in the direction rnd. */
    mpfr_eint: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to real part of the dilogarithm of op rounded in the direction rnd. */
    mpfr_li2: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Compare op1 and op2. */
    mpfr_cmp: (op1: mpfr_srcptr, op2: mpfr_srcptr) => c_int;
    /** Compare op1 and op2. */
    mpfr_cmp_d: (op1: mpfr_srcptr, op2: c_double) => c_int;
    /** Compare op1 and op2. */
    mpfr_cmp_ui: (op1: mpfr_srcptr, op2: c_unsigned_long_int) => c_int;
    /** Compare op1 and op2. */
    mpfr_cmp_si: (op1: mpfr_srcptr, op2: c_signed_long_int) => c_int;
    /** Compare op1 and op2 * 2^e. */
    mpfr_cmp_ui_2exp: (op1: mpfr_srcptr, op2: c_unsigned_long_int, e: mpfr_exp_t) => c_int;
    /** Compare op1 and op2 * 2^e. */
    mpfr_cmp_si_2exp: (op1: mpfr_srcptr, op2: c_signed_long_int, e: mpfr_exp_t) => c_int;
    /** Compare |op1| and |op2|. */
    mpfr_cmpabs: (op1: mpfr_srcptr, op2: mpfr_srcptr) => c_int;
    /** Compare |op1| and |op2|. */
    mpfr_cmpabs_ui: (op1: mpfr_srcptr, op2: c_unsigned_long_int) => c_int;
    /** Compute the relative difference between op1 and op2 and store the result in rop. */
    mpfr_reldiff: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => void;
    /** Return non-zero if op1 and op2 are both non-zero ordinary numbers with the same exponent and the same first op3 bits. */
    mpfr_eq: (op1: mpfr_srcptr, op2: mpfr_srcptr, op3: c_unsigned_long_int) => c_int;
    /** Return a positive value if op > 0, zero if op = 0, and a negative value if op < 0. */
    mpfr_sgn: (op: mpfr_srcptr) => c_int;
    /** Set rop to op1 * 2^op2 rounded in the direction rnd. */
    mpfr_mul_2exp: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 divided by 2^op2 rounded in the direction rnd. */
    mpfr_div_2exp: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 * 2^op2 rounded in the direction rnd. */
    mpfr_mul_2ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 divided by 2^op2 rounded in the direction rnd. */
    mpfr_div_2ui: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 * 2^op2 rounded in the direction rnd. */
    mpfr_mul_2si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 divided by 2^op2 rounded in the direction rnd. */
    mpfr_div_2si: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: c_signed_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op rounded to the nearest representable integer in the given direction rnd. */
    mpfr_rint: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op rounded to the nearest representable integer, rounding halfway cases with the even-rounding rule zero (like mpfr_rint(mpfr_t, mpfr_t, mpfr_rnd_t) with MPFR_RNDN). */
    mpfr_roundeven: (rop: mpfr_ptr, op: mpfr_srcptr) => c_int;
    /** Set rop to op rounded to the nearest representable integer, rounding halfway cases away from zero (as in the roundTiesToAway mode of IEEE 754-2008). */
    mpfr_round: (rop: mpfr_ptr, op: mpfr_srcptr) => c_int;
    /** Set rop to op rounded to the next representable integer toward zero (like mpfr_rint(mpfr_t, mpfr_t, mpfr_rnd_t) with MPFR_RNDZ). */
    mpfr_trunc: (rop: mpfr_ptr, op: mpfr_srcptr) => c_int;
    /** Set rop to op rounded to the next higher or equal representable integer (like mpfr_rint(mpfr_t, mpfr_t, mpfr_rnd_t) with MPFR_RNDU). */
    mpfr_ceil: (rop: mpfr_ptr, op: mpfr_srcptr) => c_int;
    /** Set rop to op rounded to the next lower or equal representable integer. */
    mpfr_floor: (rop: mpfr_ptr, op: mpfr_srcptr) => c_int;
    /** Set rop to op rounded to the nearest integer, rounding halfway cases to the nearest even integer. */
    mpfr_rint_roundeven: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op rounded to the nearest integer, rounding halfway cases away from zero. */
    mpfr_rint_round: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op rounded to the next integer toward zero. */
    mpfr_rint_trunc: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op rounded to the next higher or equal integer. */
    mpfr_rint_ceil: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op rounded to the next lower or equal integer. */
    mpfr_rint_floor: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the fractional part of op, having the same sign as op, rounded in the direction rnd. */
    mpfr_frac: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set simultaneously iop to the integral part of op and fop to the fractional part of op, rounded in the direction rnd with the corresponding precision of iop and fop. */
    mpfr_modf: (rop: mpfr_ptr, fop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded to the nearest integer (ties rounded to even). */
    mpfr_remquo: (r: mpfr_ptr, q: c_long_ptr, x: mpfr_srcptr, y: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded to the nearest integer (ties rounded to even). */
    mpfr_remainder: (rop: mpfr_ptr, x: mpfr_srcptr, y: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded toward zero. */
    mpfr_fmod: (rop: mpfr_ptr, x: mpfr_srcptr, y: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded toward zero. */
    mpfr_fmodquo: (rop: mpfr_ptr, q: c_long_ptr, x: mpfr_srcptr, y: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Return non-zero if op would fit in the C data type (32-bit) unsigned long when rounded to an integer in the direction rnd. */
    mpfr_fits_ulong_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Return non-zero if op would fit in the C data type (32-bit) long when rounded to an integer in the direction rnd. */
    mpfr_fits_slong_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Return non-zero if op would fit in the C data type (32-bit) unsigned int when rounded to an integer in the direction rnd. */
    mpfr_fits_uint_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Return non-zero if op would fit in the C data type (32-bit) int when rounded to an integer in the direction rnd. */
    mpfr_fits_sint_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Return non-zero if op would fit in the C data type (16-bit) unsigned short when rounded to an integer in the direction rnd. */
    mpfr_fits_ushort_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Return non-zero if op would fit in the C data type (16-bit) short when rounded to an integer in the direction rnd. */
    mpfr_fits_sshort_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Return non-zero if op would fit in the C data type (32-bit) unsigned long when rounded to an integer in the direction rnd. */
    mpfr_fits_uintmax_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Return non-zero if op would fit in the C data type (32-bit) long when rounded to an integer in the direction rnd. */
    mpfr_fits_intmax_p: (op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Swap the structures pointed to by x and y. */
    mpfr_swap: (x: mpfr_ptr, y: mpfr_ptr) => void;
    /** Return non-zero if op is NaN. Return zero otherwise. */
    mpfr_nan_p: (op: mpfr_srcptr) => c_int;
    /** Return non-zero if op is an infinity. Return zero otherwise. */
    mpfr_inf_p: (op: mpfr_srcptr) => c_int;
    /** Return non-zero if op is an ordinary number (i.e., neither NaN nor an infinity). Return zero otherwise. */
    mpfr_number_p: (op: mpfr_srcptr) => c_int;
    /** Return non-zero iff op is an integer. */
    mpfr_integer_p: (op: mpfr_srcptr) => c_int;
    /** Return non-zero if op is zero. Return zero otherwise. */
    mpfr_zero_p: (op: mpfr_srcptr) => c_int;
    /** Return non-zero if op is a regular number (i.e., neither NaN, nor an infinity nor zero). Return zero otherwise. */
    mpfr_regular_p: (op: mpfr_srcptr) => c_int;
    /** Return non-zero if op1 > op2, and zero otherwise. */
    mpfr_greater_p: (op1: mpfr_srcptr, op2: mpfr_srcptr) => c_int;
    /** Return non-zero if op1 ≥ op2, and zero otherwise. */
    mpfr_greaterequal_p: (op1: mpfr_srcptr, op2: mpfr_srcptr) => c_int;
    /** Return non-zero if op1 < op2, and zero otherwise. */
    mpfr_less_p: (op1: mpfr_srcptr, op2: mpfr_srcptr) => c_int;
    /** Return non-zero if op1 ≤ op2, and zero otherwise. */
    mpfr_lessequal_p: (op1: mpfr_srcptr, op2: mpfr_srcptr) => c_int;
    /** Return non-zero if op1 < op2 or op1 > op2 (i.e., neither op1, nor op2 is NaN, and op1 ≠ op2), zero otherwise (i.e., op1 and/or op2 is NaN, or op1 = op2). */
    mpfr_lessgreater_p: (op1: mpfr_srcptr, op2: mpfr_srcptr) => c_int;
    /** Return non-zero if op1 = op2, and zero otherwise. */
    mpfr_equal_p: (op1: mpfr_srcptr, op2: mpfr_srcptr) => c_int;
    /** Return non-zero if op1 or op2 is a NaN (i.e., they cannot be compared), zero otherwise. */
    mpfr_unordered_p: (op1: mpfr_srcptr, op2: mpfr_srcptr) => c_int;
    /** Set rop to the inverse hyperbolic tangent of op rounded in the direction rnd. */
    mpfr_atanh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the inverse hyperbolic cosine of op rounded in the direction rnd. */
    mpfr_acosh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the inverse hyperbolic sine of op rounded in the direction rnd. */
    mpfr_asinh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the hyperbolic cosine of op rounded in the direction rnd. */
    mpfr_cosh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the hyperbolic sine of op rounded in the direction rnd. */
    mpfr_sinh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the hyperbolic tangent of op rounded in the direction rnd. */
    mpfr_tanh: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set simultaneously sop to the hyperbolic sine of op and cop to the hyperbolic cosine of op, rounded in the direction rnd with the corresponding precision of sop and cop, which must be different variables. */
    mpfr_sinh_cosh: (sop: mpfr_ptr, cop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the hyperbolic secant of op rounded in the direction rnd. */
    mpfr_sech: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the hyperbolic cosecant of op rounded in the direction rnd. */
    mpfr_csch: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the hyperbolic cotangent of op rounded in the direction rnd. */
    mpfr_coth: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the arc-cosine of op rounded in the direction rnd. */
    mpfr_acos: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the arc-sine of op rounded in the direction rnd. */
    mpfr_asin: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the arc-tangent of op rounded in the direction rnd. */
    mpfr_atan: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the sine of op rounded in the direction rnd. */
    mpfr_sin: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set simultaneously sop to the sine of op and cop to the cosine of op, rounded in the direction rnd with the corresponding precisions of sop and cop, which must be different variables. */
    mpfr_sin_cos: (sop: mpfr_ptr, cop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the cosine of op rounded in the direction rnd. */
    mpfr_cos: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the tangent of op rounded in the direction rnd. */
    mpfr_tan: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the arc-tangent2 of y and x rounded in the direction rnd. */
    mpfr_atan2: (rop: mpfr_ptr, y: mpfr_srcptr, x: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the secant of op rounded in the direction rnd. */
    mpfr_sec: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the cosecant of op rounded in the direction rnd. */
    mpfr_csc: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the cotangent of op rounded in the direction rnd. */
    mpfr_cot: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the Euclidean norm of x and y, i.e., the square root of the sum of the squares of x and y rounded in the direction rnd. */
    mpfr_hypot: (rop: mpfr_ptr, x: mpfr_srcptr, y: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the error function on op rounded in the direction rnd. */
    mpfr_erf: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the complementary error function on op rounded in the direction rnd. */
    mpfr_erfc: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the cubic root of op rounded in the direction rnd. */
    mpfr_cbrt: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the kth root of op rounded in the direction rnd. */
    mpfr_rootn_ui: (rop: mpfr_ptr, op: mpfr_srcptr, k: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the Gamma function on op rounded in the direction rnd. */
    mpfr_gamma: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the incomplete Gamma function on op and op2, rounded in the direction rnd. */
    mpfr_gamma_inc: (rop: mpfr_ptr, op: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the Beta function at arguments op1 and op2, rounded in the direction rnd. */
    mpfr_beta: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the logarithm of the Gamma function on op rounded in the direction rnd. */
    mpfr_lngamma: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the logarithm of the absolute value of the Gamma function on op rounded in the direction rnd. */
    mpfr_lgamma: (rop: mpfr_ptr, signp: c_int_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the Digamma (sometimes also called Psi) function on op rounded in the direction rnd. */
    mpfr_digamma: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the Riemann Zeta function on op rounded in the direction rnd. */
    mpfr_zeta: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the Riemann Zeta function on op rounded in the direction rnd. */
    mpfr_zeta_ui: (rop: mpfr_ptr, op: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the factorial of op rounded in the direction rnd. */
    mpfr_fac_ui: (rop: mpfr_ptr, op: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the first kind Bessel function of order 0 on op rounded in the direction rnd. */
    mpfr_j0: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the first kind Bessel function of order 1 on op rounded in the direction rnd. */
    mpfr_j1: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the first kind Bessel function of order n on op rounded in the direction rnd. */
    mpfr_jn: (rop: mpfr_ptr, n: c_signed_long_int, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the first kind Bessel function of order 0 on op rounded in the direction rnd. */
    mpfr_y0: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the first kind Bessel function of order 1 on op rounded in the direction rnd. */
    mpfr_y1: (rop: mpfr_ptr, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the first kind Bessel function of order n on op rounded in the direction rnd. */
    mpfr_yn: (rop: mpfr_ptr, n: c_signed_long_int, op: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the value of the Airy function Ai on x rounded in the direction rnd. */
    mpfr_ai: (rop: mpfr_ptr, x: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the minimum of op1 and op2. */
    mpfr_min: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the maximum of op1 and op2. */
    mpfr_max: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the positive difference of op1 and op2, i.e., op1 - op2 rounded in the direction rnd if op1 > op2, +0 if op1 ≤ op2, and NaN if op1 or op2 is NaN. */
    mpfr_dim: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 * op2 rounded in the direction rnd. */
    mpfr_mul_z: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpz_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 / op2 rounded in the direction rnd. */
    mpfr_div_z: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpz_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 + op2 rounded in the direction rnd. */
    mpfr_add_z: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpz_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_sub_z: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpz_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to op1 - op2 rounded in the direction rnd. */
    mpfr_z_sub: (rop: mpfr_ptr, op1: mpz_srcptr, op2: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Compare op1 and op2. */
    mpfr_cmp_z: (op1: mpfr_srcptr, op2: mpz_srcptr) => c_int;
    /** Set rop to (op1 * op2) + op3 rounded in the direction rnd. */
    mpfr_fma: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, op3: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to (op1 * op2) - op3 rounded in the direction rnd. */
    mpfr_fms: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, op3: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to (op1 * op2) + (op3 * op4) rounded in the direction rnd. */
    mpfr_fmma: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, op3: mpfr_srcptr, op4: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to (op1 * op2) - (op3 * op4) rounded in the direction rnd. */
    mpfr_fmms: (rop: mpfr_ptr, op1: mpfr_srcptr, op2: mpfr_srcptr, op3: mpfr_srcptr, op4: mpfr_srcptr, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the sum of all elements of tab, whose size is n, correctly rounded in the direction rnd. */
    mpfr_sum: (rop: mpfr_ptr, tab: mpfr_ptr_ptr, n: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Set rop to the dot product of elements of a by those of b, whose common size is n, correctly rounded in the direction rnd. */
    mpfr_dot: (rop: mpfr_ptr, a: mpfr_ptr_ptr, b: mpfr_ptr_ptr, n: c_unsigned_long_int, rnd: mpfr_rnd_t) => c_int;
    /** Free all caches and pools used by MPFR internally. */
    mpfr_free_cache: () => void;
    /** Free various caches and pools used by MPFR internally, as specified by way, which is a set of flags */
    mpfr_free_cache2: (way: mpfr_free_cache_t) => void;
    /** Free the pools used by MPFR internally. */
    mpfr_free_pool: () => void;
    /** This function should be called before calling mp_set_memory_functions(allocate_function, reallocate_function, free_function). */
    /** This function rounds x emulating subnormal number arithmetic. */
    mpfr_subnormalize: (x: mpfr_ptr, t: c_int, rnd: mpfr_rnd_t) => c_int;
    /** Read a floating-point number from a string nptr in base base, rounded in the direction rnd. */
    mpfr_strtofr: (rop: mpfr_ptr, nptr: c_str_ptr, endptr: c_str_ptr_ptr, base: c_int, rnd: mpfr_rnd_t) => c_int;
    /** Return the needed size in bytes to store the significand of a floating-point number of precision prec. */
    /** Initialize a significand of precision prec. */
    /** Return a pointer to the significand used by a mpfr_t initialized with mpfr_custom_init_set. */
    /** Return the exponent of x */
    /** Inform MPFR that the significand of x has moved due to a garbage collect and update its new position to new_position. */
    /** Perform a dummy initialization of a mpfr_t. */
    /** Return the current kind of a mpfr_t as created by mpfr_custom_init_set. */
    /** This function implements the totalOrder predicate from IEEE 754-2008, where -NaN < -Inf < negative finite numbers < -0 < +0 < positive finite numbers < +Inf < +NaN. It returns a non-zero value (true) when x is smaller than or equal to y for this order relation, and zero (false) otherwise */
    mpfr_total_order_p: (x: mpfr_srcptr, y: mpfr_srcptr) => c_int;
    /**************** Helper functions  ****************/
    /** Converts JS string into MPZ integer */
    mpz_set_string(mpz: mpz_ptr, input: string, base: number): number;
    /** Initializes new MPFR float from JS string */
    mpz_init_set_string(mpz: mpz_ptr, input: string, base: number): number;
    /** Converts MPZ int into JS string */
    mpz_to_string(x: mpz_ptr, base: number): string;
    /** Converts JS string into MPQ rational */
    mpq_set_string(mpq: mpq_ptr, input: string, base: number): number;
    /** Converts MPQ rational into JS string */
    mpq_to_string(x: mpz_ptr, base: number): string;
    /** Converts JS string into MPFR float */
    mpfr_set_string(mpfr: mpfr_t, input: string, base: number, rnd: mpfr_rnd_t): number;
    /** Initializes new MPFR float from JS string */
    mpfr_init_set_string(mpfr: mpfr_t, input: string, base: number, rnd: mpfr_rnd_t): number;
    /** Converts MPFR float into JS string */
    mpfr_to_string(x: mpfr_ptr, base: number, rnd: mpfr_rnd_t): string;
}>;
export {};
