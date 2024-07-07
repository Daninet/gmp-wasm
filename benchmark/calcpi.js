const DecimalJs = require('decimal.js');
const Big = require('big.js');
const BigInteger = require('big-integer');
const { ExactNumber } = require('exactnumber');
const { init: initGMP, DivMode } = require('../dist/index.umd.js');
// const { init: initGMP, DivMode } = require('gmp-wasm');
const piDecimals = require("pi-decimals");
const mpzjs = require("mpzjs");

const precisionToBits = (digits) => Math.ceil(digits * 3.3219281);

const PRECISION = 8000;
const referencePi = '3.' + piDecimals.decimals.slice(0, PRECISION - 2).join('');

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
        while (x.sign() !== 0) {
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
      while (x.sign() !== 0) {
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
      const x = binding.mpz_t();
      const aux = binding.mpz_t();
      const pi = binding.mpz_t();
      binding.mpz_init_set_ui(i, 1);
      binding.mpz_init_set_ui(x, 3);
      binding.mpz_init_set_ui(aux, 10);
      binding.mpz_pow_ui(aux, aux, precision + 20);
      binding.mpz_mul(x, x, aux);
      binding.mpz_init_set(pi, x);
      while (binding.mpz_sgn(x) !== 0) {
        binding.mpz_add_ui(aux, i, 1);
        binding.mpz_mul_ui(aux, aux, 4);
        binding.mpz_mul(x, x, i);
        binding.mpz_tdiv_q(x, x, aux);
        binding.mpz_add_ui(i, i, 2);
        binding.mpz_tdiv_q(aux, x, i);
        binding.mpz_add(pi, pi, aux);
      }
      const str = binding.mpz_to_string(pi, 10);
      binding.mpz_clears(pi, aux, x, i);
      binding.mpz_t_frees(pi, aux, x, i);
      return '3.' + str.slice(1, precision);
    },

    function MPZJS_BigInt_Series (precision) {
      const i = mpzjs(1);
      const x = mpzjs(3);
      const aux = mpzjs(10);
      mpzjs.pow(aux, aux, precision + 20);
      mpzjs.mul(x, x, aux);
      const pi = mpzjs(x);
      while (!x.eq(0)) {
        mpzjs.add(aux, i, 1);
        mpzjs.mul(aux, aux, 4);
        mpzjs.mul(x, x, i);
        mpzjs.div(x, x, aux);
        mpzjs.add(i, i, 2);
        mpzjs.div(aux, x, i);
        mpzjs.add(pi, pi, aux);
      }
      const str = pi.toString();
      return '3.' + str.slice(1, precision);
    },

    function GMP_LowLevel_BigInt_Stepwise (precision) {
      const { binding } = gmp;
      let i = 0;
      let ns = 0;
      let k = 0;
      let k2 = 1;
      const acc = binding.mpz_t();
      binding.mpz_init_set_ui(acc, 0);
      const den = binding.mpz_t();
      binding.mpz_init_set_ui(den, 1);
      const num = binding.mpz_t();
      binding.mpz_init_set_ui(num, 1);
      const tmp = binding.mpz_t();
      binding.mpz_init_set_ui(tmp, 0);
      const d3 = binding.mpz_t();
      binding.mpz_init_set_ui(d3, 0);
      const d4 = binding.mpz_t();
      binding.mpz_init_set_ui(d4, 0);

      const res = [];
      while (i < precision) {
        k++;
        k2 += 2;

        binding.mpz_addmul_ui(acc, num, 2);
        binding.mpz_mul_ui(acc, acc, k2);
        binding.mpz_mul_ui(den, den, k2);
        binding.mpz_mul_ui(num, num, k);

        if (binding.mpz_cmp(num, acc) > 0) {
          continue;
        }

        binding.mpz_mul_ui(tmp, num, 3);
        binding.mpz_add(tmp, tmp, acc);
        binding.mpz_tdiv_q(d3, tmp, den);

        binding.mpz_add(tmp, tmp, num);
        binding.mpz_tdiv_q(d4, tmp, den);

        if (binding.mpz_cmp(d3, d4) !== 0) {
          continue;
        }

        const d = binding.mpz_get_ui(d3);
        ns = ns * 10 + d;
        i++;
        let last = i >= precision;
        if (i % 10 === 0 || last) {
          const nsStr = ns.toString();
          const itemString = nsStr.length < 10 ? ("000000000" + nsStr).slice(-10) : nsStr;
          res.push(itemString);
          ns = 0;
        }

        if (last) break;

        binding.mpz_submul_ui(acc, den, d);
        binding.mpz_mul_ui(acc, acc, 10);
        binding.mpz_mul_ui(num, num, 10);
      }
      res[0] = `3.${res[0].slice(1)}`;
      binding.mpz_clears(acc, den, num, tmp, d3, d4);
      binding.mpz_t_frees(acc, den, num, tmp, d3, d4);
      return res.join("");
    },

    function MPZJS_BigInt_Stepwise (precision) {
      let i = 0;
      let ns = 0;
      let k = 0;
      let k2 = 1;
      const acc = mpzjs(0);
      const den = mpzjs(1);
      const num = mpzjs(1);
      const tmp = mpzjs();
      const d3 = mpzjs();
      const d4 = mpzjs();

      const res = [];
      while (i < precision) {
        k++;
        k2 += 2;

        mpzjs.addMul(acc, num, 2);
        mpzjs.mul(acc, acc, k2);
        mpzjs.mul(den, den, k2);
        mpzjs.mul(num, num, k);

        if (num.gt(acc)) {
          continue;
        }

        mpzjs.mul(tmp, num, 3);
        mpzjs.add(tmp, tmp, acc);
        mpzjs.div(d3, tmp, den);

        mpzjs.add(tmp, tmp, num);
        mpzjs.div(d4, tmp, den);

        if (d3.ne(d4)) {
          continue;
        }

        const d = d3.toNumber();
        ns = ns * 10 + d;
        i++;
        let last = i >= precision;
        if (i % 10 === 0 || last) {
          const nsStr = ns.toString();
          const itemString = nsStr.length < 10 ? ("000000000" + nsStr).slice(-10) : nsStr;
          res.push(itemString);
          ns = 0;
        }

        if (last) break;

        mpzjs.subMul(acc, den, d);
        mpzjs.mul(acc, acc, 10);
        mpzjs.mul(num, num, 10);
      }
      res[0] = `3.${res[0].slice(1)}`;
      return res.join("");
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
      return '3.' + pi.toFixed(precision + 20).slice(1, precision + 1);
    },

    function ExactNumber_BigInt_Series (precision) {
      let i = ExactNumber(1);
      let x = ExactNumber(3).mul(ExactNumber(10).pow(precision + 20));
      let pi = ExactNumber(x);
      while (!x.isZero()) {
        x = x.mul(i).divToInt(ExactNumber(i).add(1).mul(4));
        i = i.add(2);
        pi = pi.add(x.divToInt(i));
      }
      return '3.' + pi.toFixed(precision + 20).slice(1, precision + 1);
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
      const x = binding.mpfr_t();
      const pi = binding.mpfr_t();
      const endPrecision = binding.mpfr_t();
      binding.mpfr_init2(aux, precisionBits);
      binding.mpfr_init2(x, precisionBits);
      binding.mpfr_set_ui(x, 3, 0);
      binding.mpfr_init2(pi, precisionBits);
      binding.mpfr_set(pi, x, 0);
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
      const str = binding.mpfr_to_string(pi, 10, 0);
      binding.mpfr_clears(endPrecision, pi, x, aux);
      binding.mpfr_t_frees(endPrecision, pi, x, aux);
      return str;
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

    // function ExactNumber_Float_Series (precision) {
    //   let i = 1;
    //   let x = ExactNumber(3);
    //   let pi = ExactNumber(x);
    //   const endPrecision = ExactNumber(10).pow(-precision);
    //   while (x.gt(endPrecision)) {
    //     x = x.mul(i).div((i + 1) * 4);
    //     i += 2;
    //     pi = pi.add(x.div(i));
    //     console.log(x.toExponential(10));
    //   }
    //   return pi.toString();
    // },

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
      const newRes = solver(PRECISION).slice(0, PRECISION + 1);
      if (!newRes || typeof newRes !== 'string') {
        throw new Error('Expects string result');
      }
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
