import { getGMP, precisionToBits } from '../src';
/* global test, expect */

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
let gmp: Awaited<ReturnType<typeof getGMP>> = null;

beforeAll(async () => {
  gmp = await getGMP();
});

test('has 64 bit binding', () => {
  expect(gmp.binding.mp_bits_per_limb()).toBe(64);
});

test('calculate()', () => {
  expect(gmp.calculate(g => g.Float('2').sqrt())).toBe('1.4142135623730949');
  expect(gmp.calculate(g => g.Float('2').sqrt(), {})).toBe('1.4142135623730949');
  expect(gmp.calculate(g => g.Float('2').sqrt(), { precisionBits: 16 })).toBe('1.41422');
});

test('calculateManual()', () => {
  const calcDefault = gmp.calculateManual();
  expect(calcDefault.Float('2').sqrt().toString()).toBe('1.4142135623730949');
  expect(calcDefault.destroy()).toBe(undefined);
  const calcPrecision = gmp.calculateManual({ precisionBits: 16 });
  expect(calcPrecision.Float('2').sqrt().toString()).toBe('1.41422');
  expect(calcPrecision.destroy()).toBe(undefined);
});

test('precisionToBits()', () => {
  expect(precisionToBits(12)).toBe(40);
});
