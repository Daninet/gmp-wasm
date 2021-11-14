const DecimalJs = require('decimal.js');
const { getGMP, DivMode } = require('../dist/index.umd.min.js');
const piDecimals = require("pi-decimals");

const precisionToBits = (digits) => Math.ceil(digits * 3.3219281);

const PRECISION = 1100;
const referencePi = '3.' + piDecimals.decimals.slice(0, PRECISION - 2).join('');

console.log(`Calculating ${PRECISION} digits of Pi...`);
console.log('------------------');

getGMP(require.resolve('../dist/gmp.wasm')).then(gmp => {
  const solvers = [
    function JSBigIntTaylor (precision) {
      // http://ajennings.net/blog/a-million-digits-of-pi-in-9-lines-of-javascript.html
      // PI = 3 + 3(1/2)(1/3)(1/4) + 3((1/2)(3/4))(1/5)(1/4^2) + 3((1/2)(3/4)(5/6))(1/7)(1/4^3) + ...
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
  
    function GMPBigIntTaylor (precision) {
      // The algorithm from JSBigIntTaylor()
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

    function DecimalJsBigIntTaylor (precision) {
      // The algorithm from JSBigIntTaylor()
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

    function GMPFloatTaylor (precision) {
      // PI = 3 + 3(1/2)(1/3)(1/4) + 3((1/2)(3/4))(1/5)(1/4^2) + 3((1/2)(3/4)(5/6))(1/7)(1/4^3) + ...
      const precisionBits = precisionToBits(precision) + 1;
      const res = gmp.calculate(g => {
        let i = 1;
        let x = g.Float(3);
        let pi = g.Float(x);
        const endPrecision = g.Float(10).pow(-precision);
        console.time('gmp2');
        while (x.greaterThan(endPrecision)) {
          x = x.mul(i).div(g.Float(i, { precisionBits: 32 }).add(1).mul(4));
          i += 2;
          pi = pi.add(x.div(i));
        }
        console.timeEnd('gmp2');
        return pi;
      }, { precisionBits });
      return res.toString();
    },

    function DecimalJsFloatTaylor (precision) {
      // PI = 3 + 3(1/2)(1/3)(1/4) + 3((1/2)(3/4))(1/5)(1/4^2) + 3((1/2)(3/4)(5/6))(1/7)(1/4^3) + ...
      DecimalJs.precision = precision + 4;
      let i = 1;
      let x = DecimalJs(3);
      let pi = DecimalJs(x);
      const endPrecision = DecimalJs(10).pow(-precision);
      console.time('dec2');
      while (x.greaterThan(endPrecision)) {
        x = x.mul(i).div(DecimalJs(i).add(1).mul(4));
        i += 2;
        pi = pi.add(x.div(i));
      }
      console.timeEnd('dec2');
      return pi.toString();
    },
  
    // function DecimalJsAtan1(precision) {
    //   DecimalJs.precision = precision;
    //   const a = DecimalJs(1).atan().mul(4);
    //   return a.toString();
    // },
  
    function GMPAtan1(precision) {
      const precisionBits = precisionToBits(precision);
      return gmp.calculate(g => {
        return g.Float('1').atan().mul(4);
      }, { precisionBits });
    },

    // function DecimalJsAsin1over2(precision) {
    //   DecimalJs.precision = precision;
    //   const a = DecimalJs('0.5').asin().mul(6);
    //   return a.toString();
    // },

    function GMPAsin1over2(precision) {
      const precisionBits = precisionToBits(precision);
      return gmp.calculate(g => {
        return g.Float('0.5').asin().mul(6);
      }, { precisionBits });
    },
  ];

  // verify
  solvers.forEach(solver => {
    console.log('checking', solver.name, '()...');
    console.log(solver(20));
  });

  // warm-up
  solvers.forEach(solver => {
    console.log('warming up', solver.name, '()...');
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      solver(PRECISION);
      const end = performance.now();
      if (end - start > 1000) break;
    }
  });

  // measure
  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      solvers.forEach(solver => {
        console.time(solver.name);
        const res = solver(PRECISION);
        console.timeEnd(solver.name);
        if (res.slice(0, PRECISION) !== referencePi) {
          throw new Error(`Pi mismatch at ${solver.name}`);
        }
      });
    }
  }, 500);
});
