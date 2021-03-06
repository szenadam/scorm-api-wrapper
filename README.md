# SCORM API Wrapper

![Build](https://github.com/szenadam/scorm-api-wrapper/workflows/Build/badge.svg)

A modernized reimplementation of the SCORM API Wrapper inspired by
[pipwerks/scorm-api-wrapper](https://github.com/pipwerks/scorm-api-wrapper).
It works with the SCORM 1.2 and SCORM 2004 Runtime.

## Requirements

- Nodejs 10+
- npm 6+

## Build

1. `npm install`
2. `npm run build`
3. Build artifact can be found in the `dist/` folder.

## Running test

1. `npm install`
2. `npm test`

## Contributing

Contributions are welcomed.

## Changelog

### v1.1.1

- Replace karma/jasmine framework to babel/jest.
- Set all properties in wrapper to private.

### v1.1.0

- Rename functions to be more readable.
- Fix log messages to reflect the new code.
- Fix Karma reporter to show test results.
- Type check test builds with base tsconfig.
- Modify functions to have only one return type to allow strict null check.

### v1.0.0

- Copied every function from old code.
- Implemented the whole wrapper object as a single class with every property and function as public.
- Return types were taken from the old code.
- Class property names were changed a bit to reflect the nested structure of the old code.
