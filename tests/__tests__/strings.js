import _ from 'lodash';

describe('Strings', () => {
  describe('Regular strings', () => {
    let results;
    beforeAll(async function() {
      results = await global.parseFile('single-line-string');
      results = _.filter(results, (result) => result.type === 'StringLiteral');
    });

    test('has single line string with double quotes', () => {
      expect(results[0]).toEqual({
        type: 'StringLiteral',
        lineStart: 1,
        lineEnd: 1,
        columnStart: 12,
        columnEnd: 17,
      });
    });

    test('has single line string with single quotes', () => {
      expect(results[1]).toEqual({
        type: 'StringLiteral',
        lineStart: 2,
        lineEnd: 2,
        columnStart: 12,
        columnEnd: 17,
      });
    });
  });

  describe('Template strings', () => {
    let results;
    let templateLiterals;

    beforeAll(function() {
      parseFile('template-strings').then((res) => {
        templateLiterals = _.filter(
          res,
          (result) => result.type === 'TemplateLiteral'
        );

        results = res;
      });
    });

    test('has single line template string', () => {
      expect(templateLiterals[0]).toEqual({
        type: 'TemplateLiteral',
        lineStart: 1,
        lineEnd: 1,
        columnStart: 12,
        columnEnd: 17,
      });
    });

    test('has interpolated template string', () => {
      expect(templateLiterals[1]).toEqual({
        type: 'TemplateLiteral',
        lineStart: 2,
        lineEnd: 2,
        columnStart: 12,
        columnEnd: 24,
      });
    });

    test('expressions inside of template string', () => {
      testTypes(results, 'TemplateLiteralExpression', [
        [2, 19, 22],
        [3, 23, 40],
        [4, 23, 46],
      ]);
    });

    test('multiline template string', () => {
      expect(templateLiterals[4]).toEqual({
        type: 'TemplateLiteral',
        lineStart: 6,
        lineEnd: 6,
        columnStart: 18,
        columnEnd: -1,
      });

      expect(templateLiterals[5]).toEqual({
        type: 'TemplateLiteral',
        lineStart: 7,
        lineEnd: 7,
        columnStart: 0,
        columnEnd: -1,
      });

      expect(templateLiterals[6]).toEqual({
        type: 'TemplateLiteral',
        lineStart: 8,
        lineEnd: 8,
        columnStart: 0,
        columnEnd: -1,
      });

      expect(templateLiterals[7]).toEqual({
        type: 'TemplateLiteral',
        lineStart: 9,
        lineEnd: 9,
        columnStart: 0,
        columnEnd: 1,
      });
    });
  });
});
