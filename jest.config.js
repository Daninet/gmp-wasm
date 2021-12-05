module.exports = {
  roots: [
    '<rootDir>/test',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  cacheDirectory: '<rootDir>/.jest-cache',
  moduleNameMapper: {
    "gmpwasmts": "<rootDir>/gmp.wasm.ts",
  },
};
