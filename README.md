# GMP-WASM
WebAssembly bindings for the [GMP](https://gmplib.org/) and [MPFR](https://www.mpfr.org/) libraries.

It provides arbitrary-precision Integer, Rational and Float types.

## Features

- Provides arbitrary-precision Integer, Rational and Float types
- Has a lot more features, and in some cases, it's faster than the built-in **BigInt** type
- Includes an easy-to-use JavaScript wrapper, but native functions are also exposed
- Supports all modern browsers, web workers, Node.js and Deno
- The WASM binary is bundled as a compressed base64 string (no problems with linking)
- Works even without Webpack or other bundlers
- Includes TypeScript type definitions
- Zero dependencies
- 100% open source & [transparent build process](https://github.com/Daninet/gmp-wasm/actions)

## Performance

In some cases this library can provide better performance than the built-in BigInt type.


## Advanced usage

If you want more control and performance you can use the original GMP / MPFR functions.

```js
const { getGMP } = require('gmp-wasm');

getGMP().then(({ binding }) => {
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
  binding.mpz_clear(num1Ptr);
  binding.mpz_clear(num2Ptr);
  binding.mpz_t_free(num1Ptr);
  binding.mpz_t_free(num2Ptr);
});
```

Sometimes, it's easier and faster to deallocate everything by reinitializing the WASM bindings:
```js
// Deallocate all memory objects created by gmp-wasm
await binding.reset();
```
