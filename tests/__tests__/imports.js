describe('Imports', () => {
  describe('Non-default and inline', () => {
    let results;
    beforeAll(async function() {
      results = await global.parseFile('import-non-default-inline');
    });

    test('import declaration (entire import block)', () => {
      testTypes(results, 'ImportDeclaration', [
          [1, 0, 9],
          [1, 19, 27],
          [1, 12, 16],
      ]);
    });

    test('import specifier (what you are importing)', () => {
      testType(results, 'ImportSpecifier', [1, 9, 19]);
    });

    test('identifiers within import specifier', () => {
      testTypes(results, 'ImportSpecifierIdentifier', [
        [1, 16, 19],
        [1, 9, 12],
      ]);
    });
  });

  describe('Default and inline', () => {
    let results;
    beforeAll(async function() {
      results = await global.parseFile('import-default-inline');
    });

    test('import declaration (entire import block)', () => {
      testTypes(results, 'ImportDeclaration', [
        [1, 0, 7],
        [1, 10, 16],
      ]);
    });

    test('import specifier (what you are importing)', () => {
      testTypes(results, 'ImportDefaultSpecifier', [
        [1, 7, 10],
      ]);
    });

    test('identifiers within import specifier', () => {
      testTypes(results, 'ImportDefaultSpecifierIdentifier', [
        [1, 7, 10],
      ]);
    });
  });

  describe('Multiple', () => {
    let results;
    beforeAll(async function() {
      results = await global.parseFile('import-multiple');
    });

    test('import declaration (entire import block)', () => {
      testTypes(results, 'ImportDeclaration', [
        [1, 0, -1],
        [2, 0, 2],
        [2, 5, -1],
        [3, 0, 2],
        [3, 13, -1],
        [4, 0, 2],
        [4, 5, -1],
        [5, 0, 7],
        [3, 5, 9],
      ]);
    });

    test('import specifier (what you are importing)', () => {
      testTypes(results, 'ImportSpecifier', [
          [2, 2, 5],
          [3, 2, 13],
          [4, 2, 5],
      ]);
    });

    test('identifiers within import specifier', () => {
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

  test('default and non-default mixed', () => {
    testTypes('import-default-and-non-mixed', 'ImportDeclaration', [
      [1, 0, 7],
      [1, 10, 14],
      [1, 24, 32],
      [1, 17, 21],
    ]);
  });
});
