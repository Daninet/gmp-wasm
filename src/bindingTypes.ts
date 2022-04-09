export type mpz_ptr = number & { __number_type?: undefined };
export type mpz_srcptr = number & { __number_type?: undefined };

export type mpfr_ptr = number & { __number_type?: undefined };
export type mpfr_srcptr = number & { __number_type?: undefined };

export type mpq_ptr = number & { __number_type?: undefined };
export type mpq_srcptr = number & { __number_type?: undefined };

export type mp_bitcnt_t = number & { __number_type?: undefined };

export type gmp_randstate_t = number & { __number_type?: undefined };
export type __gmp_randstate_struct_ptr = number & { __number_type?: undefined };
export type c_unsigned_long_int = number & { __number_type?: undefined };
export type c_void_ptr = number & { __number_type?: undefined };
export type c_str_ptr = number & { __number_type?: undefined };
export type c_int = number & { __number_type?: undefined };
export type c_int_ptr = number & { __number_type?: undefined };
export type c_long_ptr = number & { __number_type?: undefined };
export type c_double = number & { __number_type?: undefined };
export type c_signed_long_int = number & { __number_type?: undefined };
export type c_signed_long_int_ptr = number & { __number_type?: undefined };
export type c_size_t = number & { __number_type?: undefined };
export type c_size_t_ptr = number & { __number_type?: undefined };
export type mp_limb_t = number & { __number_type?: undefined };
export type mp_srcptr = number & { __number_type?: undefined };
export type mp_size_t = number & { __number_type?: undefined };
export type mpfr_prec_t = number & { __number_type?: undefined };
export type mpfr_flags_t = number & { __number_type?: undefined };
export type mpfr_ptr_ptr = number & { __number_type?: undefined };
export type mp_ptr = number & { __number_type?: undefined };
export type mpfr_exp_t_ptr = number & { __number_type?: undefined };
export type c_str_ptr_ptr = number & { __number_type?: undefined };

export type mpfr_exp_t = number & { __number_type?: undefined };
export type mpfr_t = number & { __number_type?: undefined };
export type mpfr_prec_t_ptr = number & { __number_type?: undefined };

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
