module.exports = {
  testEnvironment: 'node',
  roots: [
    '<rootDir>/test',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest/legacy',
  },
  cacheDirectory: '<rootDir>/.jest-cache',
  moduleNameMapper: {
    "gmpwasmts": "<rootDir>/gmp.wasm.ts",
  },
};
