export function assertUint32(num: number) {
  if (!Number.isSafeInteger(num) || num < 0 || num >= Math.pow(2, 32)) {
    throw new Error('Invalid number specified: uint32_t is required');
  }
}

export function assertInt32(num: number) {
  if (!Number.isSafeInteger(num) || num < -Math.pow(2, 31) || num >= Math.pow(2, 31)) {
    throw new Error('Invalid number specified: int32_t is required');
  }
}
