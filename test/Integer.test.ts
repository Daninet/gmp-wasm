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

const compare = (int: InstanceType<typeof Integer>, res: string) => {
  expect(int.toString()).toBe(res);
}

test('parse strings', async () => {
  compare(new Integer('-1'), '-1');
  compare(new Integer('0'), '0');
  compare(new Integer('1'), '1');
  compare(new Integer('123456789'), '123456789');
  compare(new Integer('123 456789123 456789'), '123456789123456789');
  compare(new Integer('-123 456789123 456789'), '-123456789123456789');
});

test('parse numbers', async () => {
  compare(new Integer(-1), '-1');
  compare(new Integer(0), '0');
  compare(new Integer(1), '1');
  compare(new Integer(123456789), '123456789');
});

test('copy constructor', async () => {
  const a = new Integer(1);
  const b = new Integer(a);
  a.add(2);
  compare(a, '3');
  compare(b, '1');
});

test('add()', async () => {
  compare(new Integer(-2).add(-1), '-3');
  compare(new Integer(-2).add(0), '-2');
  compare(new Integer(-2).add(1), '-1');
  compare(new Integer(-2).add(new Integer(-1)), '-3');
  compare(new Integer(-2).add(new Integer(0)), '-2');
  compare(new Integer(-2).add(new Integer(1)), '-1');
});

test('subtract()', async () => {
  compare(new Integer(-2).sub(-1), '-1');
  compare(new Integer(-2).sub(0), '-2');
  compare(new Integer(-2).sub(1), '-3');
  compare(new Integer(-2).sub(new Integer(-1)), '-1');
  compare(new Integer(-2).sub(new Integer(0)), '-2');
  compare(new Integer(-2).sub(new Integer(1)), '-3');
});

test('multiply()', async () => {
  compare(new Integer(3).mul(4), '12');
  compare(new Integer(3).mul(-4), '-12');
  compare(new Integer(3).mul(new Integer(4)), '12');
  compare(new Integer(3).mul(new Integer(-4)), '-12');
});

test('addmul()', async () => {
  compare(new Integer(3).addmul(4), '15');
  compare(new Integer(3).addmul(0), '3');
  compare(new Integer(3).addmul(-4), '-9');
  compare(new Integer(3).addmul(new Integer(4)), '15');
  compare(new Integer(3).addmul(new Integer(0)), '3');
  compare(new Integer(3).addmul(new Integer(-4)), '-9');
});

test('submul()', async () => {
  compare(new Integer(3).submul(4), '-9');
  compare(new Integer(3).submul(0), '3');
  compare(new Integer(3).submul(-4), '15');
  compare(new Integer(3).submul(new Integer(4)), '-9');
  compare(new Integer(3).submul(new Integer(0)), '3');
  compare(new Integer(3).submul(new Integer(-4)), '15');
});

test('neg()', async () => {
  compare(new Integer(3).neg(), '-3');
  compare(new Integer(-3).neg(), '3');
});

test('abs()', async () => {
  compare(new Integer(3).abs(), '3');
  compare(new Integer(-3).abs(), '3');
});

test('div()', async () => {
  compare(new Integer(12).div(-5), '-2');
  compare(new Integer(12).div(5), '3');
  compare(new Integer(12).div(-5, DivMode.CEIL), '-2');
  compare(new Integer(12).div(5, DivMode.CEIL), '3');
  compare(new Integer(12).div(-5, DivMode.FLOOR), '-3');
  compare(new Integer(12).div(5, DivMode.FLOOR), '2');
  compare(new Integer(12).div(-5, DivMode.TRUNCATE), '-2');
  compare(new Integer(12).div(5, DivMode.TRUNCATE), '2');

  compare(new Integer(12).div(new Integer(-5)), '-2');
  compare(new Integer(12).div(new Integer(5)), '3');
  compare(new Integer(12).div(new Integer(-5), DivMode.CEIL), '-2');
  compare(new Integer(12).div(new Integer(5), DivMode.CEIL), '3');
  compare(new Integer(12).div(new Integer(-5), DivMode.FLOOR), '-3');
  compare(new Integer(12).div(new Integer(5), DivMode.FLOOR), '2');
  compare(new Integer(12).div(new Integer(-5), DivMode.TRUNCATE), '-2');
  compare(new Integer(12).div(new Integer(5), DivMode.TRUNCATE), '2');
});

