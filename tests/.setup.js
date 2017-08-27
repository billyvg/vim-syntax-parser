const fs = require('fs');
const p = require('path');

const read = fileName => fs.readFileSync(
  p.join(__dirname, 'templates', fileName),
  'utf8'
);

const _test = (testFileName, options, fakeOptions) => {
  const source = read(testFileName + '.js');
  let path = testFileName + '.js';

  const parse = require('../src/index').default;

  const results = [];

  return parse(source, options)
};

global.parseFile = (testFilename, options) => {
  return _test(testFilename, options);
};

global.test = (testFileName, expectedResults, options) => {
  return _test(testFileName, options).then((results) => {
    if (Array.isArray(expectedResults)) {
      expectedResults.forEach((expectedResult) => {
        expect(result).to.include(expectedResult);
      });
    } else {
      expect(result).to.include(expectedResults);
    }
  });
};

global.findType = (results, type) => {
  return results.find(r => r.type === type);
};

global.findTypes = (results, type) => {
  return results.filter((r) => r.type === type);
};

global.testEqual = (testFileName, type, expectedResult, options) => {
  let _results;
  let _expected = expectedResult;
  if (typeof type !== 'string') {
    _expected = type;
    _results = _test(testFileName, expectedResult).then((results) => {
      expect(
        results
      ).toEqual(_expected);
    });
  } else {
    _results = findType(
      _test(testFileName, options),
      type
    );

    _expected = {
      ...expectedResult,
      ...{ type },
    };

    expect(
      _results
    ).toEqual(_expected);
  }

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
  ).toEqual(expected);
};

global.testTypes = (results, type, expectedResults, options) => {
  const compare = (results) => {
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
    ).toEqual(expected);
  };

  if (typeof results === 'string') {
    parseFile(results).then(compare);
  } else {
    compare(results);
  }



};
