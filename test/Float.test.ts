import { getGMP } from '../src';
/* global test, expect */

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
let gmp: Awaited<ReturnType<typeof getGMP>> = null;
let Float: (...params: Parameters<ReturnType<typeof gmp.Float>['set']>) => ReturnType<typeof gmp.Float> = null;

beforeAll(async () => {
  gmp = await getGMP(require.resolve('../binding/dist/gmp.wasm'));
  Float = (...params: Parameters<ReturnType<typeof gmp.Float>['set']>) => gmp.Float(16).set(...params);
});

const compare = (int: ReturnType<typeof Float>, res: string) => {
  expect(int.toString()).toBe(res);
}

test('parse strings', () => {
  compare(Float('1'), '1');
  compare(Float('0'), '0');
  compare(Float('-1'), '-1');
  compare(Float('0.5'), '0.5');
  compare(Float('-0.5'), '-0.5');
});

test('parse numbers', () => {
  compare(Float(-1), '-1');
  compare(Float(0), '0');
  compare(Float(1), '1');
  compare(Float(0.5), '0.5');
  compare(Float(-0.5), '-0.5');
});

test('copy constructor', () => {
  const a = Float('0.5');
  const b = Float(a);
  a.add(2);
  compare(a, '2.5');
  compare(b, '0.5');
});

test('set to constants', () => {
  compare(Float(0).setToPi(), '3.1416');
  compare(Float(0).setToLog2(), '0.693146');
  compare(Float(0).setToCatalan(), '0.91597');
  compare(Float(0).setToEulerConstant(), '0.577209');
  compare(Float(0).setToEulerNumber(), '2.71826');
});

test('add()', () => {
  compare(Float(0.5).add(1), '1.5');
  compare(Float(0.4).add(0.6), '1');
  compare(Float(0.5).add(Float(1)), '1.5');
  compare(Float(0.4).add(Float(0.6)), '1');
});

test('sub()', () => {
  compare(Float(1).sub(0.5), '0.5');
  compare(Float(0.6).sub(0.4), '0.200005');
  compare(Float(1).sub(Float(0.5)), '0.5');
  compare(Float(0.6).sub(Float(0.4)), '0.200005');
});

test('mul()', () => {
  compare(Float(3).mul(0.5), '1.5');
  compare(Float(6).mul(2), '12');
  compare(Float(3).mul(Float(0.5)), '1.5');
  compare(Float(6).mul(Float(2)), '12');
});

test('div()', () => {
  compare(Float(3).div(0.5), '6');
  compare(Float(6).div(2), '3');
  compare(Float(3).div(Float(0.5)), '6');
  compare(Float(7).div(Float(2)), '3.5');
});

test('sqrt()', () => {
  compare(Float(4).sqrt(), '2');
  compare(Float(2).sqrt(), '1.41422');
});

test('cbrt()', () => {
  compare(Float(27).cbrt(), '3');
  compare(Float(3).cbrt(), '1.44226');
});

test('nthRoot()', () => {
  compare(Float(2).nthRoot(2), '1.41422');
  compare(Float(3).nthRoot(3), '1.44226');
});

test('neg()', () => {
  compare(Float(0.5).neg(), '-0.5');
  compare(Float(-0.5).neg(), '0.5');
});

test('abs()', () => {
  compare(Float(0.5).abs(), '0.5');
  compare(Float(-0.5).abs(), '0.5');
});

test('isZero()', () => {
  expect(Float(0).isZero()).toBe(true);
  expect(Float(0.01).isZero()).toBe(false);
  expect(Float(1).isZero()).toBe(false);
});

test('isRegular()', () => {
  expect(Float(0).isRegular()).toBe(false);
  expect(Float(1).div(0).isRegular()).toBe(false);
  expect(Float(0).div(0).isRegular()).toBe(false);
  expect(Float(2).isRegular()).toBe(true);
});

test('isNumber()', () => {
  expect(Float(0).isNumber()).toBe(true);
  expect(Float(1).isNumber()).toBe(true);
  expect(Float(1).div(0).isNumber()).toBe(false);
});

test('isInfinite()', () => {
  expect(Float(0).isInfinite()).toBe(false);
  expect(Float(1).div(0).isInfinite()).toBe(true);
  expect(Float(0).div(0).isInfinite()).toBe(false);
});

test('isNaN()', () => {
  expect(Float(0).isNaN()).toBe(false);
  expect(Float(0).div(0).isNaN()).toBe(true);
});

test('isEqual()', () => {
  expect(Float(0).isEqual(0)).toBe(true);
  expect(Float(1).isEqual(0)).toBe(false);
  expect(Float(0).isEqual(Float(0))).toBe(true);
  expect(Float(1).isEqual(Float(0))).toBe(false);
});

