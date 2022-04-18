import { init as initGMP, precisionToBits } from '../src';
/* global test, expect */

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
let gmp: Awaited<ReturnType<typeof initGMP>> = null;

beforeAll(async () => {
  gmp = await initGMP();
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

test('calculate()', () => {
  expect(gmp.calculate(g => g.Float('2').sqrt())).toBe('1.4142135623730949');
  expect(gmp.calculate(g => g.Float('2').sqrt(), {})).toBe('1.4142135623730949');
  expect(gmp.calculate(g => g.Float('2').sqrt(), { precisionBits: 16 })).toBe('1.41422');
});

test('getContext()', () => {
  const calcDefault = gmp.getContext();
  expect(calcDefault.Float('2').sqrt().toString()).toBe('1.4142135623730949');
  expect(calcDefault.destroy()).toBe(undefined);
  const calcPrecision = gmp.getContext({ precisionBits: 16 });
  expect(calcPrecision.Float('2').sqrt().toString()).toBe('1.41422');
  expect(calcPrecision.destroy()).toBe(undefined);
});

test('precisionToBits()', () => {
  expect(precisionToBits(12)).toBe(40);
});

test('mixed usage', () => {
  const sum = gmp.calculate((g) => {
    const a = g.Float(1);
    const b = g.Float(2);
    const c = g.Float();
    gmp.binding.mpfr_add(c.mpfr_t, a.mpfr_t, b.mpfr_t, 0);
    return c;
  });
  expect(sum).toBe('3');
});
