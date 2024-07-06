const { init: initGMP } = require('../dist/index.umd.js');

initGMP().then(gmp => {
  console.time('calculate');
  let res = 0;
  for (let i =0 ; i < 1; i++) {
    res = gmp.calculate((g) => {
      return g.Float('0').toString(10, true);
    });
  }
  console.timeEnd('calculate');
  console.log(res);
});
