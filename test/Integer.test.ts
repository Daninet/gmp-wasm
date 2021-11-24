import { DivMode } from '../src/integer';
import { CalculateTypeWithDestroy, FloatType, init as initGMP, IntegerType, RationalType } from '../src';
/* global test, expect */

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
let gmp: Awaited<ReturnType<typeof initGMP>> = null;
let ctx: CalculateTypeWithDestroy = null;

beforeAll(async () => {
  gmp = await initGMP();
  ctx = gmp.getContext();
});

afterAll(() => {
  ctx.destroy();
});

const compare = (int: IntegerType | RationalType | FloatType, res: string, radix = 10) => {
  expect(int.toString(radix)).toBe(res);
}

test('parse strings', () => {
  compare(ctx.Integer('-1'), '-1');
  compare(ctx.Integer('0'), '0');
  compare(ctx.Integer('1'), '1');
  compare(ctx.Integer('123456789'), '123456789');
  compare(ctx.Integer('123 456789123 456789'), '123456789123456789');
  compare(ctx.Integer('-123 456789123 456789'), '-123456789123456789');
  compare(ctx.Integer('110', 2), '6');
  compare(ctx.Integer('1a', 16), '26');
  compare(ctx.Integer('-1A', 16), '-26');
});

test('parse numbers', () => {
  compare(ctx.Integer(-1), '-1');
  compare(ctx.Integer(0), '0');
  compare(ctx.Integer(1), '1');
  compare(ctx.Integer(123456789), '123456789');
});

test('copy constructor', () => {
  const a = ctx.Integer(1);
  const b = ctx.Integer(a);
  const c = a.add(2);
  compare(a, '1');
  compare(b, '1');
  compare(c, '3');
});

test('add()', () => {
  compare(ctx.Integer(-2).add(-1), '-3');
  compare(ctx.Integer(-2).add(0), '-2');
  compare(ctx.Integer(-2).add(1), '-1');
  compare(ctx.Integer(-2).add(ctx.Integer(-1)), '-3');
  compare(ctx.Integer(-2).add(ctx.Integer(0)), '-2');
  compare(ctx.Integer(-2).add(ctx.Integer(1)), '-1');
  compare(ctx.Integer(-2).add(ctx.Rational(-1, 2)), '-5/2');
  compare(ctx.Integer(-2).add(ctx.Rational(1, 2)), '-3/2');
  compare(ctx.Integer(-2).add(ctx.Float('-0.5')), '-2.5');
  compare(ctx.Integer(-2).add(ctx.Float('0.5')), '-1.5');
});

test('subtract()', () => {
  compare(ctx.Integer(-2).sub(-1), '-1');
  compare(ctx.Integer(-2).sub(0), '-2');
  compare(ctx.Integer(-2).sub(1), '-3');
  compare(ctx.Integer(-2).sub(ctx.Integer(-1)), '-1');
  compare(ctx.Integer(-2).sub(ctx.Integer(0)), '-2');
  compare(ctx.Integer(-2).sub(ctx.Integer(1)), '-3');
  compare(ctx.Integer(-2).sub(ctx.Rational(-1, 2)), '-3/2');
  compare(ctx.Integer(-2).sub(ctx.Rational(1, 2)), '-5/2');
  compare(ctx.Integer(-2).sub(ctx.Float('-0.5')), '-1.5');
  compare(ctx.Integer(-2).sub(ctx.Float('0.5')), '-2.5');
});

test('multiply()', () => {
  compare(ctx.Integer(3).mul(4), '12');
  compare(ctx.Integer(3).mul(-4), '-12');
  compare(ctx.Integer(3).mul(ctx.Integer(4)), '12');
  compare(ctx.Integer(3).mul(ctx.Integer(-4)), '-12');
  compare(ctx.Integer(3).mul(ctx.Rational(-1, 2)), '-3/2');
  compare(ctx.Integer(3).mul(ctx.Rational(1, 2)), '3/2');
  compare(ctx.Integer(3).mul(ctx.Float('-0.5')), '-1.5');
  compare(ctx.Integer(3).mul(ctx.Float('0.5')), '1.5');
});

test('neg()', () => {
  compare(ctx.Integer(3).neg(), '-3');
  compare(ctx.Integer(-3).neg(), '3');
});

test('abs()', () => {
  compare(ctx.Integer(3).abs(), '3');
  compare(ctx.Integer(-3).abs(), '3');
});

