const DecimalJs = require('decimal.js');
const Big = require('big.js');
const BigInteger = require('big-integer');
const { init: initGMP, DivMode } = require('../dist/index.umd.js');
const piDecimals = require("pi-decimals");

const precisionToBits = (digits) => Math.ceil(digits * 3.3219281);

const PRECISION = 8000;
const referencePi = '3.' + piDecimals.decimals.slice(0, PRECISION - 2).join('');

const decoder = new TextDecoder();

console.log(`Calculating ${PRECISION} digits of Pi...`);
console.log('------------------');

initGMP().then(gmp => {
  const GCCallbacks = [];
  const runWASMGC = () => {
    GCCallbacks.forEach(fn => fn());
    GCCallbacks.length = 0;
  }

  const solvers = [
    // Tests ending in "Series" use the following infinite series to estimate Pi:
    // PI = 3 + 3(1/2)(1/3)(1/4) + 3((1/2)(3/4))(1/5)(1/4^2) + 3((1/2)(3/4)(5/6))(1/7)(1/4^3) + ...
    // http://ajennings.net/blog/a-million-digits-of-pi-in-9-lines-of-javascript.html

    function JS_BigInt_Series (precision) {
      let i = 1n;
      let x = 3n * (10n ** (BigInt(precision) + 20n));
      let pi = x;
      while (x !== 0n) {
        x = x * i / ((i + 1n) * 4n);
        i += 2n;
        pi += x / i;
      }
      return '3.' + pi.toString().slice(1, precision);
    },
  
    function GMP_BigInt_Series (precision) {
      const res = gmp.calculate(g => {
        let i = g.Integer(1);
        let x = g.Integer(3).mul(g.Integer(10).pow(precision + 20));
        let pi = x;
        while (!x.isEqual(0)) {
          x = x.mul(i).div(i.add(1).mul(4), DivMode.TRUNCATE);
          i = i.add(2);
          pi = pi.add(x.div(i, DivMode.TRUNCATE));
        }
        return pi;
      });
      return '3.' + res.toString().slice(1, precision);
    },

    function GMP_DelayGC_BigInt_Series (precision) {
      const g = gmp.getContext();
      let i = g.Integer(1);
      let x = g.Integer(3).mul(g.Integer(10).pow(precision + 20));
      let pi = x;
      while (!x.isEqual(0)) {
        x = x.mul(i).div(i.add(1).mul(4), DivMode.TRUNCATE);
        i = i.add(2);
        pi = pi.add(x.div(i, DivMode.TRUNCATE));
      }
      GCCallbacks.push(() => g.destroy());
      return '3.' + pi.toString().slice(1, precision);
    },

    function GMP_LowLevel_BigInt_Series (precision) {
      const { binding } = gmp;
      const i = binding.mpz_t();
      binding.mpz_init_set_ui(i, 1);
      const x = binding.mpz_t();
      binding.mpz_init_set_ui(x, 3);
      const aux = binding.mpz_t();
      binding.mpz_init_set_ui(aux, 10);
      binding.mpz_pow_ui(aux, aux, precision + 20);
      binding.mpz_mul(x, x, aux);
      const pi = binding.mpz_t();
      binding.mpz_init_set(pi, x);
      while (binding.mpz_cmp_ui(x, 0) !== 0) {
        binding.mpz_add_ui(aux, i, 1);
        binding.mpz_mul_ui(aux, aux, 4);
        binding.mpz_mul(x, x, i);
        binding.mpz_tdiv_q(x, x, aux);
        binding.mpz_add_ui(i, i, 2);
        binding.mpz_tdiv_q(aux, x, i);
        binding.mpz_add(pi, pi, aux);
      }
      const strptr = binding.mpz_get_str(0, 10, pi);
      const endptr = binding.mem.indexOf(0, strptr);
      const str = decoder.decode(binding.mem.subarray(strptr, endptr));
      binding.free(strptr);
      binding.mpz_clears(i, x, aux, pi);
      binding.mpz_t_frees(i, x, aux, pi);
      return '3.' + str.slice(1, precision);
    },

    // function BigJs_Series (precision) {
    //   Big.DP = precision + 20;
    //   let i = Big(1);
    //   let x = Big(3).mul(Big(10).pow(precision + 20));
    //   let pi = Big(x);
    //   while (!x.eq(0)) {
    //     x = x.mul(i).div(i.add(1).mul(4));
    //     i = i.add(2);
    //     pi = pi.add(x.div(i));
    //   }
    //   return pi.toString().slice(0, precision);
    // },

    function BigInteger_Series (precision) {
      let i = BigInteger(1);
      let x = BigInteger(3).multiply(BigInteger(10).pow(precision + 20));
      let pi = x;
      while (x.notEquals(0)) {
        x = x.multiply(i).divide(i.add(1).multiply(4));
        i = i.add(2);
        pi = pi.add(x.divide(i));
      }
      return '3.' + pi.toString().slice(1, precision);
    },

    function DecimalJs_BigInt_Series (precision) {
      DecimalJs.precision = precision + 20;
      let i = DecimalJs(1);
      let x = DecimalJs(3).mul(DecimalJs(10).pow(precision + 20));
      let pi = DecimalJs(x);
      while (!x.isZero()) {
        x = x.mul(i).divToInt(DecimalJs(i).add(1).mul(4));
        i = i.add(2);
        pi = pi.add(x.divToInt(i));
      }
      return pi.toString().slice(0, precision + 1);
    },

    function GMP_Float_Series (precision) {
      const precisionBits = precisionToBits(precision + 1);
      const res = gmp.calculate(g => {
        let i = 1
        let x = g.Float(3);
        let pi = g.Float(x);
        const endPrecision = g.Float(10).pow(-precision);
        while (x.greaterThan(endPrecision)) {
          x = x.mul(i).div((i + 1) * 4);
          i += 2;
          pi = pi.add(x.div(i));
        }
        return pi;
      }, { precisionBits });
      return res.toString();
    },

    function GMP_DelayGC_Float_Series (precision) {
      const precisionBits = precisionToBits(precision + 1);
      const g = gmp.getContext({ precisionBits });
      let i = 1
      let x = g.Float(3);
      let pi = g.Float(x);
      const endPrecision = g.Float(10).pow(-precision);
      while (x.greaterThan(endPrecision)) {
        x = x.mul(i).div((i + 1) * 4);
        i += 2;
        pi = pi.add(x.div(i));
      }
      GCCallbacks.push(() => g.destroy());
      return pi.toString();
    },

    function GMP_LowLevel_Float_Series (precision) {
      const { binding } = gmp;
      const precisionBits = precisionToBits(precision + 1);
      let i = 1
      const aux = binding.mpfr_t();
      binding.mpfr_init2(aux, precisionBits);
      const x = binding.mpfr_t();
      binding.mpfr_init2(x, precisionBits);
      binding.mpfr_set_ui(x, 3, 0);
      const pi = binding.mpfr_t();
      binding.mpfr_init2(pi, precisionBits);
      binding.mpfr_set(pi, x, 0);
      const endPrecision = binding.mpfr_t();
      binding.mpfr_init2(endPrecision, precisionBits);
      binding.mpfr_set_ui(endPrecision, 10, 0);
      binding.mpfr_pow_si(endPrecision, endPrecision, -precision, 0);
      while (binding.mpfr_greater_p(x, endPrecision) !== 0) {
        binding.mpfr_mul_ui(x, x, i, 0);
        binding.mpfr_div_ui(x, x, ((i + 1) * 4), 0);
        i += 2;
        binding.mpfr_div_ui(aux, x, i, 0);
        binding.mpfr_add(pi, pi, aux, 0);
      }
      const g = gmp.getContext({ precisionBits });
      // Use the string converter from the Float wrapper
      const out = g.Float();
      out.mpfr_t = pi;
      const res = out.toString();
      binding.mpfr_clears(pi, endPrecision, x, aux);
      binding.mpfr_t_frees(pi, endPrecision, x, aux);
      return res;
    },

    function DecimalJs_Float_Series (precision) {
      DecimalJs.precision = precision + 1;
      let i = 1;
      let x = DecimalJs(3);
      let pi = DecimalJs(x);
      const endPrecision = DecimalJs(10).pow(-precision);
      while (x.greaterThan(endPrecision)) {
        x = x.mul(i).div((i + 1) * 4);
        i += 2;
        pi = pi.add(x.div(i));
      }
      return pi.toString();
    },

    // function DecimalJsAtan1(precision) {
    //   DecimalJs.precision = precision;
    //   const a = DecimalJs(1).atan().mul(4);
    //   return a.toString();
    // },
  
    function GMP_Atan_1(precision) {
      const precisionBits = precisionToBits(precision + 1);
      return gmp.calculate(g => {
        return g.Float(1).atan().mul(4);
      }, { precisionBits });
    },

    // function DecimalJsAsin1over2(precision) {
    //   DecimalJs.precision = precision;
    //   const a = DecimalJs('0.5').asin().mul(6);
    //   return a.toString();
    // },

    function GMP_Asin_1over2(precision) {
      const precisionBits = precisionToBits(precision + 1);
      return gmp.calculate(g => {
        return g.Float('0.5').asin().mul(6);
      }, { precisionBits });
    },
  ];

  // verify
  // solvers.forEach(solver => {
  //   console.log('verifying', solver.name, '()...');
  //   console.log(solver(20));
  // });

  // warm-up
  solvers.forEach(solver => {
    console.log('warming up', solver.name, '()...');
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      solver(PRECISION);
      runWASMGC();
      const end = performance.now();
      if (end - start > 1000) break;
    }
  });

  const results = {};

  const measure = (i) => {
    solvers.forEach(solver => {
      const start = performance.now();
      const res = solver(PRECISION);
      const end = performance.now();
      runWASMGC();
      if (res.slice(0, PRECISION) !== referencePi) {
        console.log(res.slice(0, PRECISION));
        throw new Error(`Pi mismatch at ${solver.name}`);
      }
      if (!results[solver.name]) results[solver.name] = {};
      results[solver.name].avg = (results[solver.name].avg ?? 0) + (end - start);
      results[solver.name][`run${i + 1}`] = (end - start).toFixed(2) + ' ms';
    });
  };

  console.log('-----------');

  // measure
  const sleep = () => new Promise(resolve => setTimeout(resolve, 500));
  sleep();

  for (let i = 0; i < 4; i++) {
    console.log(`Measuring... round ${i + 1}`);
    measure(i);
    sleep();
  }

  Object.values(results).forEach(r => r.avg = (r.avg / 4).toFixed(2) + ' ms');

  console.table(results);
});
