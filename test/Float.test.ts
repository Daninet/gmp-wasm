import { CalculateType, getGMP } from '../src';
/* global test, expect */

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
let gmp: Awaited<ReturnType<typeof getGMP>> = null;
let ctx: CalculateType = null;

beforeAll(async () => {
  gmp = await getGMP(require.resolve('../binding/dist/gmp.wasm'));
  ctx = gmp.calculateManual({ precisionBits: 16 });
});

const compare = (int: ReturnType<typeof ctx.Float>, res: string) => {
  expect(int.toString()).toBe(res);
}

test('parse strings', () => {
  compare(ctx.Float('1'), '1');
  compare(ctx.Float('0'), '0');
  compare(ctx.Float('-1'), '-1');
  compare(ctx.Float('0.5'), '0.5');
  compare(ctx.Float('-0.5'), '-0.5');
});

test('parse numbers', () => {
  compare(ctx.Float(-1), '-1');
  compare(ctx.Float(0), '0');
  compare(ctx.Float(1), '1');
  compare(ctx.Float(0.5), '0.5');
  compare(ctx.Float(-0.5), '-0.5');
});

test('copy constructor', () => {
  const a = ctx.Float('0.5');
  const b = ctx.Float(a);
  const c = a.add(2);
  compare(a, '0.5');
  compare(b, '0.5');
  compare(c, '2.5');
});

test('Constants', () => {
  compare(ctx.Pi(), '3.1416');
  compare(ctx.Log2(), '0.693146');
  compare(ctx.Catalan(), '0.91597');
  compare(ctx.EulerConstant(), '0.577209');
  compare(ctx.EulerNumber(), '2.71826');
});

test('add()', () => {
  compare(ctx.Float(0.5).add(1), '1.5');
  compare(ctx.Float(0.4).add(0.6), '1');
  compare(ctx.Float(0.5).add(ctx.Float(1)), '1.5');
  compare(ctx.Float(0.4).add(ctx.Float(0.6)), '1');
});

test('sub()', () => {
  compare(ctx.Float(1).sub(0.5), '0.5');
  compare(ctx.Float(0.6).sub(0.4), '0.200005');
  compare(ctx.Float(1).sub(ctx.Float(0.5)), '0.5');
  compare(ctx.Float(0.6).sub(ctx.Float(0.4)), '0.200005');
});

test('mul()', () => {
  compare(ctx.Float(3).mul(0.5), '1.5');
  compare(ctx.Float(6).mul(2), '12');
  compare(ctx.Float(3).mul(ctx.Float(0.5)), '1.5');
  compare(ctx.Float(6).mul(ctx.Float(2)), '12');
});

test('div()', () => {
  compare(ctx.Float(3).div(0.5), '6');
  compare(ctx.Float(6).div(2), '3');
  compare(ctx.Float(3).div(ctx.Float(0.5)), '6');
  compare(ctx.Float(7).div(ctx.Float(2)), '3.5');
});

test('sqrt()', () => {
  compare(ctx.Float(4).sqrt(), '2');
  compare(ctx.Float(2).sqrt(), '1.41422');
});

test('invSqrt()', () => {
  compare(ctx.Float(4).invSqrt(), '0.5');
  compare(ctx.Float(2).invSqrt(), '0.707108');
});

test('cbrt()', () => {
  compare(ctx.Float(27).cbrt(), '3');
  compare(ctx.Float(3).cbrt(), '1.44226');
});

test('nthRoot()', () => {
  compare(ctx.Float(2).nthRoot(2), '1.41422');
  compare(ctx.Float(3).nthRoot(3), '1.44226');
});

test('neg()', () => {
  compare(ctx.Float(0.5).neg(), '-0.5');
  compare(ctx.Float(-0.5).neg(), '0.5');
});

test('abs()', () => {
  compare(ctx.Float(0.5).abs(), '0.5');
  compare(ctx.Float(-0.5).abs(), '0.5');
});

test('factorial()', () => {
  compare(ctx.Float(3).factorial(), '6');
  compare(ctx.Float(4).factorial(), '24');
});

test('isZero()', () => {
  expect(ctx.Float(0).isZero()).toBe(true);
  expect(ctx.Float(0.01).isZero()).toBe(false);
  expect(ctx.Float(1).isZero()).toBe(false);
});

test('isRegular()', () => {
  expect(ctx.Float(0).isRegular()).toBe(false);
  expect(ctx.Float(1).div(0).isRegular()).toBe(false);
  expect(ctx.Float(0).div(0).isRegular()).toBe(false);
  expect(ctx.Float(2).isRegular()).toBe(true);
});

test('isNumber()', () => {
  expect(ctx.Float(0).isNumber()).toBe(true);
  expect(ctx.Float(1).isNumber()).toBe(true);
  expect(ctx.Float(1).div(0).isNumber()).toBe(false);
});

test('isInfinite()', () => {
  expect(ctx.Float(0).isInfinite()).toBe(false);
  expect(ctx.Float(1).div(0).isInfinite()).toBe(true);
  expect(ctx.Float(0).div(0).isInfinite()).toBe(false);
});

test('isNaN()', () => {
  expect(ctx.Float(0).isNaN()).toBe(false);
  expect(ctx.Float(0).div(0).isNaN()).toBe(true);
});

