import { CalculateType, getGMP, IntegerType, RationalType } from '../src';
/* global test, expect */

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
let gmp: Awaited<ReturnType<typeof getGMP>> = null;
let ctx: CalculateType = null;

beforeAll(async () => {
  gmp = await getGMP();
  ctx = gmp.calculateManual();
});

const compare = (int: RationalType | IntegerType, res: string) => {
  expect(int.toString()).toBe(res);
}

test('parse strings', () => {
  compare(ctx.Rational('-1'), '-1');
  compare(ctx.Rational('0'), '0');
  compare(ctx.Rational('1'), '1');
  compare(ctx.Rational('2/3'), '2/3');
  compare(ctx.Rational('-2/3'), '-2/3');
  compare(ctx.Rational('2/-3'), '-2/3');
  compare(ctx.Rational('-2/-3'), '2/3');
});

test('parse numbers', () => {
  compare(ctx.Rational(-1), '-1');
  compare(ctx.Rational(0), '0');
  compare(ctx.Rational(1), '1');
  compare(ctx.Rational(-2, 3), '-2/3');
  compare(ctx.Rational(2, -3), '-2/3');
  compare(ctx.Rational(-2, -3), '2/3');
  compare(ctx.Rational(123456789, '5'), '123456789/5');
});

test('copy constructor', () => {
  const a = ctx.Rational('2/3');
  const b = ctx.Rational(a);
  const c = a.add(2);
  compare(a, '2/3');
  compare(b, '2/3');
  compare(c, '8/3');
});

test('add()', () => {
  compare(ctx.Rational(2, 3).add(1), '5/3');
  compare(ctx.Rational(2, 3).add(ctx.Rational(1, 3)), '1');
});

test('sub()', () => {
  compare(ctx.Rational(2, 3).sub(1), '-1/3');
  compare(ctx.Rational(2, 3).sub(ctx.Rational(1, 3)), '1/3');
});

test('mul()', () => {
  compare(ctx.Rational(2, 3).mul(2), '4/3');
  compare(ctx.Rational(2, 3).mul(ctx.Rational(3, 4)), '1/2');
});

test('div()', () => {
  compare(ctx.Rational(2, 3).div(2), '1/3');
  compare(ctx.Rational(2, 3).div(ctx.Rational(3, 4)), '8/9');
});

test('neg()', () => {
  compare(ctx.Rational(2, 3).neg(), '-2/3');
});

test('invert()', () => {
  compare(ctx.Rational(2, 3).invert(), '3/2');
});

test('abs()', () => {
  compare(ctx.Rational(-2, 3).abs(), '2/3');
  compare(ctx.Rational(2, -3).abs(), '2/3');
  compare(ctx.Rational(2, 3).abs(), '2/3');
});

test('numerator()', () => {
  compare(ctx.Rational(-2, 3).numerator(), '-2');
  compare(ctx.Rational(2, -3).numerator(), '-2');
  compare(ctx.Rational(2, 3).numerator(), '2');
});

test('denominator()', () => {
  compare(ctx.Rational(-2, 3).denominator(), '3');
  compare(ctx.Rational(2, -3).denominator(), '3');
  compare(ctx.Rational(2, 3).denominator(), '3');
});

test('isEqual()', () => {
  expect(ctx.Rational('2/3').isEqual(ctx.Rational('2/3'))).toBe(true);
  expect(ctx.Rational('2').isEqual(2)).toBe(true);
  expect(ctx.Rational('2/3').isEqual(2)).toBe(false);
  expect(ctx.Rational('4/6').isEqual(ctx.Rational('2/3'))).toBe(true);
});

test('lessThan()', () => {
  expect(ctx.Rational('2/3').lessThan(ctx.Rational('2/3'))).toBe(false);
  expect(ctx.Rational('2').lessThan(3)).toBe(true);
  expect(ctx.Rational('2').lessThan(1)).toBe(false);
});

test('greaterThan()', () => {
  expect(ctx.Rational('2/3').greaterThan(ctx.Rational('2/3'))).toBe(false);
  expect(ctx.Rational('2').greaterThan(1)).toBe(true);
  expect(ctx.Rational('2').greaterThan(3)).toBe(false);
});

test('greaterThan()', () => {
  expect(ctx.Rational('2/3').greaterThan(ctx.Rational('2/3'))).toBe(false);
  expect(ctx.Rational('2').greaterThan(1)).toBe(true);
  expect(ctx.Rational('2').greaterThan(3)).toBe(false);
});

test('sign()', () => {
  expect(ctx.Rational(-2, 3).sign()).toBe(-1);
  expect(ctx.Rational(2, -3).sign()).toBe(-1);
  expect(ctx.Rational(2, 3).sign()).toBe(1);
});

test('toNumber()', () => {
  expect(ctx.Rational('2').toNumber()).toBe(2);
  expect(ctx.Rational('-2').toNumber()).toBe(-2);
  expect(ctx.Rational('1/4').toNumber()).toBe(0.25);
});
