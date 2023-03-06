/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  reporters: ["default", "jest-junit"],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**']
};
