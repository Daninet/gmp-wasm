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
  MPFR_RNDN = 0,  /* round to nearest, with ties to even */
  MPFR_RNDZ = 1,  /* round toward zero */
  MPFR_RNDU = 2,  /* round toward +Inf */
  MPFR_RNDD = 3,  /* round toward -Inf */
  MPFR_RNDA = 4,  /* round away from zero */
  MPFR_RNDF = 5,  /* faithful rounding */
  MPFR_RNDNA = -1, /* round to nearest, with ties away from zero (mpfr_round) */
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
    g_randinit_default: (p1: gmp_randstate_t): void => { gmp.g_randinit_default(p1); },
    g_randinit_lc_2exp: (p1: gmp_randstate_t, p2: mpz_srcptr, p3: c_unsigned_long_int, p4: mp_bitcnt_t): void => { gmp.g_randinit_lc_2exp(p1, p2, p3, p4); },
    g_randinit_lc_2exp_size: (p1: gmp_randstate_t, p2: mp_bitcnt_t): c_int => { return gmp.g_randinit_lc_2exp_size(p1, p2); },
    g_randinit_mt: (p1: gmp_randstate_t): void => { gmp.g_randinit_mt(p1); },
    g_randinit_set: (p1: gmp_randstate_t, p2: __gmp_randstate_struct_ptr): void => { gmp.g_randinit_set(p1, p2); },
    g_randseed: (p1: gmp_randstate_t, p2: mpz_srcptr): void => { gmp.g_randseed(p1, p2); },
    g_randseed_ui: (p1: gmp_randstate_t, p2: c_unsigned_long_int): void => { gmp.g_randseed_ui(p1, p2); },
    g_randclear: (p1: gmp_randstate_t): void => { gmp.g_randclear(p1); },
    g_urandomb_ui: (p1: gmp_randstate_t, p2: c_unsigned_long_int): c_unsigned_long_int => { return gmp.g_urandomb_ui(p1, p2); },
    g_urandomm_ui: (p1: gmp_randstate_t, p2: c_unsigned_long_int): c_unsigned_long_int => { return gmp.g_urandomm_ui(p1, p2); },
    
    /**************** Formatted output routines.  ****************/
    
    /**************** Formatted input routines.  ****************/
    
    /**************** Integer (i.e. Z) routines.  ****************/
    mp_bits_per_limb: (): number => gmp.z_limb_size(),

    mpz_t: (): mpz_ptr => gmp.z_t(),
    mpz_t_free: (p1: mpz_ptr): void => { gmp.z_t_free(p1); },
    
    mpz_abs: (p1: mpz_ptr, p2: mpz_srcptr): void => { gmp.z_abs(p1, p2); },
    mpz_add: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_add(p1, p2, p3); },
    mpz_add_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): void => { gmp.z_add_ui(p1, p2, p3); },
    mpz_addmul: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_addmul(p1, p2, p3); },
    mpz_addmul_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): void => { gmp.z_addmul_ui(p1, p2, p3); },
    mpz_and: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_and(p1, p2, p3); },
    mpz_array_init: (p1: mpz_ptr, p2: mp_size_t, p3: mp_size_t): void => { gmp.z_array_init(p1, p2, p3); },
    mpz_bin_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): void => { gmp.z_bin_ui(p1, p2, p3); },
    mpz_bin_uiui: (p1: mpz_ptr, p2: c_unsigned_long_int, p3: c_unsigned_long_int): void => { gmp.z_bin_uiui(p1, p2, p3); },
    mpz_cdiv_q: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_cdiv_q(p1, p2, p3); },
    mpz_cdiv_q_2exp: (p1: mpz_ptr, p2: mpz_srcptr, p3: mp_bitcnt_t): void => { gmp.z_cdiv_q_2exp(p1, p2, p3); },
    mpz_cdiv_q_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): c_unsigned_long_int => gmp.z_cdiv_q_ui(p1, p2, p3),
    mpz_cdiv_qr: (p1: mpz_ptr, p2: mpz_ptr, p3: mpz_srcptr, p4: mpz_srcptr): void => { gmp.z_cdiv_qr(p1, p2, p3, p4); },
    mpz_cdiv_qr_ui: (p1: mpz_ptr, p2: mpz_ptr, p3: mpz_srcptr, p4: c_unsigned_long_int): c_unsigned_long_int => gmp.z_cdiv_qr_ui(p1, p2, p3, p4),
    mpz_cdiv_r: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_cdiv_r(p1, p2, p3); },
    mpz_cdiv_r_2exp: (p1: mpz_ptr, p2: mpz_srcptr, p3: mp_bitcnt_t): void => { gmp.z_cdiv_r_2exp(p1, p2, p3); },
    mpz_cdiv_r_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): c_unsigned_long_int => gmp.z_cdiv_r_ui(p1, p2, p3),
    mpz_cdiv_ui: (p1: mpz_srcptr, p2: c_unsigned_long_int): c_unsigned_long_int => gmp.z_cdiv_ui(p1, p2),
    mpz_clear: (p1: mpz_ptr): void => { gmp.z_clear(p1); },
    mpz_clrbit: (p1: mpz_ptr, p2: mp_bitcnt_t): void => { gmp.z_clrbit(p1, p2); },
    mpz_cmp: (p1: mpz_srcptr, p2: mpz_srcptr): c_int => gmp.z_cmp(p1, p2),
    mpz_cmp_d: (p1: mpz_srcptr, p2: c_double): c_int => gmp.z_cmp_d(p1, p2),
    mpz_cmp_si: (p1: mpz_srcptr, p2: c_signed_long_int): c_int => gmp.z_cmp_si(p1, p2),
    mpz_cmp_ui: (p1: mpz_srcptr, p2: c_unsigned_long_int): c_int => gmp.z_cmp_ui(p1, p2),
    mpz_cmpabs: (p1: mpz_srcptr, p2: mpz_srcptr): c_int => gmp.z_cmpabs(p1, p2),
    mpz_cmpabs_d: (p1: mpz_srcptr, p2: c_double): c_int => gmp.z_cmpabs_d(p1, p2),
    mpz_cmpabs_ui: (p1: mpz_srcptr, p2: c_unsigned_long_int): c_int => gmp.z_cmpabs_ui(p1, p2),
    mpz_com: (p1: mpz_ptr, p2: mpz_srcptr): void => { gmp.z_com(p1, p2); },
    mpz_combit: (p1: mpz_ptr, p2: mp_bitcnt_t): void => { gmp.z_combit(p1, p2); },
    mpz_congruent_p: (p1: mpz_srcptr, p2: mpz_srcptr, p3: mpz_srcptr): c_int => gmp.z_congruent_p(p1, p2, p3),
    mpz_congruent_2exp_p: (p1: mpz_srcptr, p2: mpz_srcptr, p3: mp_bitcnt_t): c_int => gmp.z_congruent_2exp_p(p1, p2, p3),
    mpz_congruent_ui_p: (p1: mpz_srcptr, p2: c_unsigned_long_int, p3: c_unsigned_long_int): c_int => gmp.z_congruent_ui_p(p1, p2, p3),
    mpz_divexact: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_divexact(p1, p2, p3); },
    mpz_divexact_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): void => { gmp.z_divexact_ui(p1, p2, p3); },
    mpz_divisible_p: (p1: mpz_srcptr, p2: mpz_srcptr): c_int => gmp.z_divisible_p(p1, p2),
    mpz_divisible_ui_p: (p1: mpz_srcptr, p2: c_unsigned_long_int): c_int => gmp.z_divisible_ui_p(p1, p2),
    mpz_divisible_2exp_p: (p1: mpz_srcptr, p2: mp_bitcnt_t): c_int => gmp.z_divisible_2exp_p(p1, p2),
    mpz_dump: (p1: mpz_srcptr): void => { gmp.z_dump(p1); },
    mpz_export: (p1: c_void_ptr, p2: c_size_t_ptr, p3: c_int, p4: c_size_t, p5: c_int, p6: c_size_t, p7: mpz_srcptr): c_void_ptr => gmp.z_export(p1, p2, p3, p4, p5, p6, p7),
    mpz_fac_ui: (p1: mpz_ptr, p2: c_unsigned_long_int): void => { gmp.z_fac_ui(p1, p2); },
    mpz_2fac_ui: (p1: mpz_ptr, p2: c_unsigned_long_int): void => { gmp.z_2fac_ui(p1, p2); },
    mpz_mfac_uiui: (p1: mpz_ptr, p2: c_unsigned_long_int, p3: c_unsigned_long_int): void => { gmp.z_mfac_uiui(p1, p2, p3); },
    mpz_primorial_ui: (p1: mpz_ptr, p2: c_unsigned_long_int): void => { gmp.z_primorial_ui(p1, p2); },
    mpz_fdiv_q: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_fdiv_q(p1, p2, p3); },
    mpz_fdiv_q_2exp: (p1: mpz_ptr, p2: mpz_srcptr, p3: mp_bitcnt_t): void => { gmp.z_fdiv_q_2exp(p1, p2, p3); },
    mpz_fdiv_q_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): c_unsigned_long_int => gmp.z_fdiv_q_ui(p1, p2, p3),
    mpz_fdiv_qr: (p1: mpz_ptr, p2: mpz_ptr, p3: mpz_srcptr, p4: mpz_srcptr): void => { gmp.z_fdiv_qr(p1, p2, p3, p4); },
    mpz_fdiv_qr_ui: (p1: mpz_ptr, p2: mpz_ptr, p3: mpz_srcptr, p4: c_unsigned_long_int): c_unsigned_long_int => gmp.z_fdiv_qr_ui(p1, p2, p3, p4),
    mpz_fdiv_r: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_fdiv_r(p1, p2, p3); },
    mpz_fdiv_r_2exp: (p1: mpz_ptr, p2: mpz_srcptr, p3: mp_bitcnt_t): void => { gmp.z_fdiv_r_2exp(p1, p2, p3); },
    mpz_fdiv_r_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): c_unsigned_long_int => gmp.z_fdiv_r_ui(p1, p2, p3),
    mpz_fdiv_ui: (p1: mpz_srcptr, p2: c_unsigned_long_int): c_unsigned_long_int => gmp.z_fdiv_ui(p1, p2),
    mpz_fib_ui: (p1: mpz_ptr, p2: c_unsigned_long_int): void => { gmp.z_fib_ui(p1, p2); },
    mpz_fib2_ui: (p1: mpz_ptr, p2: mpz_ptr, p3: c_unsigned_long_int): void => { gmp.z_fib2_ui(p1, p2, p3); },
    mpz_fits_sint_p: (p1: mpz_srcptr): c_int => gmp.z_fits_sint_p(p1),
    mpz_fits_slong_p: (p1: mpz_srcptr): c_int => gmp.z_fits_slong_p(p1),
    mpz_fits_sshort_p: (p1: mpz_srcptr): c_int => gmp.z_fits_sshort_p(p1),
    mpz_fits_uint_p: (p1: mpz_srcptr): c_int => gmp.z_fits_uint_p(p1),
    mpz_fits_ulong_p: (p1: mpz_srcptr): c_int => gmp.z_fits_ulong_p(p1),
    mpz_fits_ushort_p: (p1: mpz_srcptr): c_int => gmp.z_fits_ushort_p(p1),
    mpz_gcd: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_gcd(p1, p2, p3); },
    mpz_gcd_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): c_unsigned_long_int => gmp.z_gcd_ui(p1, p2, p3),
    mpz_gcdext: (p1: mpz_ptr, p2: mpz_ptr, p3: mpz_ptr, p4: mpz_srcptr, p5: mpz_srcptr): void => { gmp.z_gcdext(p1, p2, p3, p4, p5); },
    mpz_get_d: (p1: mpz_srcptr): c_double => gmp.z_get_d(p1),
    mpz_get_d_2exp: (p1: c_signed_long_int_ptr, p2: mpz_srcptr): c_double => gmp.z_get_d_2exp(p1, p2),
    mpz_get_si: (p1: mpz_srcptr): c_signed_long_int => gmp.z_get_si(p1),
    mpz_get_str: (p1: c_str_ptr, p2: c_int, p3: mpz_srcptr): c_str_ptr => gmp.z_get_str(p1, p2, p3),
    mpz_get_ui: (p1: mpz_srcptr): c_unsigned_long_int => gmp.z_get_ui(p1),
    mpz_getlimbn: (p1: mpz_srcptr, p2: mp_size_t): mp_limb_t => gmp.z_getlimbn(p1, p2),
    mpz_hamdist: (p1: mpz_srcptr, p2: mpz_srcptr): mp_bitcnt_t => gmp.z_hamdist(p1, p2),
    mpz_import: (p1: mpz_ptr, p2: c_size_t, p3: c_int, p4: c_size_t, p5: c_int, p6: c_size_t, p7: c_void_ptr): void => { gmp.z_import(p1, p2, p3, p4, p5, p6, p7); },
    mpz_init: (p1: mpz_ptr): void => { gmp.z_init(p1); },
    mpz_init2: (p1: mpz_ptr, p2: mp_bitcnt_t): void => { gmp.z_init2(p1, p2); },
    mpz_init_set: (p1: mpz_ptr, p2: mpz_srcptr): void => { gmp.z_init_set(p1, p2); },
    mpz_init_set_d: (p1: mpz_ptr, p2: c_double): void => { gmp.z_init_set_d(p1, p2); },
    mpz_init_set_si: (p1: mpz_ptr, p2: c_signed_long_int): void => { gmp.z_init_set_si(p1, p2); },
    mpz_init_set_str: (p1: mpz_ptr, p2: c_str_ptr, p3: c_int): c_int => gmp.z_init_set_str(p1, p2, p3),
    mpz_init_set_ui: (p1: mpz_ptr, p2: c_unsigned_long_int): void => { gmp.z_init_set_ui(p1, p2); },
    mpz_invert: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): c_int => gmp.z_invert(p1, p2, p3),
    mpz_ior: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_ior(p1, p2, p3); },
    mpz_jacobi: (p1: mpz_srcptr, p2: mpz_srcptr): c_int => gmp.z_jacobi(p1, p2),
    mpz_kronecker_si: (p1: mpz_srcptr, p2: c_signed_long_int): c_int => gmp.z_kronecker_si(p1, p2),
    mpz_kronecker_ui: (p1: mpz_srcptr, p2: c_unsigned_long_int): c_int => gmp.z_kronecker_ui(p1, p2),
    mpz_si_kronecker: (p1: c_signed_long_int, p2: mpz_srcptr): c_int => gmp.z_si_kronecker(p1, p2),
    mpz_ui_kronecker: (p1: c_unsigned_long_int, p2: mpz_srcptr): c_int => gmp.z_ui_kronecker(p1, p2),
    mpz_lcm: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_lcm(p1, p2, p3); },
    mpz_lcm_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): void => { gmp.z_lcm_ui(p1, p2, p3); },
    mpz_lucnum_ui: (p1: mpz_ptr, p2: c_unsigned_long_int): void => { gmp.z_lucnum_ui(p1, p2); },
    mpz_lucnum2_ui: (p1: mpz_ptr, p2: mpz_ptr, p3: c_unsigned_long_int): void => { gmp.z_lucnum2_ui(p1, p2, p3); },
    mpz_millerrabin: (p1: mpz_srcptr, p2: c_int): c_int => gmp.z_millerrabin(p1, p2),
    mpz_mod: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_mod(p1, p2, p3); },
    mpz_mul: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_mul(p1, p2, p3); },
    mpz_mul_2exp: (p1: mpz_ptr, p2: mpz_srcptr, p3: mp_bitcnt_t): void => { gmp.z_mul_2exp(p1, p2, p3); },
    mpz_mul_si: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_signed_long_int): void => { gmp.z_mul_si(p1, p2, p3); },
    mpz_mul_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): void => { gmp.z_mul_ui(p1, p2, p3); },
    mpz_neg: (p1: mpz_ptr, p2: mpz_srcptr): void => { gmp.z_neg(p1, p2); },
    mpz_nextprime: (p1: mpz_ptr, p2: mpz_srcptr): void => { gmp.z_nextprime(p1, p2); },
    mpz_perfect_power_p: (p1: mpz_srcptr): c_int => gmp.z_perfect_power_p(p1),
    mpz_perfect_square_p: (p1: mpz_srcptr): c_int => gmp.z_perfect_square_p(p1),
    mpz_popcount: (p1: mpz_srcptr): mp_bitcnt_t => gmp.z_popcount(p1),
    mpz_pow_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): void => { gmp.z_pow_ui(p1, p2, p3); },
    mpz_powm: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr, p4: mpz_srcptr): void => { gmp.z_powm(p1, p2, p3, p4); },
    mpz_powm_sec: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr, p4: mpz_srcptr): void => { gmp.z_powm_sec(p1, p2, p3, p4); },
    mpz_powm_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int, p4: mpz_srcptr): void => { gmp.z_powm_ui(p1, p2, p3, p4); },
    mpz_probab_prime_p: (p1: mpz_srcptr, p2: c_int): c_int => gmp.z_probab_prime_p(p1, p2),
    mpz_random: (p1: mpz_ptr, p2: mp_size_t): void => { gmp.z_random(p1, p2); },
    mpz_random2: (p1: mpz_ptr, p2: mp_size_t): void => { gmp.z_random2(p1, p2); },
    mpz_realloc2: (p1: mpz_ptr, p2: mp_bitcnt_t): void => { gmp.z_realloc2(p1, p2); },
    mpz_remove: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): mp_bitcnt_t => gmp.z_remove(p1, p2, p3),
    mpz_root: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): c_int => gmp.z_root(p1, p2, p3),
    mpz_rootrem: (p1: mpz_ptr, p2: mpz_ptr, p3: mpz_srcptr, p4: c_unsigned_long_int): void => { gmp.z_rootrem(p1, p2, p3, p4); },
    mpz_rrandomb: (p1: mpz_ptr, p2: gmp_randstate_t, p3: mp_bitcnt_t): void => { gmp.z_rrandomb(p1, p2, p3); },
    mpz_scan0: (p1: mpz_srcptr, p2: mp_bitcnt_t): mp_bitcnt_t => gmp.z_scan0(p1, p2),
    mpz_scan1: (p1: mpz_srcptr, p2: mp_bitcnt_t): mp_bitcnt_t => gmp.z_scan1(p1, p2),
    mpz_set: (p1: mpz_ptr, p2: mpz_srcptr): void => { gmp.z_set(p1, p2); },
    mpz_set_d: (p1: mpz_ptr, p2: c_double): void => { gmp.z_set_d(p1, p2); },
    mpz_set_q: (p1: mpz_ptr, p2: mpq_srcptr): void => { gmp.z_set_q(p1, p2); },
    mpz_set_si: (p1: mpz_ptr, p2: c_signed_long_int): void => { gmp.z_set_si(p1, p2); },
    mpz_set_str: (p1: mpz_ptr, p2: c_str_ptr, p3: c_int): c_int => gmp.z_set_str(p1, p2, p3),
    mpz_set_ui: (p1: mpz_ptr, p2: c_unsigned_long_int): void => { gmp.z_set_ui(p1, p2); },
    mpz_setbit: (p1: mpz_ptr, p2: mp_bitcnt_t): void => { gmp.z_setbit(p1, p2); },
    mpz_sgn: (p1: mpz_ptr): c_int => gmp.z_sgn(p1),
    mpz_size: (p1: mpz_srcptr): c_size_t => gmp.z_size(p1),
    mpz_sizeinbase: (p1: mpz_srcptr, p2: c_int): c_size_t => gmp.z_sizeinbase(p1, p2),
    mpz_sqrt: (p1: mpz_ptr, p2: mpz_srcptr): void => { gmp.z_sqrt(p1, p2); },
    mpz_sqrtrem: (p1: mpz_ptr, p2: mpz_ptr, p3: mpz_srcptr): void => { gmp.z_sqrtrem(p1, p2, p3); },
    mpz_sub: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_sub(p1, p2, p3); },
    mpz_sub_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): void => { gmp.z_sub_ui(p1, p2, p3); },
    mpz_ui_sub: (p1: mpz_ptr, p2: c_unsigned_long_int, p3: mpz_srcptr): void => { gmp.z_ui_sub(p1, p2, p3); },
    mpz_submul: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_submul(p1, p2, p3); },
    mpz_submul_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): void => { gmp.z_submul_ui(p1, p2, p3); },
    mpz_swap: (p1: mpz_ptr, p2: mpz_ptr): void => { gmp.z_swap(p1, p2); },
    mpz_tdiv_ui: (p1: mpz_srcptr, p2: c_unsigned_long_int): c_unsigned_long_int => gmp.z_tdiv_ui(p1, p2),
    mpz_tdiv_q: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_tdiv_q(p1, p2, p3); },
    mpz_tdiv_q_2exp: (p1: mpz_ptr, p2: mpz_srcptr, p3: mp_bitcnt_t): void => { gmp.z_tdiv_q_2exp(p1, p2, p3); },
    mpz_tdiv_q_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): c_unsigned_long_int => gmp.z_tdiv_q_ui(p1, p2, p3),
    mpz_tdiv_qr: (p1: mpz_ptr, p2: mpz_ptr, p3: mpz_srcptr, p4: mpz_srcptr): void => { gmp.z_tdiv_qr(p1, p2, p3, p4); },
    mpz_tdiv_qr_ui: (p1: mpz_ptr, p2: mpz_ptr, p3: mpz_srcptr, p4: c_unsigned_long_int): c_unsigned_long_int => {return gmp.z_tdiv_qr_ui(p1, p2, p3, p4); },
    mpz_tdiv_r: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_tdiv_r(p1, p2, p3); },
    mpz_tdiv_r_2exp: (p1: mpz_ptr, p2: mpz_srcptr, p3: mp_bitcnt_t): void => { gmp.z_tdiv_r_2exp(p1, p2, p3); },
    mpz_tdiv_r_ui: (p1: mpz_ptr, p2: mpz_srcptr, p3: c_unsigned_long_int): c_unsigned_long_int => gmp.z_tdiv_r_ui(p1, p2, p3),
    mpz_tstbit: (p1: mpz_srcptr, p2: mp_bitcnt_t): c_int => gmp.z_tstbit(p1, p2),
    mpz_ui_pow_ui: (p1: mpz_ptr, p2: c_unsigned_long_int, p3: c_unsigned_long_int): void => { gmp.z_ui_pow_ui(p1, p2, p3); },
    mpz_urandomb: (p1: mpz_ptr, p2: gmp_randstate_t, p3: mp_bitcnt_t): void => { gmp.z_urandomb(p1, p2, p3); },
    mpz_urandomm: (p1: mpz_ptr, p2: gmp_randstate_t, p3: mpz_srcptr): void => { gmp.z_urandomm(p1, p2, p3); },
    mpz_xor: (p1: mpz_ptr, p2: mpz_srcptr, p3: mpz_srcptr): void => { gmp.z_xor(p1, p2, p3); },
    mpz_limbs_read: (p1: mpz_srcptr): mp_srcptr => gmp.z_limbs_read(p1),
    mpz_limbs_write: (p1: mpz_ptr, p2: mp_size_t): mp_ptr => gmp.z_limbs_write(p1, p2),
    mpz_limbs_modify: (p1: mpz_ptr, p2: mp_size_t): mp_ptr => gmp.z_limbs_modify(p1, p2),
    mpz_limbs_finish: (p1: mpz_ptr, p2: mp_size_t): void => { gmp.z_limbs_finish(p1, p2); },
    mpz_roinit_n: (p1: mpz_ptr, p2: mp_srcptr, p3: mp_size_t): mpz_srcptr => gmp.z_roinit_n(p1, p2, p3),
    
    /**************** Rational (i.e. Q) routines.  ****************/
    /** Allocates memory for the mpq_t C struct and returns pointer */
    mpq_t: (): mpq_ptr => gmp.q_t(),
    /** Deallocates memory of a mpfr_t C struct */
    mpq_t_free: (mpq_ptr: mpq_ptr): void => { gmp.q_t_free(mpq_ptr); },
    
    /** Set rop to the absolute value of op. */
    mpq_abs: (rop: mpq_ptr, op: mpq_srcptr): void => { gmp.q_abs(rop, op); },
    /** Set sum to addend1 + addend2. */
    mpq_add: (sum: mpq_ptr, addend1: mpq_srcptr, addend2: mpq_srcptr): void => { gmp.q_add(sum, addend1, addend2); },
    /** Remove any factors that are common to the numerator and denominator of op, and make the denominator positive. */
    mpq_canonicalize: (op: mpq_ptr): void => { gmp.q_canonicalize(op); },
    /** Free the space occupied by x. */
    mpq_clear: (x: mpq_ptr): void => { gmp.q_clear(x); },
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
    /** Initialize x, set its precision to the default precision, and set its value to NaN. */
    mpfr_init: (x: mpfr_ptr): void => { gmp.r_init(x); },
    /** Free the space occupied by the significand of x. */
    mpfr_clear: (x: mpfr_ptr): void => { gmp.r_clear(x); },
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
