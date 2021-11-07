import { getGMPInterface } from './functions';

export async function getLib(wasmPath: string) {
  const gmp = await getGMPInterface(wasmPath);

  class GMPInteger {
    private mpz_t = 0;
  
    constructor(str: string) {
      this.mpz_t = gmp.mpz_t();
      gmp.mpq_init(this.mpz_t);
    }
  
    destroy() {
      gmp.mpz_t_free(this.mpz_t);
    }
  }

  return {
    GMPInteger,
  };
};