test('div()', () => {
  compare(ctx.Integer(12).div(-5), '-2');
  compare(ctx.Integer(12).div(5), '3');
  compare(ctx.Integer(12).div(-5, DivMode.CEIL), '-2');
  compare(ctx.Integer(12).div(5, DivMode.CEIL), '3');
  compare(ctx.Integer(12).div(-5, DivMode.FLOOR), '-3');
  compare(ctx.Integer(12).div(5, DivMode.FLOOR), '2');
  compare(ctx.Integer(12).div(-5, DivMode.TRUNCATE), '-2');
  compare(ctx.Integer(12).div(5, DivMode.TRUNCATE), '2');

  compare(ctx.Integer(12).div(ctx.Integer(-5)), '-2');
  compare(ctx.Integer(12).div(ctx.Integer(5)), '3');
  compare(ctx.Integer(12).div(ctx.Integer(-5), DivMode.CEIL), '-2');
  compare(ctx.Integer(12).div(ctx.Integer(5), DivMode.CEIL), '3');
  compare(ctx.Integer(12).div(ctx.Integer(-5), DivMode.FLOOR), '-3');
  compare(ctx.Integer(12).div(ctx.Integer(5), DivMode.FLOOR), '2');
  compare(ctx.Integer(12).div(ctx.Integer(-5), DivMode.TRUNCATE), '-2');
  compare(ctx.Integer(12).div(ctx.Integer(5), DivMode.TRUNCATE), '2');

  compare(ctx.Integer(12).div(ctx.Rational(-5, 3)), '-36/5');
  compare(ctx.Integer(12).div(ctx.Rational(5, 3)), '36/5');

  compare(ctx.Integer(12).div(ctx.Float('-0.5')), '-24');
  compare(ctx.Integer(12).div(ctx.Float('0.5')), '24');
});

test('pow()', () => {
  compare(ctx.Integer(3).pow(0), '1');
  compare(ctx.Integer(3).pow(1), '3');
  compare(ctx.Integer(3).pow(4), '81');
  compare(ctx.Integer(2).pow(3, 3), '2');
  compare(ctx.Integer(2).pow(3, ctx.Integer(3)), '2');

  compare(ctx.Integer(3).pow(ctx.Integer(0)), '1');
  compare(ctx.Integer(3).pow(ctx.Integer(1)), '3');
  compare(ctx.Integer(3).pow(ctx.Integer(4)), '81');
  compare(ctx.Integer(2).pow(ctx.Integer(3), 3), '2');
  compare(ctx.Integer(2).pow(ctx.Integer(3), ctx.Integer(3)), '2');

  compare(ctx.Integer(3).pow(ctx.Rational(4, 1)), '81');
  compare(ctx.Integer(3).pow(ctx.Rational(4, 2)), '9');
  compare(ctx.Integer(3).pow(ctx.Rational(4, 3)), '4');
});

test('sqrt()', () => {
  compare(ctx.Integer(9).sqrt(), '3');
  compare(ctx.Integer(8).sqrt(), '2');
});

test('nthRoot()', () => {
  compare(ctx.Integer(9).nthRoot(1), '9');
  compare(ctx.Integer(9).nthRoot(2), '3');
  compare(ctx.Integer(8).nthRoot(2), '2');
  compare(ctx.Integer(32).nthRoot(5), '2');
});

test('factorial()', () => {
  compare(ctx.Integer(3).factorial(), '6');
  compare(ctx.Integer(4).factorial(), '24');
});

test('doubleFactorial()', () => {
  compare(ctx.Integer(3).doubleFactorial(), '3');
  compare(ctx.Integer(4).doubleFactorial(), '8');
});

test('isPrime()', () => {
  expect(ctx.Integer(9).isPrime()).toBe(false);
  expect(ctx.Integer(50).isPrime()).toBe(false);
  // expect(ctx.Integer('1795265022').isPrime(2)).toBe(true);
  expect(ctx.Integer(53).isPrime()).toBe(true);
});

test('nextPrime()', () => {
  compare(ctx.Integer(9).nextPrime(), '11');
  compare(ctx.Integer(11).nextPrime(), '13');
});

test('gcd()', () => {
  compare(ctx.Integer(6).gcd(15), '3');
  compare(ctx.Integer(11).gcd(12), '1');
  compare(ctx.Integer(6).gcd(ctx.Integer(15)), '3');
});

test('lcm()', () => {
  compare(ctx.Integer(6).lcm(15), '30');
  compare(ctx.Integer(11).lcm(12), '132');
  compare(ctx.Integer(6).lcm(ctx.Integer(15)), '30');
});

test('complement1()', () => {
  compare(ctx.Integer(24).complement1(), '-25');
  compare(ctx.Integer(5).complement1(), '-6');
  compare(ctx.Integer('-6').complement1(), '5');
});

