const tsconfig = require('./tsconfig.json');

module.exports = function (config) {
  config.set({
    frameworks: ["jasmine", "karma-typescript"],
    files: ["src/**/*.ts", "test/**/*.ts"],
    preprocessors: {
      "**/*.ts": "karma-typescript",
    },
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    reporters: ["progress", "karma-typescript", "kjhtml"],
    browsers: ["Chrome", "ChromeHeadless"],
    karmaTypescriptConfig: {
      compilerOptions: {...tsconfig.compilerOptions},
    }
  });
};