test('isEqual()', () => {
  expect(ctx.Float(0).isEqual(0)).toBe(true);
  expect(ctx.Float(1).isEqual(0)).toBe(false);
  expect(ctx.Float(0).isEqual(ctx.Float(0))).toBe(true);
  expect(ctx.Float(1).isEqual(ctx.Float(0))).toBe(false);
});

test('lessThan()', () => {
  expect(ctx.Float(0).lessThan(0)).toBe(false);
  expect(ctx.Float(1).lessThan(0)).toBe(false);
  expect(ctx.Float(1).lessThan(2)).toBe(true);
  expect(ctx.Float(0).lessThan(ctx.Float(0))).toBe(false);
  expect(ctx.Float(1).lessThan(ctx.Float(0))).toBe(false);
  expect(ctx.Float(1).lessThan(ctx.Float(2))).toBe(true);
});

test('lessOrEqual()', () => {
  expect(ctx.Float(0).lessOrEqual(0)).toBe(true);
  expect(ctx.Float(1).lessOrEqual(0)).toBe(false);
  expect(ctx.Float(1).lessOrEqual(2)).toBe(true);
  expect(ctx.Float(0).lessOrEqual(ctx.Float(0))).toBe(true);
  expect(ctx.Float(1).lessOrEqual(ctx.Float(0))).toBe(false);
  expect(ctx.Float(1).lessOrEqual(ctx.Float(2))).toBe(true);
});

test('greaterThan()', () => {
  expect(ctx.Float(0).greaterThan(0)).toBe(false);
  expect(ctx.Float(1).greaterThan(0)).toBe(true);
  expect(ctx.Float(1).greaterThan(2)).toBe(false);
  expect(ctx.Float(0).greaterThan(ctx.Float(0))).toBe(false);
  expect(ctx.Float(1).greaterThan(ctx.Float(0))).toBe(true);
  expect(ctx.Float(1).greaterThan(ctx.Float(2))).toBe(false);
});

test('greaterOrEqual()', () => {
  expect(ctx.Float(0).greaterOrEqual(0)).toBe(true);
  expect(ctx.Float(1).greaterOrEqual(0)).toBe(true);
  expect(ctx.Float(1).greaterOrEqual(2)).toBe(false);
  expect(ctx.Float(0).greaterOrEqual(ctx.Float(0))).toBe(true);
  expect(ctx.Float(1).greaterOrEqual(ctx.Float(0))).toBe(true);
  expect(ctx.Float(1).greaterOrEqual(ctx.Float(2))).toBe(false);
});

test('logarithms', () => {
  compare(ctx.EulerNumber().pow(3).ln(), '3');
  compare(ctx.Float(2).pow(5).log2(), '5');
  compare(ctx.Float(10).pow(4).log10(), '4');
});

test('exponentials', () => {
  compare(ctx.Float(1).exp(), '2.71826');
  compare(ctx.Float(3).exp2(), '8');
  compare(ctx.Float(3).exp10(), '1000');
});

test('pow()', () => {
  compare(ctx.Float(2).pow(0), '1');
  compare(ctx.Float(2).pow(2), '4');
  compare(ctx.Float(2).pow(-2), '0.25');
  compare(ctx.Float(4).pow(0.5), '2');
  compare(ctx.Float(4).pow(ctx.Float('0.5')), '2');
});

test('sin()', () => {
  compare(ctx.Float(0).sin(), '0');
  compare(ctx.Pi().div(6).sin(), '0.5');
  compare(ctx.Pi().div(4).sin(), ctx.Float(2).sqrt().div(2).toString());
  compare(ctx.Pi().div(3).sin(), ctx.Float(3).sqrt().div(2).toString());
  compare(ctx.Pi().div(2).sin(), '1');
  compare(ctx.Pi().mul(4).sin(), '0.0000356352');
});

test('cos()', () => {
  compare(ctx.Float(0).cos(), '1');
  compare(ctx.Pi().div(6).cos(), ctx.Float(3).sqrt().div(2).toString());
  compare(ctx.Pi().div(4).cos(), ctx.Float(2).sqrt().div(2).toString());
  compare(ctx.Pi().div(3).cos(), '0.499992');
  compare(ctx.Pi().div(2).cos(), '-0.0000044544');
  compare(ctx.Pi().mul(4).cos(), '1');
});

test('tan()', () => {
  compare(ctx.Float(0).tan(), '0');
  compare(ctx.Pi().div(6).tan(), '0.577362');
  compare(ctx.Pi().div(4).tan(), '1');
  compare(ctx.Pi().div(3).tan(), '1.73212');
});

test('special values', () => {
  compare(ctx.Float(0), '0');
  compare(ctx.Float(-0), '-0');
  compare(ctx.Float('-0'), '-0');
  compare(ctx.Float(0).div(0), '@NaN@');
  compare(ctx.Float(1).div(0), '@Inf@');
  compare(ctx.Float(-1).div(0), '-@Inf@');
});

test('special values to JS types', () => {
  expect(ctx.Float(0).toNumber()).toBe(0);
  expect(ctx.Float(-0).toNumber()).toBe(-0);
  expect(ctx.Float('-0').toNumber()).toBe(-0);
  expect(ctx.Float(0).div(0).toNumber()).toBe(NaN);
  expect(ctx.Float(1).div(0).toNumber()).toBe(Infinity);
  expect(ctx.Float(-1).div(0).toNumber()).toBe(-Infinity);
});
