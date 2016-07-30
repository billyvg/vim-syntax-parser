import _ from 'lodash';

describe('Strings', function() {
  describe('Regular strings', function() {
    let results;
    before(function() {
      results = _.filter(
        global.parseFile('single-line-string'),
        (result) => result.type === 'StringLiteral'
      );
    });

    it('has single line string with double quotes', function() {
      expect(results[0]).to.deep.equal({
        type: 'StringLiteral',
        lineStart: 1,
        lineEnd: 1,
        columnStart: 12,
        columnEnd: 17,
      });
    });

    it('has single line string with single quotes', function() {
      expect(results[1]).to.deep.equal({
        type: 'StringLiteral',
        lineStart: 2,
        lineEnd: 2,
        columnStart: 12,
        columnEnd: 17,
      });
    });
  });

  describe('Template strings', function() {
    let results;
    let templateLiterals;
    let identifiers;
    before(function() {
      results = parseFile('template-strings');
      templateLiterals = _.filter(
        results,
        (result) => result.type === 'TemplateLiteral'
      );
      identifiers = _.filter(
        results,
        (result) => result.type === 'Identifier'
      );
    });

    it('has single line template string', function() {
      expect(templateLiterals[0]).to.deep.equal({
        type: 'TemplateLiteral',
        lineStart: 1,
        lineEnd: 1,
        columnStart: 12,
        columnEnd: 17,
      });
    });

    it('has interpolated template string', function() {
      expect(templateLiterals[1]).to.deep.equal({
        type: 'TemplateLiteral',
        lineStart: 2,
        lineEnd: 2,
        columnStart: 12,
        columnEnd: 24,
      });
    });

    it('expressions inside of template string', function() {
      testTypes(results, 'TemplateLiteralExpression', [
        [2, 19, 22],
        [3, 23, 40],
        [4, 23, 46],
      ]);
    });

    it('multiline template string', function() {
      expect(templateLiterals[4]).to.deep.equal({
        type: 'TemplateLiteral',
        lineStart: 6,
        lineEnd: 6,
        columnStart: 18,
        columnEnd: -1,
      });

      expect(templateLiterals[5]).to.deep.equal({
        type: 'TemplateLiteral',
        lineStart: 7,
        lineEnd: 7,
        columnStart: 0,
        columnEnd: -1,
      });

      expect(templateLiterals[6]).to.deep.equal({
        type: 'TemplateLiteral',
        lineStart: 8,
        lineEnd: 8,
        columnStart: 0,
        columnEnd: -1,
      });

      expect(templateLiterals[7]).to.deep.equal({
        type: 'TemplateLiteral',
        lineStart: 9,
        lineEnd: 9,
        columnStart: 0,
        columnEnd: 1,
      });
    });
  });
});
