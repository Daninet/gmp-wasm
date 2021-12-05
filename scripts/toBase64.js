const fs = require('fs');
const fflate = require('fflate');

const compress = (filename) => {
  const data = fs.readFileSync(`./binding/dist/${filename}`);
  console.time('compress');
  const dataCompressed = fflate.deflateSync(data, { level: 9, mem: 4 });
  const base64 = Buffer.from(dataCompressed).toString('base64');
  console.timeEnd('compress');
  const src = `export const gmpWasmLength = ${data.length}; export const gmpWasm = '${base64}';`;
  fs.writeFileSync(`./${filename}.ts`, src);
};

compress('gmp.wasm');
compress('gmpmini.wasm');
