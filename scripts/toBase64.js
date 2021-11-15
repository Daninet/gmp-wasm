const fs = require('fs');
const fflate = require('fflate');
const data = fs.readFileSync('./binding/dist/gmp.wasm');
console.time('compress');
const dataCompressed = fflate.zlibSync(data, { level: 9 });
const base64 = Buffer.from(dataCompressed).toString('base64');
console.timeEnd('compress');
const src = `export const gmpWasm = '${base64}';`;
fs.writeFileSync('./gmp.wasm.ts', src);

function getDecodeBase64Length(data) {
  let bufferLength = Math.floor(data.length * 0.75);
  const len = data.length;

  if (data[len - 1] === '=') {
    bufferLength -= 1;
    if (data[len - 2] === '=') {
      bufferLength -= 1;
    }
  }

  return bufferLength;
}

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64Lookup = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
  base64Lookup[base64Chars.charCodeAt(i)] = i;
}

function decodeBase64(data) {
  const bufferLength = getDecodeBase64Length(data);
  const len = data.length;

  const bytes = new Uint8Array(bufferLength);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = base64Lookup[data.charCodeAt(i)];
    const encoded2 = base64Lookup[data.charCodeAt(i + 1)];
    const encoded3 = base64Lookup[data.charCodeAt(i + 2)];
    const encoded4 = base64Lookup[data.charCodeAt(i + 3)];

    bytes[p] = (encoded1 << 2) | (encoded2 >> 4);
    p += 1;
    bytes[p] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    p += 1;
    bytes[p] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    p += 1;
  }

  return bytes;
}

console.time('decompress');
const decoded = decodeBase64(base64);
const massiveAgain = fflate.unzlibSync(decoded);
console.timeEnd('decompress');
