/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: "<rootDir>/node_modules/@databases/mysql-test/jest/globalSetup",
  globalTeardown: "<rootDir>/node_modules/@databases/mysql-test/jest/globalTeardown",
};