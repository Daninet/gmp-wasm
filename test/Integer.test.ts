import { DivMode } from '../src/integer';
import { getGMP } from '../src';
/* global test, expect */

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
let gmp: Awaited<ReturnType<typeof getGMP>> = null;
let Integer: typeof gmp.Integer = null;
beforeAll(async () => {
  gmp = await getGMP(require.resolve('../binding/dist/gmp.wasm'));
  Integer = gmp.Integer;
});

const compare = (int: ReturnType<typeof Integer>, res: string) => {
  expect(int.toString()).toBe(res);
}

test('parse strings', async () => {
  compare(Integer('-1'), '-1');
  compare(Integer('0'), '0');
  compare(Integer('1'), '1');
  compare(Integer('123456789'), '123456789');
  compare(Integer('123 456789123 456789'), '123456789123456789');
  compare(Integer('-123 456789123 456789'), '-123456789123456789');
});

test('parse numbers', async () => {
  compare(Integer(-1), '-1');
  compare(Integer(0), '0');
  compare(Integer(1), '1');
  compare(Integer(123456789), '123456789');
});

test('copy constructor', async () => {
  const a = Integer(1);
  const b = Integer(a);
  a.add(2);
  compare(a, '3');
  compare(b, '1');
});

test('add()', async () => {
  compare(Integer(-2).add(-1), '-3');
  compare(Integer(-2).add(0), '-2');
  compare(Integer(-2).add(1), '-1');
  compare(Integer(-2).add(Integer(-1)), '-3');
  compare(Integer(-2).add(Integer(0)), '-2');
  compare(Integer(-2).add(Integer(1)), '-1');
});

test('subtract()', async () => {
  compare(Integer(-2).sub(-1), '-1');
  compare(Integer(-2).sub(0), '-2');
  compare(Integer(-2).sub(1), '-3');
  compare(Integer(-2).sub(Integer(-1)), '-1');
  compare(Integer(-2).sub(Integer(0)), '-2');
  compare(Integer(-2).sub(Integer(1)), '-3');
});

test('multiply()', async () => {
  compare(Integer(3).mul(4), '12');
  compare(Integer(3).mul(-4), '-12');
  compare(Integer(3).mul(Integer(4)), '12');
  compare(Integer(3).mul(Integer(-4)), '-12');
});

test('addmul()', async () => {
  compare(Integer(3).addmul(4), '15');
  compare(Integer(3).addmul(0), '3');
  compare(Integer(3).addmul(-4), '-9');
  compare(Integer(3).addmul(Integer(4)), '15');
  compare(Integer(3).addmul(Integer(0)), '3');
  compare(Integer(3).addmul(Integer(-4)), '-9');
});

test('submul()', async () => {
  compare(Integer(3).submul(4), '-9');
  compare(Integer(3).submul(0), '3');
  compare(Integer(3).submul(-4), '15');
  compare(Integer(3).submul(Integer(4)), '-9');
  compare(Integer(3).submul(Integer(0)), '3');
  compare(Integer(3).submul(Integer(-4)), '15');
});

test('neg()', async () => {
  compare(Integer(3).neg(), '-3');
  compare(Integer(-3).neg(), '3');
});

test('abs()', async () => {
  compare(Integer(3).abs(), '3');
  compare(Integer(-3).abs(), '3');
});

test('div()', async () => {
  compare(Integer(12).div(-5), '-2');
  compare(Integer(12).div(5), '3');
  compare(Integer(12).div(-5, DivMode.CEIL), '-2');
  compare(Integer(12).div(5, DivMode.CEIL), '3');
  compare(Integer(12).div(-5, DivMode.FLOOR), '-3');
  compare(Integer(12).div(5, DivMode.FLOOR), '2');
  compare(Integer(12).div(-5, DivMode.TRUNCATE), '-2');
  compare(Integer(12).div(5, DivMode.TRUNCATE), '2');

  compare(Integer(12).div(Integer(-5)), '-2');
  compare(Integer(12).div(Integer(5)), '3');
  compare(Integer(12).div(Integer(-5), DivMode.CEIL), '-2');
  compare(Integer(12).div(Integer(5), DivMode.CEIL), '3');
  compare(Integer(12).div(Integer(-5), DivMode.FLOOR), '-3');
  compare(Integer(12).div(Integer(5), DivMode.FLOOR), '2');
  compare(Integer(12).div(Integer(-5), DivMode.TRUNCATE), '-2');
  compare(Integer(12).div(Integer(5), DivMode.TRUNCATE), '2');
});