test('complement2()', () => {
  compare(ctx.Integer(2).complement2(), '-2');
  compare(ctx.Integer(5).complement2(), '-5');
  compare(ctx.Integer('-6').complement2(), '6');
});

test('and()', () => {
  compare(ctx.Integer(0b1100).and(0b1010), '8');
  compare(ctx.Integer(0b1100).and(ctx.Integer(0b1010)), '8');
});

test('or()', () => {
  compare(ctx.Integer(0b1100).or(0b1010), '14');
  compare(ctx.Integer(0b1100).or(ctx.Integer(0b1010)), '14');
});

test('xor()', () => {
  compare(ctx.Integer(0b1100).xor(0b1010), '6');
  compare(ctx.Integer(0b1100).xor(ctx.Integer(0b1010)), '6');
});

test('shiftLeft()', () => {
  compare(ctx.Integer(0b1100).shiftLeft(2), '48');
});

test('shiftRight()', () => {
  compare(ctx.Integer(0b1100).shiftRight(2), '3');
});

test('setBit()', () => {
  compare(ctx.Integer(8).setBit(0), '9');
  compare(ctx.Integer(8).setBit(1), '10');
  compare(ctx.Integer(8).setBit(3), '8');
  compare(ctx.Integer(8).setBit(4), '24');
});

test('setBits()', () => {
  compare(ctx.Integer(8).setBits([]), '8');
  compare(ctx.Integer(8).setBits([0, 1, 3]), '11');
});

test('clearBit()', () => {
  compare(ctx.Integer(15).clearBit(0), '14');
  compare(ctx.Integer(15).clearBit(1), '13');
  compare(ctx.Integer(15).clearBit(3), '7');
  compare(ctx.Integer(15).clearBit(4), '15');
});

test('clearBits()', () => {
  compare(ctx.Integer(15).clearBits([]), '15');
  compare(ctx.Integer(15).clearBits([0, 1, 3]), '4');
});

test('flipBit()', () => {
  compare(ctx.Integer(12).flipBit(0), '13');
  compare(ctx.Integer(12).flipBit(1), '14');
  compare(ctx.Integer(12).flipBit(3), '4');
  compare(ctx.Integer(12).flipBit(4), '28');
});

test('flipBits()', () => {
  compare(ctx.Integer(12).flipBits([]), '12');
  compare(ctx.Integer(12).flipBits([0, 1, 3]), '7');
});

test('getBit()', () => {
  expect(ctx.Integer(0b1101).getBit(0)).toBe(1);
  expect(ctx.Integer(0b1101).getBit(1)).toBe(0);
  expect(ctx.Integer(0b1101).getBit(2)).toBe(1);
  expect(ctx.Integer(0b1101).getBit(10)).toBe(0);
});

test('msbPosition()', () => {
  expect(ctx.Integer(0).msbPosition()).toBe(0);
  expect(ctx.Integer(0b1).msbPosition()).toBe(0);
  expect(ctx.Integer(0b101).msbPosition()).toBe(2);
});

test('sliceBits()', () => {
  compare(ctx.Integer(0b111001000).sliceBits(), (0b111001000).toString());
  compare(ctx.Integer(0b111001000).sliceBits(0), (0b111001000).toString());
  compare(ctx.Integer(0b111001000).sliceBits(1), (0b11100100).toString());
  compare(ctx.Integer(0b111001000).sliceBits(3), (0b111001).toString());
  compare(ctx.Integer(0b111001000).sliceBits(10), '0');
  compare(ctx.Integer(0b111001000).sliceBits(-1), '1');
  compare(ctx.Integer(0b111001000).sliceBits(-5), (0b11100).toString());
  compare(ctx.Integer(0b111001000).sliceBits(-10), (0b111001000).toString());
  compare(ctx.Integer(0b1111).sliceBits(0, 0), '0');
  compare(ctx.Integer(0b1111).sliceBits(1, 1), '0');
  compare(ctx.Integer(0b1110).sliceBits(0, 0), '0');
  compare(ctx.Integer(0b1110).sliceBits(0, 1), '0');
  compare(ctx.Integer(0b1110).sliceBits(0, 2), '2');
  compare(ctx.Integer(0b1110).sliceBits(0, 3), '6');
  compare(ctx.Integer(0b1110).sliceBits(0, -1), '6');
  compare(ctx.Integer(0b1110).sliceBits(0, -2), '2');
  compare(ctx.Integer(0b1110).sliceBits(0, -10), '0');
  compare(ctx.Integer(0b111001000).sliceBits(3, 7), '9');
  compare(ctx.Integer(0b111001000).sliceBits(3, 8), '25');
});

