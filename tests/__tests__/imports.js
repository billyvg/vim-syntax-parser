describe('Imports', function() {
  describe('Non-default and inline', function() {
    let results;
    before(function() {
      results = global.parseFile('import-non-default-inline');
    });

    it('import declaration (entire import block)', function() {
      testType(results, 'ImportDeclaration', [ 1, 0, 33 ]);
    });

    it('import specifier (what you are importing)', function() {
      testType(results, 'ImportSpecifier', [ 1, 9, 19 ]);
    });

    it('identifiers within import specifier', function() {
      testTypes(results, 'ImportSpecifierIdentifier', [
        [1, 16, 19],
        [1, 9, 12],
      ]);
    });
  });

  describe('Default and inline', function() {
    let results;
    before(function() {
      results = global.parseFile('import-default-inline');
    });

    it('import declaration (entire import block)', function() {
      testType(results, 'ImportDeclaration', [ 1, 0, 22 ]);
    });

    it('import specifier (what you are importing)', function() {
      testType(results, 'ImportDefaultSpecifier', [ 1, 7, 10 ]);
    });

    it('identifiers within import specifier', function() {
      testType(results, 'ImportDefaultSpecifierIdentifier', [1, 7, 10]);
    });
  });

  describe('Multiple', function() {
    let results;
    before(function() {
      results = global.parseFile('import-multiple');
    });

    it('import declaration (entire import block)', function() {
      testTypes(results, 'ImportDeclaration', [
        [1, 0, -1],
        [2, 0, -1],
        [3, 0, -1],
        [4, 0, -1],
        [5, 0, 13],
      ]);
    });

    it('import specifier (what you are importing)', function() {
      testTypes(results, 'ImportSpecifier', [
          [2, 2, 5],
          [3, 2, 13],
          [4, 2, 5],
      ]);
    });

    it('identifiers within import specifier', function() {
      testTypes(results, 'ImportSpecifierIdentifier', [
          [2, 2, 5],
          [2, 2, 5],
          [3, 9, 13],
          [3, 2, 5],
          [4, 2, 5],
          [4, 2, 5],
      ]);
    });
  });
});
