module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',

  rootDir: 'src',

  globals: {
    'ts-jest': {
      compiler: 'ttypescript',
    },
  },
};