test('writeTo()', () => {
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0)), '110100', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b10)), '110110', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b10), 1), '110100', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b10), 2), '111000', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b10), 3), '110100', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b10), 4), '100100', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b10), 5), '1010100', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b10), 6), '10110100', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b101), 0, 0), '110100', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b101), 0, 1), '110101', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b101), 0, 5), '100101', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b101), 0, 6), '101', 2);
  compare(ctx.Integer(0b110100).writeTo(ctx.Integer(0b101), 4, 2), '10100', 2);
  compare(ctx.Integer(0x12345678).writeTo(ctx.Integer(0xFF)), '123456ff', 16);
  compare(ctx.Integer(0x12345678).writeTo(ctx.Integer(0xFF), 12), '123ff678', 16);
  compare(ctx.Integer(0x12345678).writeTo(ctx.Integer(0xFF), 12, 4), '1234f678', 16);
  compare(ctx.Integer(0x12345678).writeTo(ctx.Integer(0xFF), 12, 16), '100ff678', 16);
});

test('isEqual()', () => {
  expect(ctx.Integer('2').isEqual(2)).toBe(true);
  expect(ctx.Integer('2').isEqual(-2)).toBe(false);
  expect(ctx.Integer('2').isEqual(ctx.Integer(2))).toBe(true);
  expect(ctx.Integer('2').isEqual(ctx.Integer(-2))).toBe(false);
  expect(ctx.Integer('2').isEqual(ctx.Rational(4, 2))).toBe(true);
  expect(ctx.Integer('2').isEqual(ctx.Rational(-3, 2))).toBe(false);
  expect(ctx.Integer('2').isEqual(ctx.Float('2'))).toBe(true);
  expect(ctx.Integer('2').isEqual(ctx.Float('2.01'))).toBe(false);
});

test('lessThan()', () => {
  expect(ctx.Integer('2').lessThan(3)).toBe(true);
  expect(ctx.Integer('2').lessThan(2)).toBe(false);
  expect(ctx.Integer('2').lessThan(-2)).toBe(false);
  expect(ctx.Integer('2').lessThan(ctx.Integer(3))).toBe(true);
  expect(ctx.Integer('2').lessThan(ctx.Integer(2))).toBe(false);
  expect(ctx.Integer('2').lessThan(ctx.Integer(-2))).toBe(false);
  expect(ctx.Integer('2').lessThan(ctx.Rational(5, 2))).toBe(true);
  expect(ctx.Integer('2').lessThan(ctx.Rational(4, 2))).toBe(false);
  expect(ctx.Integer('2').lessThan(ctx.Rational(-3, 2))).toBe(false);
  expect(ctx.Integer('2').lessThan(ctx.Float('2.01'))).toBe(true);
  expect(ctx.Integer('2').lessThan(ctx.Float('2.0'))).toBe(false);
  expect(ctx.Integer('2').lessThan(ctx.Float('1.99'))).toBe(false);
});

test('lessOrEqual()', () => {
  expect(ctx.Integer('2').lessOrEqual(3)).toBe(true);
  expect(ctx.Integer('2').lessOrEqual(2)).toBe(true);
  expect(ctx.Integer('2').lessOrEqual(-2)).toBe(false);
  expect(ctx.Integer('2').lessOrEqual(ctx.Integer(3))).toBe(true);
  expect(ctx.Integer('2').lessOrEqual(ctx.Integer(2))).toBe(true);
  expect(ctx.Integer('2').lessOrEqual(ctx.Integer(-2))).toBe(false);
  expect(ctx.Integer('2').lessOrEqual(ctx.Rational(5, 2))).toBe(true);
  expect(ctx.Integer('2').lessOrEqual(ctx.Rational(4, 2))).toBe(true);
  expect(ctx.Integer('2').lessOrEqual(ctx.Rational(-4, 2))).toBe(false);
  expect(ctx.Integer('2').lessOrEqual(ctx.Float('2.01'))).toBe(true);
  expect(ctx.Integer('2').lessOrEqual(ctx.Float('2.0'))).toBe(true);
  expect(ctx.Integer('2').lessOrEqual(ctx.Float('1.99'))).toBe(false);
});

