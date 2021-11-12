import { getGMP } from '../src';
/* global test, expect */

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
let gmp: Awaited<ReturnType<typeof getGMP>> = null;
let Rational: typeof gmp.Rational = null;
beforeAll(async () => {
  gmp = await getGMP(require.resolve('../binding/dist/gmp.wasm'));
  Rational = gmp.Rational;
});

const compare = (int: ReturnType<typeof Rational>, res: string) => {
  expect(int.toString()).toBe(res);
}

test('parse strings', () => {
  compare(Rational('-1'), '-1');
  compare(Rational('0'), '0');
  compare(Rational('1'), '1');
  compare(Rational('2/3'), '2/3');
  compare(Rational('-2/3'), '-2/3');
  compare(Rational('2/-3'), '-2/3');
  compare(Rational('-2/-3'), '2/3');
});

test('parse numbers', () => {
  compare(Rational(-1), '-1');
  compare(Rational(0), '0');
  compare(Rational(1), '1');
  compare(Rational(-2, 3), '-2/3');
  compare(Rational(2, -3), '-2/3');
  compare(Rational(-2, -3), '2/3');
  compare(Rational(123456789, '5'), '123456789/5');
});

test('copy constructor', () => {
  const a = Rational('2/3');
  const b = Rational(a);
  a.add(2);
  compare(a, '8/3');
  compare(b, '2/3');
});

test('add()', () => {
  compare(Rational(2, 3).add(1), '5/3');
  compare(Rational(2, 3).add(Rational(1, 3)), '1');
});

test('sub()', () => {
  compare(Rational(2, 3).sub(1), '-1/3');
  compare(Rational(2, 3).sub(Rational(1, 3)), '1/3');
});

test('mul()', () => {
  compare(Rational(2, 3).mul(2), '4/3');
  compare(Rational(2, 3).mul(Rational(3, 4)), '1/2');
});

test('div()', () => {
  compare(Rational(2, 3).div(2), '1/3');
  compare(Rational(2, 3).div(Rational(3, 4)), '8/9');
});

test('neg()', () => {
  compare(Rational(2, 3).neg(), '-2/3');
});

test('invert()', () => {
  compare(Rational(2, 3).invert(), '3/2');
});

test('abs()', () => {
  compare(Rational(-2, 3).abs(), '2/3');
  compare(Rational(2, -3).abs(), '2/3');
  compare(Rational(2, 3).abs(), '2/3');
});

test('isEqual()', () => {
  expect(Rational('2/3').isEqual(Rational('2/3'))).toBe(true);
  expect(Rational('2').isEqual(2)).toBe(true);
  expect(Rational('2/3').isEqual(2)).toBe(false);
  expect(Rational('4/6').isEqual(Rational('2/3'))).toBe(true);
});

test('lessThan()', () => {
  expect(Rational('2/3').lessThan(Rational('2/3'))).toBe(false);
  expect(Rational('2').lessThan(3)).toBe(true);
  expect(Rational('2').lessThan(1)).toBe(false);
});

test('greaterThan()', () => {
  expect(Rational('2/3').greaterThan(Rational('2/3'))).toBe(false);
  expect(Rational('2').greaterThan(1)).toBe(true);
  expect(Rational('2').greaterThan(3)).toBe(false);
});

test('greaterThan()', () => {
  expect(Rational('2/3').greaterThan(Rational('2/3'))).toBe(false);
  expect(Rational('2').greaterThan(1)).toBe(true);
  expect(Rational('2').greaterThan(3)).toBe(false);
});

test('sign()', () => {
  expect(Rational(-2, 3).sign()).toBe(-1);
  expect(Rational(2, -3).sign()).toBe(-1);
  expect(Rational(2, 3).sign()).toBe(1);
});

test('toNumber()', () => {
  expect(Rational('2').toNumber()).toBe(2);
  expect(Rational('-2').toNumber()).toBe(-2);
  expect(Rational('1/4').toNumber()).toBe(0.25);
});
