const gmpLib = require('./binding/dist/gmp');

const utf8decoder = new TextDecoder();

gmpLib().then(gmp => {
  const readCString = (ptr) => {
    const end = gmp.HEAP8.indexOf(0, ptr);
    return utf8decoder.decode(gmp.HEAP8.subarray(ptr, end));
  };

  console.log(gmp);
  const ptr = gmp._z_t();
  console.log(ptr);
  gmp._z_init(ptr);
  gmp._z_set_ui(ptr, 12);
  console.time('x');
  for(let i = 0; i < 10000; i++) {
    gmp._z_add_ui(ptr, ptr, 10000);
  }
  gmp._z_sqrt(ptr, ptr);
  console.timeEnd('x');
  const strptr = gmp._z_get_str(0, 10, ptr);
  console.log(strptr);
  console.log(readCString(strptr));
});