test('pow()', async () => {
  compare(Integer(3).pow(0), '1');
  compare(Integer(3).pow(1), '3');
  compare(Integer(3).pow(4), '81');
  compare(Integer(2).pow(3, 3), '2');
  compare(Integer(2).pow(3, Integer(3)), '2');

  compare(Integer(3).pow(Integer(0)), '1');
  compare(Integer(3).pow(Integer(1)), '3');
  compare(Integer(3).pow(Integer(4)), '81');
  compare(Integer(2).pow(Integer(3), 3), '2');
  compare(Integer(2).pow(Integer(3), Integer(3)), '2');
});

test('sqrt()', async () => {
  compare(Integer(9).sqrt(), '3');
  compare(Integer(8).sqrt(), '2');
});

test('nthRoot()', async () => {
  compare(Integer(9).nthRoot(1), '9');
  compare(Integer(9).nthRoot(2), '3');
  compare(Integer(8).nthRoot(2), '2');
  compare(Integer(32).nthRoot(5), '2');
});

test('factorial()', async () => {
  compare(Integer(3).factorial(), '6');
  compare(Integer(4).factorial(), '24');
});

test('doubleFactorial()', async () => {
  compare(Integer(3).doubleFactorial(), '3');
  compare(Integer(4).doubleFactorial(), '8');
});

test('isPrime()', async () => {
  expect(Integer(9).isPrime()).toBe(false);
  expect(Integer(50).isPrime()).toBe(false);
  // expect(Integer('1795265022').isPrime(2)).toBe(true);
  expect(Integer(53).isPrime()).toBe(true);
});

test('nextPrime()', async () => {
  compare(Integer(9).nextPrime(), '11');
  compare(Integer(11).nextPrime(), '13');
});

test('gcd()', async () => {
  compare(Integer(6).gcd(15), '3');
  compare(Integer(11).gcd(12), '1');
  compare(Integer(6).gcd(Integer(15)), '3');
});

test('lcm()', async () => {
  compare(Integer(6).lcm(15), '30');
  compare(Integer(11).lcm(12), '132');
  compare(Integer(6).lcm(Integer(15)), '30');
});

test('and()', async () => {
  compare(Integer(0b1100).and(0b1010), '8');
  compare(Integer(0b1100).and(Integer(0b1010)), '8');
});

test('or()', async () => {
  compare(Integer(0b1100).or(0b1010), '14');
  compare(Integer(0b1100).or(Integer(0b1010)), '14');
});

test('xor()', async () => {
  compare(Integer(0b1100).xor(0b1010), '6');
  compare(Integer(0b1100).xor(Integer(0b1010)), '6');
});

test('shiftLeft()', async () => {
  compare(Integer(0b1100).shiftLeft(2), '48');
});

test('shiftRight()', async () => {
  compare(Integer(0b1100).shiftRight(2), '3');
});

test('isEqual()', async () => {
  expect(Integer('2').isEqual(2)).toBe(true);
  expect(Integer('2').isEqual(-2)).toBe(false);
  expect(Integer('2').isEqual(Integer(2))).toBe(true);
  expect(Integer('2').isEqual(Integer(-2))).toBe(false);
});

test('lessThan()', async () => {
  expect(Integer('2').lessThan(3)).toBe(true);
  expect(Integer('2').lessThan(2)).toBe(false);
  expect(Integer('2').lessThan(-2)).toBe(false);
  expect(Integer('2').lessThan(Integer(3))).toBe(true);
  expect(Integer('2').lessThan(Integer(2))).toBe(false);
  expect(Integer('2').lessThan(Integer(-2))).toBe(false);
});

test('greaterThan()', async () => {
  expect(Integer('2').greaterThan(3)).toBe(false);
  expect(Integer('2').greaterThan(2)).toBe(false);
  expect(Integer('2').greaterThan(-2)).toBe(true);
  expect(Integer('2').greaterThan(Integer(3))).toBe(false);
  expect(Integer('2').greaterThan(Integer(2))).toBe(false);
  expect(Integer('2').greaterThan(Integer(-2))).toBe(true);
});

test('sign()', async () => {
  expect(Integer('2').sign()).toBe(1);
  expect(Integer('0').sign()).toBe(0);
  expect(Integer('-2').sign()).toBe(-1);
});

test('toNumber()', async () => {
  expect(Integer('2').toNumber()).toBe(2);
  expect(Integer('-2').toNumber()).toBe(-2);
  expect(Integer('999 999 999 999').toNumber()).toBe(999999999999);
});
