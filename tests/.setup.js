'use strict';
require('babel-register')({
  presets: ['es2015', 'stage-1'],
});

const fs = require('fs');
const p = require('path');
const chai = require('chai');
chai.use(require('sinon-chai'));

const read = fileName => fs.readFileSync(
  p.join(__dirname, 'templates', fileName),
  'utf8'
);

global.test = (testFileName, expectedResult, options, fakeOptions) => {
  const source = read(testFileName + '.js');
  let path = testFileName + '.js';

  const expect = chai.expect;
  const Parser = require('../src/index');

  const results = [];

  Parser.parse(source, function(err, result) {
    results.push(result);
  }, options);

  expect(results).to.include(expectedResult);
};
