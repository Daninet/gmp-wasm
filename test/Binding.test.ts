import { trimTrailingZeros } from '../src/util';
import { FloatRoundingMode, init as initGMP, mpfr_rnd_t } from '../src';
/* global test, expect */

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
let gmp: Awaited<ReturnType<typeof initGMP>> = null;
let binding: typeof gmp.binding = null;

beforeAll(async () => {
  gmp = await initGMP();
  binding = gmp.binding;
});

test('addition', () => {
  // Create first number and initialize it to 30
  const num1Ptr = binding.mpz_t();
  binding.mpz_init_set_si(num1Ptr, 30);
  // Create second number from string. The string needs to be copied into WASM memory
  const num2Ptr = binding.mpz_t();
  const strPtr = binding.malloc_cstr('40');
  binding.mpz_init_set_str(num2Ptr, strPtr, 10);
  // Calculate num1Ptr + num2Ptr, store the result in num1Ptr
  binding.mpz_add(num1Ptr, num1Ptr, num2Ptr);
  // Get result as integer
  expect(binding.mpz_get_si(num1Ptr)).toBe(70);
  // Deallocate memory
  binding.free(strPtr);
  binding.mpz_clears(num1Ptr, num2Ptr);
  binding.mpz_t_frees(num1Ptr, num2Ptr);
});

test('allocate a lot of objects', async () => {
  const initLength = binding.mem.length;
  // 128 MB
  for (let i = 0; i < 128; i++) {
    binding.malloc(1024 * 1024);
  }
  expect(binding.mem.length).toBeGreaterThan(initLength);
  // deallocate all memory
  await binding.reset();
  expect(binding.mem.length).toBe(initLength);
});

test('has 64 bit binding', () => {
  expect(gmp.binding.mp_bits_per_limb()).toBe(64);
});

test('binding has macros', () => {
  const ctx = gmp.getContext();
  const { mpq_t } = ctx.Rational(3, 4);
  expect(gmp.binding.mpz_get_si(gmp.binding.mpq_numref(mpq_t))).toBe(3);
  expect(gmp.binding.mpz_get_si(gmp.binding.mpq_denref(mpq_t))).toBe(4);
});

test('mpfr_to_string()', () => {
  const ctx = gmp.getContext();

  const getPi = (prec, base = 10) => {
    const pi = ctx.Pi({ precisionBits: prec, roundingMode: FloatRoundingMode.ROUND_TO_ZERO });
    return gmp.binding.mpfr_to_string(pi.mpfr_t, base, mpfr_rnd_t.MPFR_RNDZ, true);
  }

  const max = 10000;
  const ref = getPi(max);
  for (let i = 10; i < max; i++) {
    expect(ref).toContain(getPi(i));
  }
});

test('trimTrailingZeros()', () => {
  expect(trimTrailingZeros('0')).toBe('0');
  expect(trimTrailingZeros('0.')).toBe('0');
  expect(trimTrailingZeros('-0')).toBe('-0');
  expect(trimTrailingZeros('-0.')).toBe('-0');
  expect(trimTrailingZeros('0.0')).toBe('0');
  expect(trimTrailingZeros('-0.00')).toBe('-0');
  expect(trimTrailingZeros('-0.010')).toBe('-0.01');
  expect(trimTrailingZeros('-123.000')).toBe('-123');
  expect(trimTrailingZeros('-123.320000')).toBe('-123.32');
  expect(trimTrailingZeros('-123.320001')).toBe('-123.320001');
});