test('pow()', async () => {
  compare(new Integer(3).pow(0), '1');
  compare(new Integer(3).pow(1), '3');
  compare(new Integer(3).pow(4), '81');
  compare(new Integer(2).pow(3, 3), '2');
  compare(new Integer(2).pow(3, new Integer(3)), '2');

  compare(new Integer(3).pow(new Integer(0)), '1');
  compare(new Integer(3).pow(new Integer(1)), '3');
  compare(new Integer(3).pow(new Integer(4)), '81');
  compare(new Integer(2).pow(new Integer(3), 3), '2');
  compare(new Integer(2).pow(new Integer(3), new Integer(3)), '2');
});

test('sqrt()', async () => {
  compare(new Integer(9).sqrt(), '3');
  compare(new Integer(8).sqrt(), '2');
});

test('nthRoot()', async () => {
  compare(new Integer(9).nthRoot(1), '9');
  compare(new Integer(9).nthRoot(2), '3');
  compare(new Integer(8).nthRoot(2), '2');
  compare(new Integer(32).nthRoot(5), '2');
});

test('factorial()', async () => {
  compare(new Integer(3).factorial(), '6');
  compare(new Integer(4).factorial(), '24');
});

test('doubleFactorial()', async () => {
  compare(new Integer(3).doubleFactorial(), '3');
  compare(new Integer(4).doubleFactorial(), '8');
});

test('isPrime()', async () => {
  expect(new Integer(9).isPrime()).toBe(false);
  expect(new Integer(50).isPrime()).toBe(false);
  // expect(new Integer('1795265022').isPrime(2)).toBe(true);
  expect(new Integer(53).isPrime()).toBe(true);
});

test('nextPrime()', async () => {
  compare(new Integer(9).nextPrime(), '11');
  compare(new Integer(11).nextPrime(), '13');
});

test('gcd()', async () => {
  compare(new Integer(6).gcd(15), '3');
  compare(new Integer(11).gcd(12), '1');
  compare(new Integer(6).gcd(new Integer(15)), '3');
});

test('lcm()', async () => {
  compare(new Integer(6).lcm(15), '30');
  compare(new Integer(11).lcm(12), '132');
  compare(new Integer(6).lcm(new Integer(15)), '30');
});

test('and()', async () => {
  compare(new Integer(0b1100).and(0b1010), '8');
  compare(new Integer(0b1100).and(new Integer(0b1010)), '8');
});

test('or()', async () => {
  compare(new Integer(0b1100).or(0b1010), '14');
  compare(new Integer(0b1100).or(new Integer(0b1010)), '14');
});

test('xor()', async () => {
  compare(new Integer(0b1100).xor(0b1010), '6');
  compare(new Integer(0b1100).xor(new Integer(0b1010)), '6');
});

test('shiftLeft()', async () => {
  compare(new Integer(0b1100).shiftLeft(2), '48');
});

test('shiftRight()', async () => {
  compare(new Integer(0b1100).shiftRight(2), '3');
});

test('isEqual()', async () => {
  expect(new Integer('2').isEqual(2)).toBe(true);
  expect(new Integer('2').isEqual(-2)).toBe(false);
  expect(new Integer('2').isEqual(new Integer(2))).toBe(true);
  expect(new Integer('2').isEqual(new Integer(-2))).toBe(false);
});

test('lessThan()', async () => {
  expect(new Integer('2').lessThan(3)).toBe(true);
  expect(new Integer('2').lessThan(2)).toBe(false);
  expect(new Integer('2').lessThan(-2)).toBe(false);
  expect(new Integer('2').lessThan(new Integer(3))).toBe(true);
  expect(new Integer('2').lessThan(new Integer(2))).toBe(false);
  expect(new Integer('2').lessThan(new Integer(-2))).toBe(false);
});

test('greaterThan()', async () => {
  expect(new Integer('2').greaterThan(3)).toBe(false);
  expect(new Integer('2').greaterThan(2)).toBe(false);
  expect(new Integer('2').greaterThan(-2)).toBe(true);
  expect(new Integer('2').greaterThan(new Integer(3))).toBe(false);
  expect(new Integer('2').greaterThan(new Integer(2))).toBe(false);
  expect(new Integer('2').greaterThan(new Integer(-2))).toBe(true);
});

test('sign()', async () => {
  expect(new Integer('2').sign()).toBe(1);
  expect(new Integer('0').sign()).toBe(0);
  expect(new Integer('-2').sign()).toBe(-1);
});

test('toNumber()', async () => {
  expect(new Integer('2').toNumber()).toBe(2);
  expect(new Integer('-2').toNumber()).toBe(-2);
  expect(new Integer('999 999 999 999').toNumber()).toBe(999999999999);
});
