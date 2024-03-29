const mpzjs = require('mpzjs');
const { init: initGMP } = require('../dist/mini.umd.js');
// const { init: initGMP } = require('gmp-wasm');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const RUNS = 1000;
const num = '912789'.repeat(5000);

initGMP().then(async ({ binding }) => {
  const runMPZ = () => {
    console.time('mpzjs');
    const a = mpzjs(num);
    const b = mpzjs(num).add(11);
    // console.log(a.mul(b).toString());
    for (let i = 0; i < RUNS; i++) {
      const c = a.mul(b);
    }
    console.timeEnd('mpzjs');
  };

  runMPZ();
  await sleep(500);
  runMPZ();
  await sleep(500);

  const runWasm = () => {
    console.time('gmp-wasm');
    const a = binding.mpz_t();
    binding.mpz_init_set_ui(a, 0);
    binding.mpz_set_string(a, num, 10);
    const b = binding.mpz_t();
    binding.mpz_init_set_ui(b, 0);
    binding.mpz_set_string(b, num, 10);
    binding.mpz_add_ui(b, b, 11);
    const c = binding.mpz_t();
    binding.mpz_init_set_ui(c, 0);
    // binding.mpz_mul(c, a, b);
    // binding.mpz_mod_ui(c, c, 1000000);
    // console.log(binding.mpz_get_ui(c));
    for (let i = 0; i < RUNS; i++) {
      // console.log('r');
      binding.mpz_mul(c, a, b);
    }
    console.timeEnd('gmp-wasm');
  };

  runWasm();
  await sleep(500);
  runWasm();
  await sleep(500);

  const runBigInt = () => {
    console.time('bigint');
    const a = BigInt(num);
    const b = BigInt(num) + 11n;
    for (let i = 0; i < RUNS; i++) {
      const c = a * b;
    }
    console.timeEnd('bigint');
  };

  runBigInt();
  await sleep(500);
  runBigInt();
});
