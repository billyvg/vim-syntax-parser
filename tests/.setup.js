'use strict';

require('babel-register')({
  presets: ['es2015', 'stage-1'],
  plugins: ['transform-decorators-legacy'],
});

const _ = require('lodash');
const fs = require('fs');
const p = require('path');
const chai = require('chai');
chai.use(require('sinon-chai'));

const read = fileName => fs.readFileSync(
  p.join(__dirname, 'templates', fileName),
  'utf8'
);

const expect = chai.expect;
global.expect = expect;

const _test = (testFileName, options, fakeOptions) => {
  const source = read(testFileName + '.js');
  let path = testFileName + '.js';

  const Parser = require('../src/index');

  const results = [];

  Parser.parse(source, options, function(err, result) {
    results.push(result);
  });

  return results;
};

global.parseFile = (testFilename, options) => {
  return _test(testFilename, options);
};

global.test = (testFileName, expectedResults, options) => {
  const result = _test(testFileName, options);
  if (_.isArray(expectedResults)) {
    expectedResults.forEach((expectedResult) => {
      expect(result).to.include(expectedResult);
    });
  } else {
    expect(result).to.include(expectedResults);
  }
};

global.findType = (results, type) => {
  return _.find(results, (r) => r.type === type);
};

global.findTypes = (results, type) => {
  return _.filter(results, (r) => r.type === type);
};

global.testEqual = (testFileName, type, expectedResult, options) => {
  let _results;
  let _expected = expectedResult;
  if (typeof type !== 'string') {
    _expected = type;
    _results = _test(testFileName, expectedResult);
  } else {
    _results = findType(
      _test(testFileName, options),
      type
    );

    _expected = {
      ...expectedResult,
      ...{ type },
    };
  }

  expect(
    _results
  ).to.deep.equal(_expected);
};

global.testType = (results, type, expectedResult, options) => {
  let [
    lineStart,
    lineEnd,
    columnStart,
    columnEnd,
  ] = expectedResult;

  if (typeof columnEnd === 'undefined') {
    columnEnd = columnStart;
    columnStart = lineEnd;
    lineEnd = lineStart;
  }

  const expected = {
    lineStart,
    lineEnd,
    columnStart,
    columnEnd,
    type,
  };

  expect(
    findType(results, type)
  ).to.deep.equal(expected);
};

global.testTypes = (results, type, expectedResults, options) => {
  const expected = expectedResults.map((result) => {
    let [
      lineStart,
      lineEnd,
      columnStart,
      columnEnd,
    ] = result;
    if (typeof columnEnd === 'undefined') {
      columnEnd = columnStart;
      columnStart = lineEnd;
      lineEnd = lineStart;
    }

    return {
      lineStart,
      lineEnd,
      columnStart,
      columnEnd,
      type,
    };
  });

  expect(
    findTypes(results, type)
  ).to.deep.equal(expected);
};
