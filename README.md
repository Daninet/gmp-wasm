# GMP-WASM

[![npm package](https://img.shields.io/npm/v/gmp-wasm.svg)](http://npmjs.org/package/gmp-wasm)
[![codecov](https://codecov.io/gh/Daninet/gmp-wasm/branch/master/graph/badge.svg)](https://codecov.io/gh/Daninet/gmp-wasm)
[![Build status](https://github.com/Daninet/gmp-wasm/workflows/Build/badge.svg?branch=master)](https://github.com/Daninet/gmp-wasm/actions)
[![JSDelivr downloads](https://data.jsdelivr.com/v1/package/npm/gmp-wasm/badge)](https://www.jsdelivr.com/package/npm/gmp-wasm)

Arbitrary-precision **Integer**, **Rational** and **Float** types based on the [GMP](https://gmplib.org/) and [MPFR](https://www.mpfr.org/) libraries.

## Features

- Supports all modern browsers, web workers, Node.js and Deno
- Includes an easy-to-use, high-level wrapper, but low-level functions are also exposed
- Has a lot more features, and in some cases, [it's faster](#performance) than the built-in **BigInt** type
- The WASM binary is bundled as a compressed base64 string (no problems with linking)
- Works even without Webpack or other bundlers
- Includes TypeScript type definitions, check API [here](https://daninet.github.io/gmp-wasm).
- Zero dependencies
- Full minified and gzipped bundle has a size of ![Bundle size](https://img.badgesize.io/Daninet/gmp-wasm/binaries/index.umd.min.js?compression=gzip&label=minzipped%20size)
- It also packages a mini bundle without Float/MPFR operations ![Bundle size](https://img.badgesize.io/Daninet/gmp-wasm/binaries/mini.umd.min.js?compression=gzip&label=minzipped%20size)
- 100% open source & [transparent build process](https://github.com/Daninet/gmp-wasm/actions)

## Installation

```
npm i gmp-wasm
```

It can also be used directly from HTML (via [jsDelivr](https://www.jsdelivr.com/package/npm/gmp-wasm)):

```html
<!-- loads the full, minified library into the global `gmp` variable -->
<script src="https://cdn.jsdelivr.net/npm/gmp-wasm"></script>

<!-- or loads the non-minified library -->
<script src="https://cdn.jsdelivr.net/npm/gmp-wasm/dist/index.umd.js"></script>

<!-- or loads the minified library without Float/MPFR functions -->
<script src="https://cdn.jsdelivr.net/npm/gmp-wasm/dist/mini.umd.min.js"></script>
```

## Usage

**gmp-wasm** also provides a high-level wrapper over the GMP functions. There are three major components:
- `g.Integer()` - Wraps integers (*MPZ*)
- `g.Rational()` - Wraps rational numbers (*MPQ*)
- `g.Float()` - Wraps floating-point numbers (*MPFR*)

```js
const gmp = require('gmp-wasm');

gmp.init().then(({ calculate }) => {
  // calculate() automatically deallocates all objects created within the callback function
  const result = calculate((g) => {
    const six = g.Float(1).add(5);
    return g.Pi().div(six).sin(); // sin(Pi/6) = 0.5
  });
  console.log(result);
});
```

It is also possible to delay deallocation through the `getContext()` API:

```js
const gmp = require('gmp-wasm');

gmp.init().then(({ getContext }) => {
  const ctx = getContext();
  let x = ctx.Integer(1);
  for (let i = 2; i < 16; i++) {
    x = x.add(i);
  }
  console.log(x.toString());
  setTimeout(() => ctx.destroy(), 50);
});
```

The precision and the rounding modes can be set by passing a parameter to the context or to the Float constructor.

```js
const roundingMode = gmp.FloatRoundingMode.ROUND_DOWN;
const options = { precisionBits: 10, roundingMode };

const result = calculate(g => g.Float(1).div(3), options);
// or
const result2 = calculate(g => g.Float(1, options).div(3));
// or
const ctx = getContext(options);
const result3 = ctx.Float(1).div(3).toString();
```

## Predefined constants

- Pi
- EulerConstant
- EulerNumber
- Log2
- Catalan

## Advanced usage

High-level wrapper can be combined with low-level functions:

```js
const sum = calculate((g) => {
  const a = g.Float(1);
  const b = g.Float(2);
  const c = g.Float(0);
  // c = a + b
  binding.mpfr_add(c.mpfr_t, a.mpfr_t, b.mpfr_t, 0);
  return c;
});
```

If you want more control and performance you can use the original GMP / MPFR functions even without high-level wrappers.

```js
const gmp = require('gmp-wasm');

gmp.init().then(({ binding }) => {
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
  console.log(binding.mpz_get_si(num1Ptr));
  // Deallocate memory
  binding.free(strPtr);
  binding.mpz_clears(num1Ptr, num2Ptr);
  binding.mpz_t_frees(num1Ptr, num2Ptr);
});
```

Sometimes, it's easier and faster to deallocate everything by reinitializing the WASM bindings:
```js
// Deallocate all memory objects created by gmp-wasm
await binding.reset();
```

## Performance

In some cases, this library can provide better performance than the built-in *BigInt* type.

For example, calculating 8000 digits of Pi using the following [formula](http://ajennings.net/blog/a-million-digits-of-pi-in-9-lines-of-javascript.html) provides better results:

```
PI = 3
  + 3 * (1/2) * (1/3) * (1/4)
  + 3 * ((1 * 3)/(2 * 4)) * (1/5) * (1 / (4^2))
  + 3 * ((1 * 3 * 5) / (2 * 4 * 6)) * (1/7) * (1 / (4^3))
  + ...
```

| Test                                                                                | Avg. time | Speedup  |
| ----------------------------------------------------------------------------------- | --------- | -------- |
| With JS built-in `BigInt` type                                                      | 129 ms    | 1x       |
| **gmp-wasm** `Integer()` high-level wrapper                                         | 88 ms     | 1.47x    |
| Same as previous with delayed memory deallocation                                   | 78 ms     | 1.65x    |
| **gmp-wasm** `MPZ` low-level functions                                              | 53 ms     | 2.43x    |
| [decimal.js](https://www.npmjs.com/package/decimal.js) 10.3.1 with integer division | 443 ms    | 0.29x    |
| [big-integer](https://www.npmjs.com/package/big-integer) 1.6.51                     | 129 ms    | 1x       |
| ----------------------------                                                        | --------  | -------- |
| **gmp-wasm** `Float()` high-level wrapper                                           | 175 ms    | 0.74x    |
| Same as previous with delayed memory deallocation                                   | 169 ms    | 0.76x    |
| **gmp-wasm** `MPFR` low-level functions                                             | 118 ms    | 1.09x    |
| [decimal.js](https://www.npmjs.com/package/decimal.js) 10.3.1 with float division   | 785 ms    | 0.16x    |
| ----------------------------                                                        | --------  | -------- |
| **gmp-wasm** `Float(1).atan().mul(4)`                                               | 0.6 ms    | 215x     |
| **gmp-wasm** `Float('0.5').asin().mul(6)`                                           | 17 ms     | 7.59x    |


\* These measurements were made with `Node.js v16.14` on an Intel Kaby Lake desktop CPU. Source code is [here](https://github.com/Daninet/gmp-wasm/blob/master/benchmark/calcpi.js).
