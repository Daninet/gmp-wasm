#include <gmp.h>
#include <mpfr.h>
#include <stdio.h>
#include <emscripten.h>
#include <math.h>
#include <stdlib.h>
#include <stdint.h>

#ifdef _MSC_VER
#define EMSCRIPTEN_KEEPALIVE;
#endif

EMSCRIPTEN_KEEPALIVE void* g_malloc (size_t bytes) { return malloc(bytes); }
EMSCRIPTEN_KEEPALIVE void g_free (void *ptr) { free(ptr); }

/**************** Random number routines.  ****************/
EMSCRIPTEN_KEEPALIVE void g_randinit_default (gmp_randstate_t p1) { gmp_randinit_default(p1); }
EMSCRIPTEN_KEEPALIVE void g_randinit_lc_2exp (gmp_randstate_t p1, mpz_srcptr p2, unsigned long int p3, mp_bitcnt_t p4) { gmp_randinit_lc_2exp(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int g_randinit_lc_2exp_size (gmp_randstate_t p1, mp_bitcnt_t p2) { return gmp_randinit_lc_2exp_size(p1, p2); }
EMSCRIPTEN_KEEPALIVE void g_randinit_mt (gmp_randstate_t p1) { gmp_randinit_mt(p1); }
EMSCRIPTEN_KEEPALIVE void g_randinit_set (gmp_randstate_t p1, const __gmp_randstate_struct * p2) { gmp_randinit_set(p1, p2); }
EMSCRIPTEN_KEEPALIVE void g_randseed (gmp_randstate_t p1, mpz_srcptr p2) { gmp_randseed(p1, p2); }
EMSCRIPTEN_KEEPALIVE void g_randseed_ui (gmp_randstate_t p1, unsigned long int p2) { gmp_randseed_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void g_randclear (gmp_randstate_t p1) { gmp_randclear(p1); }
EMSCRIPTEN_KEEPALIVE unsigned long g_urandomb_ui (gmp_randstate_t p1, unsigned long p2) { return gmp_urandomb_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE unsigned long g_urandomm_ui (gmp_randstate_t p1, unsigned long p2) { return gmp_urandomm_ui(p1, p2); }

/**************** Formatted output routines.  ****************/
/**************** Formatted input routines.  ****************/

/**************** Integer (i.e. Z) routines.  ****************/
EMSCRIPTEN_KEEPALIVE int z_limb_size () { return mp_bits_per_limb; };
EMSCRIPTEN_KEEPALIVE mpz_ptr z_t () { return (mpz_ptr)malloc(sizeof(mpz_t)); }
EMSCRIPTEN_KEEPALIVE void z_t_free (mpz_ptr p1) { free(p1); }

EMSCRIPTEN_KEEPALIVE void z_abs (mpz_ptr p1, mpz_srcptr p2) { mpz_abs(p1, p2); };
EMSCRIPTEN_KEEPALIVE void z_add (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_add(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_add_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { mpz_add_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_addmul (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_addmul(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_addmul_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { mpz_addmul_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_and (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_and(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_array_init (mpz_ptr p1, mp_size_t p2, mp_size_t p3) { mpz_array_init(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_bin_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { mpz_bin_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_bin_uiui (mpz_ptr p1, unsigned long int p2, unsigned long int p3) { mpz_bin_uiui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_cdiv_q (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_cdiv_q(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_cdiv_q_2exp (mpz_ptr p1, mpz_srcptr p2, mp_bitcnt_t p3) { mpz_cdiv_q_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_cdiv_q_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { return mpz_cdiv_q_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_cdiv_qr (mpz_ptr p1, mpz_ptr p2, mpz_srcptr p3, mpz_srcptr p4) { mpz_cdiv_qr(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_cdiv_qr_ui (mpz_ptr p1, mpz_ptr p2, mpz_srcptr p3, unsigned long int p4) { return mpz_cdiv_qr_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE void z_cdiv_r (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_cdiv_r(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_cdiv_r_2exp (mpz_ptr p1, mpz_srcptr p2, mp_bitcnt_t p3) { mpz_cdiv_r_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_cdiv_r_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { return mpz_cdiv_r_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_cdiv_ui (mpz_srcptr p1, unsigned long int p2) { return mpz_cdiv_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_clear (mpz_ptr p1) { mpz_clear(p1); }
// EMSCRIPTEN_KEEPALIVE void z_clears (mpz_ptr p1, ...) {}
EMSCRIPTEN_KEEPALIVE void z_clrbit (mpz_ptr p1, mp_bitcnt_t p2) { mpz_clrbit(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_cmp (mpz_srcptr p1, mpz_srcptr p2) { return mpz_cmp(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_cmp_d (mpz_srcptr p1, double p2) { return mpz_cmp_d(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_cmp_si (mpz_srcptr p1, signed long int p2) { return _mpz_cmp_si(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_cmp_ui (mpz_srcptr p1, unsigned long int p2) { return _mpz_cmp_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_cmpabs (mpz_srcptr p1, mpz_srcptr p2) { return mpz_cmpabs(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_cmpabs_d (mpz_srcptr p1, double p2) { return mpz_cmpabs_d(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_cmpabs_ui (mpz_srcptr p1, unsigned long int p2) { return mpz_cmpabs_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_com (mpz_ptr p1, mpz_srcptr p2) { mpz_com(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_combit (mpz_ptr p1, mp_bitcnt_t p2) { mpz_combit(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_congruent_p (mpz_srcptr p1, mpz_srcptr p2, mpz_srcptr p3) { return mpz_congruent_p(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int z_congruent_2exp_p (mpz_srcptr p1, mpz_srcptr p2, mp_bitcnt_t p3) { return mpz_congruent_2exp_p(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int z_congruent_ui_p (mpz_srcptr p1, unsigned long p2, unsigned long p3) { return mpz_congruent_ui_p(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_divexact (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_divexact(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_divexact_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long p3) { mpz_divexact_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int z_divisible_p (mpz_srcptr p1, mpz_srcptr p2) { return mpz_divisible_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_divisible_ui_p (mpz_srcptr p1, unsigned long p2) { return mpz_divisible_ui_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_divisible_2exp_p (mpz_srcptr p1, mp_bitcnt_t p2) { return mpz_divisible_2exp_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_dump (mpz_srcptr p1) { mpz_dump(p1); }
EMSCRIPTEN_KEEPALIVE void *z_export (void * p1, size_t * p2, int p3, size_t p4, int p5, size_t p6, mpz_srcptr p7) { return z_export(p1, p2, p3, p4, p5, p6, p7); }
EMSCRIPTEN_KEEPALIVE void z_fac_ui (mpz_ptr p1, unsigned long int p2) { mpz_fac_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_2fac_ui (mpz_ptr p1, unsigned long int p2) { mpz_2fac_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_mfac_uiui (mpz_ptr p1, unsigned long int p2, unsigned long int p3) { mpz_mfac_uiui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_primorial_ui (mpz_ptr p1, unsigned long int p2) { mpz_primorial_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_fdiv_q (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_fdiv_q(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_fdiv_q_2exp (mpz_ptr p1, mpz_srcptr p2, mp_bitcnt_t p3) { mpz_fdiv_q_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_fdiv_q_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { return mpz_fdiv_q_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_fdiv_qr (mpz_ptr p1, mpz_ptr p2, mpz_srcptr p3, mpz_srcptr p4) { mpz_fdiv_qr(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_fdiv_qr_ui (mpz_ptr p1, mpz_ptr p2, mpz_srcptr p3, unsigned long int p4) { return mpz_fdiv_qr_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE void z_fdiv_r (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_fdiv_r(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_fdiv_r_2exp (mpz_ptr p1, mpz_srcptr p2, mp_bitcnt_t p3) { mpz_fdiv_r_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_fdiv_r_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { return mpz_fdiv_r_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_fdiv_ui (mpz_srcptr p1, unsigned long int p2) { return mpz_fdiv_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_fib_ui (mpz_ptr p1, unsigned long int p2) { mpz_fib_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_fib2_ui (mpz_ptr p1, mpz_ptr p2, unsigned long int p3) { mpz_fib2_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int z_fits_sint_p (mpz_srcptr p1) { return mpz_fits_sint_p(p1); }
EMSCRIPTEN_KEEPALIVE int z_fits_slong_p (mpz_srcptr p1) { return mpz_fits_slong_p(p1); }
EMSCRIPTEN_KEEPALIVE int z_fits_sshort_p (mpz_srcptr p1) { return mpz_fits_sshort_p(p1); }
EMSCRIPTEN_KEEPALIVE int z_fits_uint_p (mpz_srcptr p1) { return mpz_fits_uint_p(p1); }
EMSCRIPTEN_KEEPALIVE int z_fits_ulong_p (mpz_srcptr p1) { return mpz_fits_ulong_p(p1); }
EMSCRIPTEN_KEEPALIVE int z_fits_ushort_p (mpz_srcptr p1) { return mpz_fits_ushort_p(p1); }
EMSCRIPTEN_KEEPALIVE void z_gcd (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_gcd(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_gcd_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { return mpz_gcd_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_gcdext (mpz_ptr p1, mpz_ptr p2, mpz_ptr p3, mpz_srcptr p4, mpz_srcptr p5) { mpz_gcdext(p1, p2, p3, p4, p5); }
EMSCRIPTEN_KEEPALIVE double z_get_d (mpz_srcptr p1) { return mpz_get_d(p1); }
EMSCRIPTEN_KEEPALIVE double z_get_d_2exp (signed long int * p1, mpz_srcptr p2) { return mpz_get_d_2exp(p1, p2); }
EMSCRIPTEN_KEEPALIVE /* signed */ long int z_get_si (mpz_srcptr p1) { return mpz_get_si(p1); }
EMSCRIPTEN_KEEPALIVE char *z_get_str (char * p1, int p2, mpz_srcptr p3) { return mpz_get_str(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_get_ui (mpz_srcptr p1) { return mpz_get_ui(p1); }
EMSCRIPTEN_KEEPALIVE mp_limb_t z_getlimbn (mpz_srcptr p1, mp_size_t p2) { return mpz_getlimbn(p1, p2); }
EMSCRIPTEN_KEEPALIVE mp_bitcnt_t z_hamdist (mpz_srcptr p1, mpz_srcptr p2) { return mpz_hamdist(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_import (mpz_ptr p1, size_t p2, int p3, size_t p4, int p5, size_t p6, const void * p7) { mpz_import(p1, p2, p3, p4, p5, p6, p7); }
EMSCRIPTEN_KEEPALIVE void z_init (mpz_ptr p1) { mpz_init(p1); }
EMSCRIPTEN_KEEPALIVE void z_init2 (mpz_ptr p1, mp_bitcnt_t p2) { mpz_init2(p1, p2); }
// EMSCRIPTEN_KEEPALIVE void z_inits (mpz_ptr p1, ...) {}
EMSCRIPTEN_KEEPALIVE void z_init_set (mpz_ptr p1, mpz_srcptr p2) { mpz_init_set(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_init_set_d (mpz_ptr p1, double p2) { mpz_init_set_d(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_init_set_si (mpz_ptr p1, signed long int p2) { mpz_init_set_si(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_init_set_str (mpz_ptr p1, const char * p2, int p3) { return mpz_init_set_str(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_init_set_ui (mpz_ptr p1, unsigned long int p2) { mpz_init_set_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_invert (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { return mpz_invert(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_ior (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_ior(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int z_jacobi (mpz_srcptr p1, mpz_srcptr p2) { return mpz_jacobi(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_kronecker_si (mpz_srcptr p1, long p2) { return mpz_kronecker_si(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_kronecker_ui (mpz_srcptr p1, unsigned long p2) { return mpz_kronecker_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_si_kronecker (long p1, mpz_srcptr p2) { return mpz_si_kronecker(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_ui_kronecker (unsigned long p1, mpz_srcptr p2) { return mpz_ui_kronecker(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_lcm (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_lcm(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_lcm_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long p3) { mpz_lcm_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_lucnum_ui (mpz_ptr p1, unsigned long int p2) { mpz_lucnum_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_lucnum2_ui (mpz_ptr p1, mpz_ptr p2, unsigned long int p3) { mpz_lucnum2_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int z_millerrabin (mpz_srcptr p1, int p2) { return mpz_millerrabin(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_mod (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_mod(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_mul (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_mul(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_mul_2exp (mpz_ptr p1, mpz_srcptr p2, mp_bitcnt_t p3) { mpz_mul_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_mul_si (mpz_ptr p1, mpz_srcptr p2, long int p3) { mpz_mul_si(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_mul_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { mpz_mul_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_neg (mpz_ptr p1, mpz_srcptr p2) { mpz_neg(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_nextprime (mpz_ptr p1, mpz_srcptr p2) { mpz_nextprime(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_perfect_power_p (mpz_srcptr p1) { return mpz_perfect_power_p(p1); }
EMSCRIPTEN_KEEPALIVE int z_perfect_square_p (mpz_srcptr p1) { return mpz_perfect_square_p(p1); }
EMSCRIPTEN_KEEPALIVE mp_bitcnt_t z_popcount (mpz_srcptr p1) { return mpz_popcount(p1); }
EMSCRIPTEN_KEEPALIVE void z_pow_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { mpz_pow_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_powm (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3, mpz_srcptr p4) { mpz_powm(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE void z_powm_sec (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3, mpz_srcptr p4) { mpz_powm_sec(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE void z_powm_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3, mpz_srcptr p4) { mpz_powm_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int z_probab_prime_p (mpz_srcptr p1, int p2) { return mpz_probab_prime_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_random (mpz_ptr p1, mp_size_t p2) { mpz_random(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_random2 (mpz_ptr p1, mp_size_t p2) { mpz_random2(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_realloc2 (mpz_ptr p1, mp_bitcnt_t p2) { mpz_realloc2(p1, p2); }
EMSCRIPTEN_KEEPALIVE mp_bitcnt_t z_remove (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { return mpz_remove(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int z_root (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { return mpz_root(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_rootrem (mpz_ptr p1, mpz_ptr p2, mpz_srcptr p3, unsigned long int p4) { mpz_rootrem(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE void z_rrandomb (mpz_ptr p1, gmp_randstate_t p2, mp_bitcnt_t p3) { mpz_rrandomb(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE mp_bitcnt_t z_scan0 (mpz_srcptr p1, mp_bitcnt_t p2) { return mpz_scan0(p1, p2); }
EMSCRIPTEN_KEEPALIVE mp_bitcnt_t z_scan1 (mpz_srcptr p1, mp_bitcnt_t p2) { return mpz_scan1(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_set (mpz_ptr p1, mpz_srcptr p2) { mpz_set(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_set_d (mpz_ptr p1, double p2) { mpz_set_d(p1, p2); }
// EMSCRIPTEN_KEEPALIVE void z_set_f (mpz_ptr p1, mpf_srcptr p2) { mpz_set_f(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_set_q (mpz_ptr p1, mpq_srcptr p2) { mpz_set_q(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_set_si (mpz_ptr p1, signed long int p2) { mpz_set_si(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_set_str (mpz_ptr p1, const char * p2, int p3) { return mpz_set_str(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_set_ui (mpz_ptr p1, unsigned long int p2) { mpz_set_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_setbit (mpz_ptr p1, mp_bitcnt_t p2) { mpz_setbit(p1, p2); }
EMSCRIPTEN_KEEPALIVE int z_sgn (mpz_ptr p1) { return mpz_sgn(p1); }
EMSCRIPTEN_KEEPALIVE size_t z_size (mpz_srcptr p1) { return mpz_size(p1); }
EMSCRIPTEN_KEEPALIVE size_t z_sizeinbase (mpz_srcptr p1, int p2) { return mpz_sizeinbase(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_sqrt (mpz_ptr p1, mpz_srcptr p2) { mpz_sqrt(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_sqrtrem (mpz_ptr p1, mpz_ptr p2, mpz_srcptr p3) { mpz_sqrtrem(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_sub (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_sub(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_sub_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { mpz_sub_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_ui_sub (mpz_ptr p1, unsigned long int p2, mpz_srcptr p3) { mpz_ui_sub(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_submul (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_submul(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_submul_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { mpz_submul_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_swap (mpz_ptr p1, mpz_ptr p2) { mpz_swap(p1, p2); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_tdiv_ui (mpz_srcptr p1, unsigned long int p2) { return mpz_tdiv_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_tdiv_q (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_tdiv_q(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_tdiv_q_2exp (mpz_ptr p1, mpz_srcptr p2, mp_bitcnt_t p3) { mpz_tdiv_q_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_tdiv_q_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { return mpz_tdiv_q_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_tdiv_qr (mpz_ptr p1, mpz_ptr p2, mpz_srcptr p3, mpz_srcptr p4) { mpz_tdiv_qr(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_tdiv_qr_ui (mpz_ptr p1, mpz_ptr p2, mpz_srcptr p3, unsigned long int p4) {return mpz_tdiv_qr_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE void z_tdiv_r (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_tdiv_r(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_tdiv_r_2exp (mpz_ptr p1, mpz_srcptr p2, mp_bitcnt_t p3) { mpz_tdiv_r_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE unsigned long int z_tdiv_r_ui (mpz_ptr p1, mpz_srcptr p2, unsigned long int p3) { return mpz_tdiv_r_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int z_tstbit (mpz_srcptr p1, mp_bitcnt_t p2) { return mpz_tstbit(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_ui_pow_ui (mpz_ptr p1, unsigned long int p2, unsigned long int p3) { mpz_ui_pow_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_urandomb (mpz_ptr p1, gmp_randstate_t p2, mp_bitcnt_t p3) { mpz_urandomb(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_urandomm (mpz_ptr p1, gmp_randstate_t p2, mpz_srcptr p3) { mpz_urandomm(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void z_xor (mpz_ptr p1, mpz_srcptr p2, mpz_srcptr p3) { mpz_xor(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE mp_srcptr z_limbs_read (mpz_srcptr p1) { return mpz_limbs_read(p1); }
EMSCRIPTEN_KEEPALIVE mp_ptr z_limbs_write (mpz_ptr p1, mp_size_t p2) { return mpz_limbs_write(p1, p2); }
EMSCRIPTEN_KEEPALIVE mp_ptr z_limbs_modify (mpz_ptr p1, mp_size_t p2) { return mpz_limbs_modify(p1, p2); }
EMSCRIPTEN_KEEPALIVE void z_limbs_finish (mpz_ptr p1, mp_size_t p2) { mpz_limbs_finish(p1, p2); }
EMSCRIPTEN_KEEPALIVE mpz_srcptr z_roinit_n (mpz_ptr p1, mp_srcptr p2, mp_size_t p3) { return mpz_roinit_n(p1, p2, p3); }

/**************** Rational (i.e. Q) routines.  ****************/
EMSCRIPTEN_KEEPALIVE mpq_ptr q_t () { return (mpq_ptr)malloc(sizeof(mpq_t)); }
EMSCRIPTEN_KEEPALIVE void q_t_free (mpq_ptr p1) { free(p1); }

EMSCRIPTEN_KEEPALIVE void q_abs (mpq_ptr p1, mpq_srcptr p2) { mpq_abs(p1, p2); }
EMSCRIPTEN_KEEPALIVE void q_add (mpq_ptr p1, mpq_srcptr p2, mpq_srcptr p3) { mpq_add(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void q_canonicalize (mpq_ptr p1) { mpq_canonicalize(p1); }
EMSCRIPTEN_KEEPALIVE void q_clear (mpq_ptr p1) { mpq_clear(p1); }
// EMSCRIPTEN_KEEPALIVE void q_clears (mpq_ptr p1, ...) { mpq_clears(); }
EMSCRIPTEN_KEEPALIVE int q_cmp (mpq_srcptr p1, mpq_srcptr p2) { return mpq_cmp(p1, p2); }
EMSCRIPTEN_KEEPALIVE int q_cmp_si (mpq_srcptr p1, long p2, unsigned long p3) { return mpq_cmp_si(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int q_cmp_ui (mpq_srcptr p1, unsigned long int p2, unsigned long int p3) { return mpq_cmp_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int q_cmp_z (mpq_srcptr p1, mpz_srcptr p2) { return mpq_cmp_z(p1, p2); }
EMSCRIPTEN_KEEPALIVE void q_div (mpq_ptr p1, mpq_srcptr p2, mpq_srcptr p3) { mpq_div(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void q_div_2exp (mpq_ptr p1, mpq_srcptr p2, mp_bitcnt_t p3) { mpq_div_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int q_equal (mpq_srcptr p1, mpq_srcptr p2) { return mpq_equal(p1, p2); }
EMSCRIPTEN_KEEPALIVE void q_get_num (mpz_ptr p1, mpq_srcptr p2) { mpq_get_num(p1, p2); }
EMSCRIPTEN_KEEPALIVE void q_get_den (mpz_ptr p1, mpq_srcptr p2) { mpq_get_den(p1, p2); }
EMSCRIPTEN_KEEPALIVE double q_get_d (mpq_srcptr p1) { return mpq_get_d(p1); }
EMSCRIPTEN_KEEPALIVE char *q_get_str (char *p1, int p2, mpq_srcptr p3) { return mpq_get_str(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void q_init (mpq_ptr p1) { mpq_init(p1); }
// EMSCRIPTEN_KEEPALIVE void q_inits (mpq_ptr p1, ...) { mpq_inits(); }
EMSCRIPTEN_KEEPALIVE void q_inv (mpq_ptr p1, mpq_srcptr p2) { mpq_inv(p1, p2); }
EMSCRIPTEN_KEEPALIVE void q_mul (mpq_ptr p1, mpq_srcptr p2, mpq_srcptr p3) { mpq_mul(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void q_mul_2exp (mpq_ptr p1, mpq_srcptr p2, mp_bitcnt_t p3) { mpq_mul_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void q_neg (mpq_ptr p1, mpq_srcptr p2) { mpq_neg(p1, p2); }
EMSCRIPTEN_KEEPALIVE void q_set (mpq_ptr p1, mpq_srcptr p2) { mpq_set(p1, p2); }
EMSCRIPTEN_KEEPALIVE void q_set_d (mpq_ptr p1, double p2) { mpq_set_d(p1, p2); }
EMSCRIPTEN_KEEPALIVE void q_set_den (mpq_ptr p1, mpz_srcptr p2) { mpq_set_den(p1, p2); }
// EMSCRIPTEN_KEEPALIVE void q_set_f (mpq_ptr p1, mpf_srcptr p2) { mpq_set_f(p1, p2); }
EMSCRIPTEN_KEEPALIVE void q_set_num (mpq_ptr p1, mpz_srcptr p2) { mpq_set_num(p1, p2); }
EMSCRIPTEN_KEEPALIVE void q_set_si (mpq_ptr p1, signed long int p2, unsigned long int p3) { mpq_set_si(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int q_set_str (mpq_ptr p1, const char * p2, int p3) { return mpq_set_str(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void q_set_ui (mpq_ptr p1, unsigned long int p2, unsigned long int p3) { mpq_set_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void q_set_z (mpq_ptr p1, mpz_srcptr p2) { mpq_set_z(p1, p2); }
EMSCRIPTEN_KEEPALIVE int q_sgn (mpq_ptr p1) { return mpq_sgn(p1); }
EMSCRIPTEN_KEEPALIVE void q_sub (mpq_ptr p1, mpq_srcptr p2, mpq_srcptr p3) { mpq_sub(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void q_swap (mpq_ptr p1, mpq_ptr p2) { mpq_swap(p1, p2); }


/**************** MPFR  ****************/

EMSCRIPTEN_KEEPALIVE mpfr_ptr r_t () { return (mpfr_ptr)malloc(sizeof(mpfr_t)); }
EMSCRIPTEN_KEEPALIVE void r_t_free (mpfr_ptr p1) { free(p1); }

EMSCRIPTEN_KEEPALIVE const char * r_get_version () { return mpfr_get_version(); }
EMSCRIPTEN_KEEPALIVE const char * r_get_patches () { return mpfr_get_patches(); }
EMSCRIPTEN_KEEPALIVE int r_buildopt_tls_p () { return mpfr_buildopt_tls_p(); }
EMSCRIPTEN_KEEPALIVE int r_buildopt_float128_p () { return mpfr_buildopt_float128_p(); }
EMSCRIPTEN_KEEPALIVE int r_buildopt_decimal_p () { return mpfr_buildopt_decimal_p(); }
EMSCRIPTEN_KEEPALIVE int r_buildopt_gmpinternals_p () { return mpfr_buildopt_gmpinternals_p(); }
EMSCRIPTEN_KEEPALIVE int r_buildopt_sharedcache_p () { return mpfr_buildopt_sharedcache_p(); }
EMSCRIPTEN_KEEPALIVE const char * r_buildopt_tune_case () { return mpfr_buildopt_tune_case(); }
EMSCRIPTEN_KEEPALIVE mpfr_exp_t r_get_emin () { return mpfr_get_emin(); }
EMSCRIPTEN_KEEPALIVE int r_set_emin (mpfr_exp_t p1) { return mpfr_set_emin(p1); }
EMSCRIPTEN_KEEPALIVE mpfr_exp_t r_get_emin_min () { return mpfr_get_emin_min(); }
EMSCRIPTEN_KEEPALIVE mpfr_exp_t r_get_emin_max () { return mpfr_get_emin_max(); }
EMSCRIPTEN_KEEPALIVE mpfr_exp_t r_get_emax () { return mpfr_get_emax(); }
EMSCRIPTEN_KEEPALIVE int r_set_emax (mpfr_exp_t p1)  { return mpfr_set_emax(p1); }
EMSCRIPTEN_KEEPALIVE mpfr_exp_t r_get_emax_min () { return mpfr_get_emax_min(); }
EMSCRIPTEN_KEEPALIVE mpfr_exp_t r_get_emax_max () { return mpfr_get_emax_max(); }
EMSCRIPTEN_KEEPALIVE void r_set_default_rounding_mode (mpfr_rnd_t p1) { mpfr_set_default_rounding_mode(p1); }
EMSCRIPTEN_KEEPALIVE mpfr_rnd_t r_get_default_rounding_mode () { return mpfr_get_default_rounding_mode(); }
EMSCRIPTEN_KEEPALIVE const char * r_print_rnd_mode (mpfr_rnd_t p1) { return mpfr_print_rnd_mode(p1); }
EMSCRIPTEN_KEEPALIVE void r_clear_flags () { mpfr_clear_flags(); }
EMSCRIPTEN_KEEPALIVE void r_clear_underflow () { mpfr_clear_underflow(); }
EMSCRIPTEN_KEEPALIVE void r_clear_overflow () { mpfr_clear_overflow(); }
EMSCRIPTEN_KEEPALIVE void r_clear_divby0 () { mpfr_clear_divby0(); }
EMSCRIPTEN_KEEPALIVE void r_clear_nanflag () { mpfr_clear_nanflag(); }
EMSCRIPTEN_KEEPALIVE void r_clear_inexflag () { mpfr_clear_inexflag(); }
EMSCRIPTEN_KEEPALIVE void r_clear_erangeflag () { mpfr_clear_erangeflag(); }
EMSCRIPTEN_KEEPALIVE void r_set_underflow () { mpfr_set_underflow(); }
EMSCRIPTEN_KEEPALIVE void r_set_overflow () { mpfr_set_overflow(); }
EMSCRIPTEN_KEEPALIVE void r_set_divby0 () { mpfr_set_divby0(); }
EMSCRIPTEN_KEEPALIVE void r_set_nanflag () { mpfr_set_nanflag(); }
EMSCRIPTEN_KEEPALIVE void r_set_inexflag () { mpfr_set_inexflag(); }
EMSCRIPTEN_KEEPALIVE void r_set_erangeflag () { mpfr_set_erangeflag(); }
EMSCRIPTEN_KEEPALIVE int r_underflow_p () { return mpfr_underflow_p(); }
EMSCRIPTEN_KEEPALIVE int r_overflow_p () { return mpfr_overflow_p(); }
EMSCRIPTEN_KEEPALIVE int r_divby0_p () { return mpfr_divby0_p(); }
EMSCRIPTEN_KEEPALIVE int r_nanflag_p () { return mpfr_nanflag_p(); }
EMSCRIPTEN_KEEPALIVE int r_inexflag_p () { return mpfr_inexflag_p(); }
EMSCRIPTEN_KEEPALIVE int r_erangeflag_p () { return mpfr_erangeflag_p(); }
EMSCRIPTEN_KEEPALIVE void r_flags_clear (mpfr_flags_t p1) { mpfr_flags_clear(p1); } 
EMSCRIPTEN_KEEPALIVE void r_flags_set (mpfr_flags_t p1) { mpfr_flags_set(p1); }
EMSCRIPTEN_KEEPALIVE mpfr_flags_t r_flags_test (mpfr_flags_t p1) { return mpfr_flags_test(p1); };
EMSCRIPTEN_KEEPALIVE mpfr_flags_t r_flags_save () { return mpfr_flags_save(); }
EMSCRIPTEN_KEEPALIVE void r_flags_restore (mpfr_flags_t p1, mpfr_flags_t p2) { mpfr_flags_restore(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_check_range (mpfr_ptr p1, int p2, mpfr_rnd_t p3) { return mpfr_check_range(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void r_init2 (mpfr_ptr p1, mpfr_prec_t p2) { mpfr_init2(p1, p2); }
EMSCRIPTEN_KEEPALIVE void r_init (mpfr_ptr p1) { mpfr_init(p1); }
EMSCRIPTEN_KEEPALIVE void r_clear (mpfr_ptr p1) { mpfr_clear(p1); }
// EMSCRIPTEN_KEEPALIVE void r_inits2 (mpfr_prec_t, mpfr_ptr, ...);
// EMSCRIPTEN_KEEPALIVE void r_inits (mpfr_ptr p1, ...) __MPFR_SENTINEL_ATTR;
// EMSCRIPTEN_KEEPALIVE void r_clears (mpfr_ptr p1, ...) __MPFR_SENTINEL_ATTR;
EMSCRIPTEN_KEEPALIVE int r_prec_round (mpfr_ptr p1, mpfr_prec_t p2, mpfr_rnd_t p3) { return mpfr_prec_round(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_can_round (mpfr_srcptr p1, mpfr_exp_t p2, mpfr_rnd_t p3, mpfr_rnd_t p4, mpfr_prec_t p5) { return mpfr_can_round(p1, p2, p3, p4, p5); }
EMSCRIPTEN_KEEPALIVE mpfr_prec_t r_min_prec (mpfr_srcptr p1) { return mpfr_min_prec(p1); }
EMSCRIPTEN_KEEPALIVE mpfr_exp_t r_get_exp (mpfr_srcptr p1) { return mpfr_get_exp(p1); }
EMSCRIPTEN_KEEPALIVE int r_set_exp (mpfr_ptr p1, mpfr_exp_t p2) { return mpfr_set_exp(p1, p2); }
EMSCRIPTEN_KEEPALIVE mpfr_prec_t r_get_prec (mpfr_srcptr p1) { return mpfr_get_prec(p1); }
EMSCRIPTEN_KEEPALIVE void r_set_prec (mpfr_ptr p1, mpfr_prec_t p2) { mpfr_set_prec(p1, p2); }
EMSCRIPTEN_KEEPALIVE void r_set_prec_raw (mpfr_ptr p1, mpfr_prec_t p2) { mpfr_set_prec_raw(p1, p2); }
EMSCRIPTEN_KEEPALIVE void r_set_default_prec (mpfr_prec_t p1) { mpfr_set_default_prec(p1); }
EMSCRIPTEN_KEEPALIVE mpfr_prec_t r_get_default_prec () { return mpfr_get_default_prec(); }
EMSCRIPTEN_KEEPALIVE int r_set_d (mpfr_ptr p1, double p2, mpfr_rnd_t p3) { return mpfr_set_d(p1, p2, p3); }
// EMSCRIPTEN_KEEPALIVE int r_set_flt (mpfr_ptr p1, float p2, mpfr_rnd_t p3) { return mpfr_set_flt(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_set_z (mpfr_ptr p1, mpz_srcptr p2, mpfr_rnd_t p3) { return mpfr_set_z(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_set_z_2exp (mpfr_ptr p1, mpz_srcptr p2, mpfr_exp_t p3, mpfr_rnd_t p4) { return mpfr_set_z_2exp(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE void r_set_nan (mpfr_ptr p1) { mpfr_set_nan(p1); }
EMSCRIPTEN_KEEPALIVE void r_set_inf (mpfr_ptr p1, int p2) { mpfr_set_inf(p1, p2); }
EMSCRIPTEN_KEEPALIVE void r_set_zero (mpfr_ptr p1, int p2) { mpfr_set_zero(p1, p2); }
// EMSCRIPTEN_KEEPALIVE int r_set_f (mpfr_ptr p1, mpf_srcptr, mpfr_rnd_t);
// EMSCRIPTEN_KEEPALIVE int r_cmp_f (mpfr_srcptr p1, mpf_srcptr);
// EMSCRIPTEN_KEEPALIVE int r_get_f (mpf_ptr, mpfr_srcptr, mpfr_rnd_t);
EMSCRIPTEN_KEEPALIVE int r_set_si (mpfr_ptr p1, long p2, mpfr_rnd_t p3) { return mpfr_set_si(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_set_ui (mpfr_ptr p1, unsigned long p2, mpfr_rnd_t p3) { return mpfr_set_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_set_si_2exp (mpfr_ptr p1, long p2, mpfr_exp_t p3, mpfr_rnd_t p4) { return mpfr_set_si_2exp(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_set_ui_2exp (mpfr_ptr p1, unsigned long p2, mpfr_exp_t p3, mpfr_rnd_t p4) { return mpfr_set_ui_2exp(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_set_q (mpfr_ptr p1, mpq_srcptr p2, mpfr_rnd_t p3) { return mpfr_set_q(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_mul_q (mpfr_ptr p1, mpfr_srcptr p2, mpq_srcptr p3, mpfr_rnd_t p4) { return mpfr_mul_q(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_div_q (mpfr_ptr p1, mpfr_srcptr p2, mpq_srcptr p3, mpfr_rnd_t p4) { return mpfr_div_q(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_add_q (mpfr_ptr p1, mpfr_srcptr p2, mpq_srcptr p3, mpfr_rnd_t p4) { return mpfr_add_q(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_sub_q (mpfr_ptr p1, mpfr_srcptr p2, mpq_srcptr p3, mpfr_rnd_t p4) { return mpfr_sub_q(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_cmp_q (mpfr_srcptr p1, mpq_srcptr p2) { return mpfr_cmp_q(p1, p2); }
EMSCRIPTEN_KEEPALIVE void r_get_q (mpq_ptr p1, mpfr_srcptr p2) { return mpfr_get_q(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_set_str (mpfr_ptr p1, const char *p2, int p3, mpfr_rnd_t p4) { return mpfr_set_str(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_init_set_str (mpfr_ptr p1, const char *p2, int p3, mpfr_rnd_t p4) { return mpfr_init_set_str(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_set4 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3, int p4) { return mpfr_set4(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_abs (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_abs(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_set (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_set(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_neg (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_neg(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_signbit (mpfr_srcptr p1) { return mpfr_signbit(p1); }
EMSCRIPTEN_KEEPALIVE int r_setsign (mpfr_ptr p1, mpfr_srcptr p2, int p3, mpfr_rnd_t p4) { return mpfr_setsign(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_copysign (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_copysign(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE mpfr_exp_t r_get_z_2exp (mpz_ptr p1, mpfr_srcptr p2) { return mpfr_get_z_2exp(p1, p2); }
// EMSCRIPTEN_KEEPALIVE float r_get_flt (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_get_flt(p1, p2); }
EMSCRIPTEN_KEEPALIVE double r_get_d (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_get_d(p1, p2); }
// EMSCRIPTEN_KEEPALIVE long double r_get_ld (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_get_ld(p1, p2); }
EMSCRIPTEN_KEEPALIVE double r_get_d1 (mpfr_srcptr p1) { return mpfr_get_d1(p1); }
EMSCRIPTEN_KEEPALIVE double r_get_d_2exp (long* p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_get_d_2exp(p1, p2, p3); }
// EMSCRIPTEN_KEEPALIVE long double r_get_ld_2exp (long* p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_get_ld_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_frexp (mpfr_exp_t* p1, mpfr_ptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_frexp(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE long r_get_si (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_get_si(p1, p2); }
EMSCRIPTEN_KEEPALIVE unsigned long r_get_ui (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_get_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE size_t r_get_str_ndigits (int p1, mpfr_prec_t p2) { return mpfr_get_str_ndigits(p1, p2); }
EMSCRIPTEN_KEEPALIVE char * r_get_str (char* p1, mpfr_exp_t* p2, int p3, size_t p4, mpfr_srcptr p5, mpfr_rnd_t p6) { return mpfr_get_str(p1, p2, p3, p4, p5, p6); }
EMSCRIPTEN_KEEPALIVE int r_get_z (mpz_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_get_z(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void r_free_str (char * p1) { mpfr_free_str(p1); }
EMSCRIPTEN_KEEPALIVE int r_urandom (mpfr_ptr p1, gmp_randstate_t p2, mpfr_rnd_t p3) { return mpfr_urandom(p1, p2, p3); }
// EMSCRIPTEN_KEEPALIVE int r_grandom (mpfr_ptr p1, mpfr_ptr p2, gmp_randstate_t p3, mpfr_rnd_t p4) { return mpfr_grandom(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_nrandom (mpfr_ptr p1, gmp_randstate_t p2, mpfr_rnd_t p3) { return mpfr_nrandom(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_erandom (mpfr_ptr p1, gmp_randstate_t p2, mpfr_rnd_t p3) { return mpfr_erandom(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_urandomb (mpfr_ptr p1, gmp_randstate_t p2) { return mpfr_urandomb(p1, p2); }

EMSCRIPTEN_KEEPALIVE void r_nextabove (mpfr_ptr p1) { mpfr_nextabove(p1); }
EMSCRIPTEN_KEEPALIVE void r_nextbelow (mpfr_ptr p1) { mpfr_nextbelow(p1); }
EMSCRIPTEN_KEEPALIVE void r_nexttoward (mpfr_ptr p1, mpfr_srcptr p2) { mpfr_nexttoward(p1, p2); }
// EMSCRIPTEN_KEEPALIVE int r_printf (const char*, ...);
// EMSCRIPTEN_KEEPALIVE int r_asprintf (char**, const char*, ...);
// EMSCRIPTEN_KEEPALIVE int r_sprintf (char*, const char*, ...);
// EMSCRIPTEN_KEEPALIVE int r_snprintf (char*, size_t, const char*, ...);
// EMSCRIPTEN_KEEPALIVE char* r_asprintf_simple (mpfr_ptr p1, mpfr_rnd_t p2) {
//   char *x;
//   long precisionBits = mpfr_get_prec(p1);
//   long precisionDigits = ceil((double)precisionBits / 3.3219281);
//   mpfr_asprintf(&x, "%.*R*f", precisionDigits, p2, p1);
//   return x;
// }

EMSCRIPTEN_KEEPALIVE int r_pow (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_pow(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_pow_si (mpfr_ptr p1, mpfr_srcptr p2, long p3, mpfr_rnd_t p4) { return mpfr_pow_si(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_pow_ui (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_pow_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_ui_pow_ui (mpfr_ptr p1, unsigned long p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_ui_pow_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_ui_pow (mpfr_ptr p1, unsigned long p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_ui_pow(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_pow_z (mpfr_ptr p1, mpfr_srcptr p2, mpz_srcptr p3, mpfr_rnd_t p4) { return mpfr_pow_z(p1, p2, p3, p4); }

EMSCRIPTEN_KEEPALIVE int r_sqrt (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_sqrt(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_sqrt_ui (mpfr_ptr p1, unsigned long p2, mpfr_rnd_t p3) { return mpfr_sqrt_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_rec_sqrt (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_rec_sqrt(p1, p2, p3); }

EMSCRIPTEN_KEEPALIVE int r_add (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_add(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_sub (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_sub(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_mul (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_mul(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_div (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_div(p1, p2, p3, p4); }

EMSCRIPTEN_KEEPALIVE int r_add_ui (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_add_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_sub_ui (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_sub_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_ui_sub (mpfr_ptr p1, unsigned long p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_ui_sub(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_mul_ui (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_mul_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_div_ui (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_div_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_ui_div (mpfr_ptr p1, unsigned long p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_ui_div(p1, p2, p3, p4); }

EMSCRIPTEN_KEEPALIVE int r_add_si (mpfr_ptr p1, mpfr_srcptr p2, long p3, mpfr_rnd_t p4) { return mpfr_add_si(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_sub_si (mpfr_ptr p1, mpfr_srcptr p2, long p3, mpfr_rnd_t p4) { return mpfr_sub_si(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_si_sub (mpfr_ptr p1, long p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_si_sub(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_mul_si (mpfr_ptr p1, mpfr_srcptr p2, long p3, mpfr_rnd_t p4) { return mpfr_mul_si(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_div_si (mpfr_ptr p1, mpfr_srcptr p2, long p3, mpfr_rnd_t p4) { return mpfr_div_si(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_si_div (mpfr_ptr p1, long p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_si_div(p1, p2, p3, p4); }

EMSCRIPTEN_KEEPALIVE int r_add_d (mpfr_ptr p1, mpfr_srcptr p2, double p3, mpfr_rnd_t p4) { return mpfr_add_d(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_sub_d (mpfr_ptr p1, mpfr_srcptr p2, double p3, mpfr_rnd_t p4) { return mpfr_sub_d(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_d_sub (mpfr_ptr p1, double p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_d_sub(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_mul_d (mpfr_ptr p1, mpfr_srcptr p2, double p3, mpfr_rnd_t p4) { return mpfr_mul_d(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_div_d (mpfr_ptr p1, mpfr_srcptr p2, double p3, mpfr_rnd_t p4) { return mpfr_div_d(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_d_div (mpfr_ptr p1, double p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_d_div(p1, p2, p3, p4); }

EMSCRIPTEN_KEEPALIVE int r_sqr (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_sqr(p1, p2, p3); }

EMSCRIPTEN_KEEPALIVE int r_const_pi (mpfr_ptr p1, mpfr_rnd_t p2) { return mpfr_const_pi(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_const_log2 (mpfr_ptr p1, mpfr_rnd_t p2) { return mpfr_const_log2(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_const_euler (mpfr_ptr p1, mpfr_rnd_t p2) { return mpfr_const_euler(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_const_catalan (mpfr_ptr p1, mpfr_rnd_t p2) { return mpfr_const_catalan(p1, p2); }

EMSCRIPTEN_KEEPALIVE int r_agm (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_agm(p1, p2, p3, p4); }

EMSCRIPTEN_KEEPALIVE int r_log (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_log(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_log2 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_log2(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_log10 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_log10(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_log1p (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_log1p(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_log_ui (mpfr_ptr p1, unsigned long p2, mpfr_rnd_t p3) { return mpfr_log_ui(p1, p2, p3); }

EMSCRIPTEN_KEEPALIVE int r_exp (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_exp2 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_exp2(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_exp10 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_exp10(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_expm1 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_expm1(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_eint (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_eint(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_li2 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_li2(p1, p2, p3); }

EMSCRIPTEN_KEEPALIVE int r_cmp  (mpfr_srcptr p1, mpfr_srcptr p2) { return mpfr_cmp(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_cmp3 (mpfr_srcptr p1, mpfr_srcptr p2, int p3) { return mpfr_cmp3(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_cmp_d (mpfr_srcptr p1, double p2) { return mpfr_cmp_d(p1, p2); }
// EMSCRIPTEN_KEEPALIVE int r_cmp_ld (mpfr_srcptr p1, long double p2) { return mpfr_cmp_ld(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_cmp_ui (mpfr_srcptr p1, unsigned long p2) { return mpfr_cmp_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_cmp_si (mpfr_srcptr p1, long p2) { return mpfr_cmp_si(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_cmp_ui_2exp (mpfr_srcptr p1, unsigned long p2, mpfr_exp_t p3) { return mpfr_cmp_ui_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_cmp_si_2exp (mpfr_srcptr p1, long p2, mpfr_exp_t p3) { return mpfr_cmp_si_2exp(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_cmpabs (mpfr_srcptr p1, mpfr_srcptr p2) { return mpfr_cmpabs(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_cmpabs_ui (mpfr_srcptr p1, unsigned long p2) { return mpfr_cmpabs_ui(p1, p2); }
EMSCRIPTEN_KEEPALIVE void r_reldiff (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { mpfr_reldiff(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_eq (mpfr_srcptr p1, mpfr_srcptr p2, unsigned long p3) { return mpfr_eq(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_sgn (mpfr_srcptr p1) { return mpfr_sgn(p1); }

EMSCRIPTEN_KEEPALIVE int r_mul_2exp (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_mul_2exp(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_div_2exp (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_div_2exp(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_mul_2ui (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_mul_2ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_div_2ui (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_div_2ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_mul_2si (mpfr_ptr p1, mpfr_srcptr p2, long p3, mpfr_rnd_t p4) { return mpfr_mul_2si(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_div_2si (mpfr_ptr p1, mpfr_srcptr p2, long p3, mpfr_rnd_t p4) { return mpfr_div_2si(p1, p2, p3, p4); }

EMSCRIPTEN_KEEPALIVE int r_rint (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_rint(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_roundeven (mpfr_ptr p1, mpfr_srcptr p2) { return mpfr_roundeven(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_round (mpfr_ptr p1, mpfr_srcptr p2) { return mpfr_round(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_trunc (mpfr_ptr p1, mpfr_srcptr p2) { return mpfr_trunc(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_ceil (mpfr_ptr p1, mpfr_srcptr p2) { return mpfr_ceil(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_floor (mpfr_ptr p1, mpfr_srcptr p2) { return mpfr_floor(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_rint_roundeven (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_rint_roundeven(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_rint_round (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_rint_round(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_rint_trunc (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_rint_trunc(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_rint_ceil (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_rint_ceil(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_rint_floor (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_rint_floor(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_frac (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_frac(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_modf (mpfr_ptr p1, mpfr_ptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_modf(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_remquo (mpfr_ptr p1, long* p2, mpfr_srcptr p3, mpfr_srcptr p4, mpfr_rnd_t p5) { return mpfr_remquo(p1, p2, p3, p4, p5); }
EMSCRIPTEN_KEEPALIVE int r_remainder (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_remainder(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_fmod (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_fmod(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_fmodquo (mpfr_ptr p1, long* p2, mpfr_srcptr p3, mpfr_srcptr p4, mpfr_rnd_t p5) { return mpfr_fmodquo(p1, p2, p3, p4, p5); }

EMSCRIPTEN_KEEPALIVE int r_fits_ulong_p (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_fits_ulong_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_fits_slong_p (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_fits_slong_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_fits_uint_p (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_fits_uint_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_fits_sint_p (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_fits_sint_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_fits_ushort_p (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_fits_ushort_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_fits_sshort_p (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_fits_sshort_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_fits_uintmax_p (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_fits_uintmax_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_fits_intmax_p (mpfr_srcptr p1, mpfr_rnd_t p2) { return mpfr_fits_intmax_p(p1, p2); }

EMSCRIPTEN_KEEPALIVE void r_extract (mpz_ptr p1, mpfr_srcptr p2, unsigned int p3) { mpfr_extract(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE void r_swap (mpfr_ptr p1, mpfr_ptr p2) { mpfr_swap(p1, p2); }
EMSCRIPTEN_KEEPALIVE void r_dump (mpfr_srcptr p1) { mpfr_dump(p1); }

EMSCRIPTEN_KEEPALIVE int r_nan_p (mpfr_srcptr p1) { return mpfr_nan_p(p1); }
EMSCRIPTEN_KEEPALIVE int r_inf_p (mpfr_srcptr p1) { return mpfr_inf_p(p1); }
EMSCRIPTEN_KEEPALIVE int r_number_p (mpfr_srcptr p1) { return mpfr_number_p(p1); }
EMSCRIPTEN_KEEPALIVE int r_integer_p (mpfr_srcptr p1) { return mpfr_integer_p(p1); }
EMSCRIPTEN_KEEPALIVE int r_zero_p (mpfr_srcptr p1) { return mpfr_zero_p(p1); }
EMSCRIPTEN_KEEPALIVE int r_regular_p (mpfr_srcptr p1) { return mpfr_regular_p(p1); }

EMSCRIPTEN_KEEPALIVE int r_greater_p (mpfr_srcptr p1, mpfr_srcptr p2) { return mpfr_greater_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_greaterequal_p (mpfr_srcptr p1, mpfr_srcptr p2) { return mpfr_greaterequal_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_less_p (mpfr_srcptr p1, mpfr_srcptr p2) { return mpfr_less_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_lessequal_p (mpfr_srcptr p1, mpfr_srcptr p2) { return mpfr_lessequal_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_lessgreater_p (mpfr_srcptr p1, mpfr_srcptr p2) { return mpfr_lessgreater_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_equal_p (mpfr_srcptr p1, mpfr_srcptr p2) { return mpfr_equal_p(p1, p2); }
EMSCRIPTEN_KEEPALIVE int r_unordered_p (mpfr_srcptr p1, mpfr_srcptr p2) { return mpfr_unordered_p(p1, p2); }

EMSCRIPTEN_KEEPALIVE int r_atanh (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_atanh(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_acosh (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_acosh(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_asinh (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_asinh(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_cosh (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_cosh(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_sinh (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_sinh(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_tanh (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_tanh(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_sinh_cosh (mpfr_ptr p1, mpfr_ptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_sinh_cosh(p1, p2, p3, p4); }

EMSCRIPTEN_KEEPALIVE int r_sech (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_sech(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_csch (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_csch(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_coth (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_coth(p1, p2, p3); }

EMSCRIPTEN_KEEPALIVE int r_acos (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_acos(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_asin (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_asin(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_atan (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_atan(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_sin (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_sin(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_sin_cos (mpfr_ptr p1, mpfr_ptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_sin_cos(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_cos (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_cos(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_tan (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_tan(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_atan2 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_atan2(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_sec (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_sec(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_csc (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_csc(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_cot (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_cot(p1, p2, p3); }

EMSCRIPTEN_KEEPALIVE int r_hypot (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_hypot(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_erf (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_erf(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_erfc (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_erfc(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_cbrt (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_cbrt(p1, p2, p3); }
// EMSCRIPTEN_KEEPALIVE int r_root (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_root(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_rootn_ui (mpfr_ptr p1, mpfr_srcptr p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_rootn_ui(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_gamma (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_gamma(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_gamma_inc (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_gamma_inc(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_beta (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_beta(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_lngamma (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_lngamma(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_lgamma (mpfr_ptr p1, int * p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_lgamma(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_digamma (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_digamma(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_zeta (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_zeta(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_zeta_ui (mpfr_ptr p1, unsigned long p2, mpfr_rnd_t p3) { return mpfr_zeta_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_fac_ui (mpfr_ptr p1, unsigned long p2, mpfr_rnd_t p3) { return mpfr_fac_ui(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_j0 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_j0(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_j1 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_j1(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_jn (mpfr_ptr p1, long p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_jn(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_y0 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_y0(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_y1 (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_y1(p1, p2, p3); }
EMSCRIPTEN_KEEPALIVE int r_yn (mpfr_ptr p1, long p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_yn(p1, p2, p3, p4); }

EMSCRIPTEN_KEEPALIVE int r_ai (mpfr_ptr p1, mpfr_srcptr p2, mpfr_rnd_t p3) { return mpfr_ai(p1, p2, p3); }

EMSCRIPTEN_KEEPALIVE int r_min (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_min(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_max (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_max(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_dim (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_dim(p1, p2, p3, p4); }

EMSCRIPTEN_KEEPALIVE int r_mul_z (mpfr_ptr p1, mpfr_srcptr p2, mpz_srcptr p3, mpfr_rnd_t p4) { return mpfr_mul_z(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_div_z (mpfr_ptr p1, mpfr_srcptr p2, mpz_srcptr p3, mpfr_rnd_t p4) { return mpfr_div_z(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_add_z (mpfr_ptr p1, mpfr_srcptr p2, mpz_srcptr p3, mpfr_rnd_t p4) { return mpfr_add_z(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_sub_z (mpfr_ptr p1, mpfr_srcptr p2, mpz_srcptr p3, mpfr_rnd_t p4) { return mpfr_sub_z(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_z_sub (mpfr_ptr p1, mpz_srcptr p2, mpfr_srcptr p3, mpfr_rnd_t p4) { return mpfr_z_sub(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_cmp_z (mpfr_srcptr p1, mpz_srcptr p2) { return mpfr_cmp_z(p1, p2); }

EMSCRIPTEN_KEEPALIVE int r_fma (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_srcptr p4,  mpfr_rnd_t p5) { return mpfr_fma(p1, p2, p3, p4, p5); }
EMSCRIPTEN_KEEPALIVE int r_fms (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_srcptr p4, mpfr_rnd_t p5) { return mpfr_fms(p1, p2, p3, p4, p5); }
EMSCRIPTEN_KEEPALIVE int r_fmma (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_srcptr p4, mpfr_srcptr p5, mpfr_rnd_t p6) { return mpfr_fmma(p1, p2, p3, p4, p5, p6); }
EMSCRIPTEN_KEEPALIVE int r_fmms (mpfr_ptr p1, mpfr_srcptr p2, mpfr_srcptr p3, mpfr_srcptr p4, mpfr_srcptr p5, mpfr_rnd_t p6) { return mpfr_fmms(p1, p2, p3, p4, p5, p6); }
EMSCRIPTEN_KEEPALIVE int r_sum (mpfr_ptr p1, const mpfr_ptr *p2, unsigned long p3, mpfr_rnd_t p4) { return mpfr_sum(p1, p2, p3, p4); }
EMSCRIPTEN_KEEPALIVE int r_dot (mpfr_ptr p1, const mpfr_ptr *p2, const mpfr_ptr *p3, unsigned long p4, mpfr_rnd_t p5) { return mpfr_dot(p1, p2, p3, p4, p5); }

EMSCRIPTEN_KEEPALIVE void r_free_cache () { mpfr_free_cache(); }
EMSCRIPTEN_KEEPALIVE void r_free_cache2 (mpfr_free_cache_t p1) { mpfr_free_cache2(p1); }
EMSCRIPTEN_KEEPALIVE void r_free_pool () { mpfr_free_pool(); }
EMSCRIPTEN_KEEPALIVE int r_mp_memory_cleanup () { return mpfr_mp_memory_cleanup(); }

EMSCRIPTEN_KEEPALIVE int r_subnormalize (mpfr_ptr p1, int p2, mpfr_rnd_t p3) { return mpfr_subnormalize(p1, p2, p3); }

EMSCRIPTEN_KEEPALIVE int r_strtofr (mpfr_ptr p1, const char * p2, char ** p3, int p4, mpfr_rnd_t p5) { return mpfr_strtofr(p1, p2, p3, p4, p5); }

EMSCRIPTEN_KEEPALIVE void r_round_nearest_away_begin (mpfr_t p1) { mpfr_round_nearest_away_begin(p1); }
EMSCRIPTEN_KEEPALIVE int r_round_nearest_away_end (mpfr_t p1, int p2) { return mpfr_round_nearest_away_end(p1, p2); }

EMSCRIPTEN_KEEPALIVE size_t r_custom_get_size (mpfr_prec_t p1) { return mpfr_custom_get_size(p1); }
EMSCRIPTEN_KEEPALIVE void r_custom_init (void * p1, mpfr_prec_t p2) { mpfr_custom_init(p1, p2); }
EMSCRIPTEN_KEEPALIVE void * r_custom_get_significand (mpfr_srcptr p1) { return mpfr_custom_get_significand(p1); }
EMSCRIPTEN_KEEPALIVE mpfr_exp_t r_custom_get_exp (mpfr_srcptr p1) { return mpfr_custom_get_exp(p1); }
EMSCRIPTEN_KEEPALIVE void r_custom_move (mpfr_ptr p1, void *p2) { mpfr_custom_move(p1, p2); }
EMSCRIPTEN_KEEPALIVE void r_custom_init_set (mpfr_ptr p1, int p2, mpfr_exp_t p3, mpfr_prec_t p4, void *p5) { mpfr_custom_init_set(p1, p2, p3, p4, p5); }
EMSCRIPTEN_KEEPALIVE int r_custom_get_kind (mpfr_srcptr p1) { return mpfr_custom_get_kind(p1); }

EMSCRIPTEN_KEEPALIVE int r_total_order_p (mpfr_srcptr p1, mpfr_srcptr p2) { return mpfr_total_order_p(p1, p2); }