test('lessThan()', () => {
  expect(Float(0).lessThan(0)).toBe(false);
  expect(Float(1).lessThan(0)).toBe(false);
  expect(Float(1).lessThan(2)).toBe(true);
  expect(Float(0).lessThan(Float(0))).toBe(false);
  expect(Float(1).lessThan(Float(0))).toBe(false);
  expect(Float(1).lessThan(Float(2))).toBe(true);
});

test('lessOrEqual()', () => {
  expect(Float(0).lessOrEqual(0)).toBe(true);
  expect(Float(1).lessOrEqual(0)).toBe(false);
  expect(Float(1).lessOrEqual(2)).toBe(true);
  expect(Float(0).lessOrEqual(Float(0))).toBe(true);
  expect(Float(1).lessOrEqual(Float(0))).toBe(false);
  expect(Float(1).lessOrEqual(Float(2))).toBe(true);
});

test('greaterThan()', () => {
  expect(Float(0).greaterThan(0)).toBe(false);
  expect(Float(1).greaterThan(0)).toBe(true);
  expect(Float(1).greaterThan(2)).toBe(false);
  expect(Float(0).greaterThan(Float(0))).toBe(false);
  expect(Float(1).greaterThan(Float(0))).toBe(true);
  expect(Float(1).greaterThan(Float(2))).toBe(false);
});

test('greaterOrEqual()', () => {
  expect(Float(0).greaterOrEqual(0)).toBe(true);
  expect(Float(1).greaterOrEqual(0)).toBe(true);
  expect(Float(1).greaterOrEqual(2)).toBe(false);
  expect(Float(0).greaterOrEqual(Float(0))).toBe(true);
  expect(Float(1).greaterOrEqual(Float(0))).toBe(true);
  expect(Float(1).greaterOrEqual(Float(2))).toBe(false);
});

test('logarithms', () => {
  compare(Float(1).setToEulerNumber().pow(3).ln(), '3');
  compare(Float(2).pow(5).log2(), '5');
  compare(Float(10).pow(4).log10(), '4');
});

test('exponentials', () => {
  compare(Float(1).exp(), '2.71826');
  compare(Float(3).exp2(), '8');
  compare(Float(3).exp10(), '1000');
});

test('pow()', () => {
  compare(Float(2).pow(0), '1');
  compare(Float(2).pow(2), '4');
  compare(Float(2).pow(-2), '0.25');
  compare(Float(4).pow(0.5), '2');
  compare(Float(4).pow(Float('0.5')), '2');
});

test('sin()', () => {
  compare(Float(0).sin(), '0');
  compare(Float(0).setToPi().div(6).sin(), '0.5');
  compare(Float(0).setToPi().div(4).sin(), Float(2).sqrt().div(2).toString());
  compare(Float(0).setToPi().div(3).sin(), Float(3).sqrt().div(2).toString());
  compare(Float(0).setToPi().div(2).sin(), '1');
  compare(Float(0).setToPi().mul(4).sin(), '0.0000356352');
});

test('cos()', () => {
  compare(Float(0).cos(), '1');
  compare(Float(0).setToPi().div(6).cos(), Float(3).sqrt().div(2).toString());
  compare(Float(0).setToPi().div(4).cos(), Float(2).sqrt().div(2).toString());
  compare(Float(0).setToPi().div(3).cos(), '0.499992');
  compare(Float(0).setToPi().div(2).cos(), '-0.0000044544');
  compare(Float(0).setToPi().mul(4).cos(), '1');
});

test('tan()', () => {
  compare(Float(0).tan(), '0');
  compare(Float(0).setToPi().div(6).tan(), '0.577362');
  compare(Float(0).setToPi().div(4).tan(), '1');
  compare(Float(0).setToPi().div(3).tan(), '1.73212');
});

test('special values', () => {
  compare(Float(0), '0');
  compare(Float(-0), '-0');
  compare(Float('-0'), '-0');
  compare(Float(0).div(0), '@NaN@');
  compare(Float(1).div(0), '@Inf@');
  compare(Float(-1).div(0), '-@Inf@');
});

test('special values to JS types', () => {
  expect(Float(0).toNumber()).toBe(0);
  expect(Float(-0).toNumber()).toBe(-0);
  expect(Float('-0').toNumber()).toBe(-0);
  expect(Float(0).div(0).toNumber()).toBe(NaN);
  expect(Float(1).div(0).toNumber()).toBe(Infinity);
  expect(Float(-1).div(0).toNumber()).toBe(-Infinity);
});
