
#if defined (umul_ppmm)
#define umul_ppmm(w1, w0, u, v)						\
  do {									\
    uint64_t lo_lo = ((u) & 0xFFFFFFFF) * ((v) & 0xFFFFFFFF); \
    uint64_t hi_lo = ((u) >> 32)        * ((v) & 0xFFFFFFFF); \
    uint64_t lo_hi = ((u) & 0xFFFFFFFF) * ((v) >> 32); \
    uint64_t hi_hi = ((u) >> 32)        * ((v) >> 32); \
\
    /* Now add the products together. These will never overflow. */\
    uint64_t cross = (lo_lo >> 32) + (hi_lo & 0xFFFFFFFF) + lo_hi; \
    uint64_t upper = (hi_lo >> 32) + (cross >> 32)        + hi_hi; \
    uint64_t lower = (cross << 32) | (lo_lo & 0xFFFFFFFF); \
\
    (w1) = upper; \
    (w0) = lower; \
  } while (0)
#endif

#if defined (umul_ppmm)
#define umul_ppmm(w1, w0, u, v)						\
  do {									\
    __uint128_t product = (__uint128_t)(u) * (__uint128_t)(v); \
    (w1) = (uint64_t)(product >> 64); \
    (w0) = (uint64_t)(product & 0xFFFFFFFFFFFFFFFF); \
  } while (0)
#endif

#if !defined (umul_ppmm)
#include <emmintrin.h>
#include <wasm_simd128.h>
#define umul_ppmm(w1, w0, u, v)						\
  do {									\
    v128_t _ab = wasm_i64x2_splat(u); \
    v128_t ab = wasm_i64x2_replace_lane(_ab, 0, 0); \
    v128_t _cd = wasm_i64x2_splat(v); \
    v128_t cd = wasm_i64x2_replace_lane(_cd, 0, 0); \
 \
    /* ac = (ab & 0xFFFFFFFF) * (cd & 0xFFFFFFFF); */ \
    v128_t ac = _mm_mul_epu32(ab, cd); \
 \
    /* b = ab >> 32; */ \
    v128_t b = _mm_srli_epi64(ab, 32); \
 \
    /* bc = b * (cd & 0xFFFFFFFF); */ \
    v128_t bc = _mm_mul_epu32(b, cd); \
 \
    /* d = cd >> 32; */ \
    v128_t d = _mm_srli_epi64(cd, 32); \
 \
    /* ad = (ab & 0xFFFFFFFF) * d; */ \
    v128_t ad = _mm_mul_epu32(ab, d); \
 \
    /* high = bc + ad; */ \
    v128_t high = _mm_add_epi64(bc, ad); \
 \
    /* high <<= 32; */ \
    high = _mm_slli_epi64(high, 32); \
 \
    /* return ac + high; */ \
    v128_t res = _mm_add_epi64(high, ac); \
 \
    (w1) = wasm_i64x2_extract_lane(res, 1); \
    (w0) = wasm_i64x2_extract_lane(res, 0); \
  } while (0)
#endif
