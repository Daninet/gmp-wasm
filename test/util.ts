export function parseFloatWithRadix(s, r) {
  r = (r||10)|0;
  const [b,a] = ((s||'0') + '.').split('.');
  const l1 = parseInt('1'+(a||''), r).toString(r).length;
  return parseInt(b, r) + 
    parseInt(a||'0', r) / parseInt('1' + Array(l1).join('0'), r);
}
