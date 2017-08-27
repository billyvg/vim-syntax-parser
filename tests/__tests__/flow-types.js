describe('Flow Types', () => {
  test('type alias (entire `type` block)', () => {
    test('simple-flow-type-alias', {
      type: 'TypeAlias',
      lineStart: 1,
      lineEnd: 3,
      columnStart: 0,
      columnEnd: 1,
    });
  });

  test('`type` keyword', () => {
    test('simple-flow-type-alias', {
      type: 'TypeAliasKeyword',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 0,
      columnEnd: 4,
    });
  });

  test('type alias identifier', () => {
    test('simple-flow-type-alias', {
      type: 'TypeAliasIdentifier',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 5,
      columnEnd: 9,
    });
  });

  test('type alias with export', () => {
    test('simple-flow-type-alias', {
      type: 'TypeAliasIdentifier',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 5,
      columnEnd: 9,
    });
  });

  describe('built in types', () => {
    let results;
    beforeAll(async function() {
      results = await global.parseFile('flow-built-in-types');
    });

    test('string', () => {
      testType(results, 'StringTypeAnnotation', [1, 10, 16]);
    });

    test('number', () => {
      testType(results, 'NumberTypeAnnotation', [2, 9, 15]);
    });

    test('boolean', () => {
      testType(results, 'BooleanTypeAnnotation', [3, 12, 19]);
    });

    test('null', () => {
      testType(results, 'NullLiteralTypeAnnotation', [4, 15, 19]);
    });

    test('void', () => {
      testType(results, 'VoidTypeAnnotation', [5, 12, 16]);
    });

    test('any', () => {
      testType(results, 'AnyTypeAnnotation', [6, 12, 15]);
    });

    test('mixed', () => {
      testType(results, 'MixedTypeAnnotation', [7, 10, 15]);
    });
  });

  describe('Arrays', () => {
    let results;
    beforeAll(async function() {
      results = await global.parseFile('flow-array');
    });

    test('generic type annotation', () => {
      testType(results, 'GenericTypeAnnotation', [1, 14, 27]);
    });

    test('generic type annotation identifier', () => {
      testType(results, 'GenericTypeAnnotationIdentifier', [1, 14, 19]);
    });

    test('generic type annotation parameters (string in Array<string>)', () => {
      testType(results, 'GenericTypeAnnotationParameter', [1, 20, 26]);
    });
  });

  describe('Objects', () => {
    let results;
    beforeAll(async function() {
      results = await global.parseFile('flow-object');
    });

    test('type keyword', () => {
      testType(results, 'TypeAliasKeyword', [1, 0, 4]);
    });

    test('type identifier', () => {
      testType(results, 'TypeAliasIdentifier', [1, 5, 12]);
    });

    test('object type start bracket', () => {
      testType(results, 'ObjectTypeAnnotationStartBracket', [1, 15, 16]);
    });

    test('object type end bracket', () => {
      testType(results, 'ObjectTypeAnnotationEndBracket', [7, 0, 1]);
    });

    test('first object type property (`name: string;`)', () => {
      testType(results, 'ObjectTypeProperty', [2, 2, 15]);
    });
  });

  describe('Objects Inline', () => {
    let results;
    beforeAll(async function() {
      results = await global.parseFile('flow-object-inline');
    });

    test('type keyword', () => {
      testType(results, 'TypeAliasKeyword', [1, 0, 4]);
    });

    test('type identifier', () => {
      testType(results, 'TypeAliasIdentifier', [1, 5, 12]);
    });

    test('object type start bracket', () => {
      testType(results, 'ObjectTypeAnnotationStartBracket', [1, 15, 16]);
    });

    test('object type end bracket', () => {
      testType(results, 'ObjectTypeAnnotationEndBracket', [1, 94, 95]);
    });

    test('first object type property (`name: string;`)', () => {
      testType(results, 'ObjectTypeProperty', [1, 17, 30]);
    });
  });
});