test('greaterThan()', () => {
  expect(ctx.Integer('2').greaterThan(3)).toBe(false);
  expect(ctx.Integer('2').greaterThan(2)).toBe(false);
  expect(ctx.Integer('2').greaterThan(-2)).toBe(true);
  expect(ctx.Integer('2').greaterThan(ctx.Integer(3))).toBe(false);
  expect(ctx.Integer('2').greaterThan(ctx.Integer(2))).toBe(false);
  expect(ctx.Integer('2').greaterThan(ctx.Integer(-2))).toBe(true);
  expect(ctx.Integer('2').greaterThan(ctx.Rational(5, 2))).toBe(false);
  expect(ctx.Integer('2').greaterThan(ctx.Rational(4, 2))).toBe(false);
  expect(ctx.Integer('2').greaterThan(ctx.Rational(-4, 2))).toBe(true);
  expect(ctx.Integer('2').greaterThan(ctx.Float('2.01'))).toBe(false);
  expect(ctx.Integer('2').greaterThan(ctx.Float('2.0'))).toBe(false);
  expect(ctx.Integer('2').greaterThan(ctx.Float('1.99'))).toBe(true);
});

test('greaterOrEqual()', () => {
  expect(ctx.Integer('2').greaterOrEqual(3)).toBe(false);
  expect(ctx.Integer('2').greaterOrEqual(2)).toBe(true);
  expect(ctx.Integer('2').greaterOrEqual(-2)).toBe(true);
  expect(ctx.Integer('2').greaterOrEqual(ctx.Integer(3))).toBe(false);
  expect(ctx.Integer('2').greaterOrEqual(ctx.Integer(2))).toBe(true);
  expect(ctx.Integer('2').greaterOrEqual(ctx.Integer(-2))).toBe(true);
  expect(ctx.Integer('2').greaterOrEqual(ctx.Rational(5, 2))).toBe(false);
  expect(ctx.Integer('2').greaterOrEqual(ctx.Rational(4, 2))).toBe(true);
  expect(ctx.Integer('2').greaterOrEqual(ctx.Rational(-4, 2))).toBe(true);
  expect(ctx.Integer('2').greaterOrEqual(ctx.Float('2.01'))).toBe(false);
  expect(ctx.Integer('2').greaterOrEqual(ctx.Float('2.0'))).toBe(true);
  expect(ctx.Integer('2').greaterOrEqual(ctx.Float('1.99'))).toBe(true);
});

test('sign()', () => {
  expect(ctx.Integer('2').sign()).toBe(1);
  expect(ctx.Integer('0').sign()).toBe(0);
  expect(ctx.Integer('-2').sign()).toBe(-1);
});

test('toNumber()', () => {
  expect(ctx.Integer('2').toNumber()).toBe(2);
  expect(ctx.Integer('-2').toNumber()).toBe(-2);
  expect(ctx.Integer('999 999 999 999').toNumber()).toBe(999999999999);
});

test('toBuffer()', () => {
  expect(ctx.Integer('0').toBuffer()).toStrictEqual(new Uint8Array([]));
  expect(ctx.Integer('1').toBuffer()).toStrictEqual(new Uint8Array([1]));
  expect(ctx.Integer('-1').toBuffer()).toStrictEqual(new Uint8Array([1]));
  expect(ctx.Integer('256').toBuffer()).toStrictEqual(new Uint8Array([1, 0]));
  expect(ctx.Integer('256').toBuffer(true)).toStrictEqual(new Uint8Array([0, 1]));
  expect(ctx.Integer('1234567').toBuffer()).toStrictEqual(new Uint8Array([0b10010, 0b11010110, 0b10000111]));
  expect(ctx.Integer('1234567').toBuffer(true)).toStrictEqual(new Uint8Array([0b10000111, 0b11010110, 0b10010]));
});

test('init from Uint8Array', () => {
  compare(ctx.Integer(ctx.Integer('0').toBuffer()), '0');
  compare(ctx.Integer(ctx.Integer('1').toBuffer()), '1');
  compare(ctx.Integer(ctx.Integer('-1').toBuffer()), '1');
  compare(ctx.Integer(ctx.Integer('1234567').toBuffer()), '1234567');
});

test('toString()', () => {
  expect(ctx.Integer('2').toString()).toBe('2');
  expect(ctx.Integer('-2').toString()).toBe('-2');
  expect(ctx.Integer('999 999 999 999').toString()).toBe('999999999999');
  expect(ctx.Integer(0b1101100).toString(2)).toBe('1101100');
  expect(ctx.Integer(-0b1101100).toString(2)).toBe('-1101100');
  expect(ctx.Integer(0b1101100).toString(16)).toBe('6c');
  expect(ctx.Integer(-0b1101100).toString(16)).toBe('-6c');
});
