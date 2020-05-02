module.exports = function (config) {
  config.set({
    frameworks: ["jasmine", "karma-typescript"],
    files: ["src/**/*.ts", "test/**/*.ts"],
    preprocessors: {
      "**/*.ts": "karma-typescript",
    },
    reporters: ["progress", "karma-typescript", "kjhtml"],
    browsers: ["Chrome", "ChromeHeadless"],
  });
};
