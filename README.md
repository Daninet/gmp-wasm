# GMP-WASM

[![npm package](https://img.shields.io/npm/v/gmp-wasm.svg)](http://npmjs.org/package/gmp-wasm)
[![Bundle size](https://badgen.net/bundlephobia/minzip/gmp-wasm)](https://bundlephobia.com/result?p=gmp-wasm)
[![codecov](https://codecov.io/gh/Daninet/gmp-wasm/branch/master/graph/badge.svg)](https://codecov.io/gh/Daninet/gmp-wasm)
[![Build status](https://github.com/Daninet/gmp-wasm/workflows/Build%20&%20publish/badge.svg?branch=master)](https://github.com/Daninet/gmp-wasm/actions)
[![JSDelivr downloads](https://data.jsdelivr.com/v1/package/npm/gmp-wasm/badge)](https://www.jsdelivr.com/package/npm/gmp-wasm)

Arbitrary-precision **Integer**, **Rational** and **Float** types based on the [GMP](https://gmplib.org/) and [MPFR](https://www.mpfr.org/) libraries.

## Features

- Provides arbitrary-precision Integer, Rational and Float types
- Has a lot more features, and in some cases, [it's faster](#performance) than the built-in **BigInt** type
- Includes an easy-to-use, high-level wrapper, but low-level functions are also exposed
- Supports all modern browsers, web workers, Node.js and Deno
- The WASM binary is bundled as a compressed base64 string (no problems with linking)
- Works even without Webpack or other bundlers
- Includes TypeScript type definitions
- Zero dependencies
- 100% open source & [transparent build process](https://github.com/Daninet/gmp-wasm/actions)

## Installation

```
npm i gmp-wasm
```

It can also be used directly from HTML (via [jsDelivr](https://www.jsdelivr.com/package/npm/gmp-wasm)):

```html
<!-- loads the library into the global `gmp` variable -->
<script src="https://cdn.jsdelivr.net/npm/gmp-wasm"></script>
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

## Constants

- gmp.Pi
- gmp.EulerConstant
- gmp.EulerNumber
- gmp.Log2
- gmp.Catalan

## Advanced usage

If you want more control and performance you can use the original GMP / MPFR functions.

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

Calculating 8000 digits of Pi using the following [formula](http://ajennings.net/blog/a-million-digits-of-pi-in-9-lines-of-javascript.html):

```
PI = 3
  + 3 * (1/2) * (1/3) * (1/4)
  + 3 * ((1 * 3)/(2 * 4)) * (1/5) * (1 / (4^2))
  + 3 * ((1 * 3 * 5) / (2 * 4 * 6)) * (1/7) * (1 / (4^3))
  + ...
```

| Test                         | Avg. time   | Speedup      | Notes                                                                               |
|------------------------------|-------------|--------------|-------------------------------------------------------------------------------------|
| JS_BigInt_Series             | 130.20 ms   | 1x           | With JS built-in `BigInt` type                                                        |
| GMP_BigInt_Series            | 87.90 ms    | 1.48x        | **gmp-wasm** `Integer()` high-level wrapper                                           |
| GMP_DelayGC_BigInt_Series    | 78.88 ms    | 1.65x        | Same as previous with delayed memory deallocation                                   |
| GMP_LowLevel_BigInt_Series   | 53.93 ms    | 2.41x        | **gmp-wasm** `MPZ` low-level functions                                              |
| DecimalJs_BigInt_Series      | 426.99 ms   | 0.30x        | [decimal.js](https://www.npmjs.com/package/decimal.js) 10.3.1 with integer division |
| BigInteger_Series            | 129.98 ms   | 1x           | [big-integer](https://www.npmjs.com/package/big-integer) 1.6.51 |
| ---------------------------- | --------    | --------     | ---------------                                                               |
| GMP_Float_Series             | 198.31 ms   | 0.66x        | **gmp-wasm** `Float()` high-level wrapper                                             |
| GMP_DelayGC_Float_Series     | 191.94 ms   | 0.68x        | Same as previous with delayed memory deallocation                                   |
| GMP_LowLevel_Float_Series    | 135.49 ms   | 0.96x        | **gmp-wasm** `MPFR` low-level functions                                             |
| DecimalJs_Float_Series       | 764.15 ms   | 0.17x        | [decimal.js](https://www.npmjs.com/package/decimal.js) 10.3.1 with float division   |
| ---------------------------- | --------    | --------     | ---------------                                                               |
| GMP_Atan_1                   | 0.65 ms     | 200.31x      | **gmp-wasm** `Float(1).atan().mul(4)`                                               |
| GMP_Asin_1over2              | 17.21 ms    | 7.57x        | **gmp-wasm** `Float('0.5').asin().mul(6)`                                           |


\* These measurements were made with `Node.js v16.13` on an Intel Kaby Lake desktop CPU. Source code is [here](https://github.com/Daninet/gmp-wasm/blob/master/benchmark/calcpi.js).
