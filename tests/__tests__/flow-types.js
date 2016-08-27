describe('Flow Types', function() {
  it('type alias (entire `type` block)', function() {
    test('simple-flow-type-alias', {
      type: 'TypeAlias',
      lineStart: 1,
      lineEnd: 3,
      columnStart: 0,
      columnEnd: 1,
    });
  });

  it('`type` keyword', function() {
    test('simple-flow-type-alias', {
      type: 'TypeAliasKeyword',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 0,
      columnEnd: 4,
    });
  });

  it('type alias identifier', function() {
    test('simple-flow-type-alias', {
      type: 'TypeAliasIdentifier',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 5,
      columnEnd: 9,
    });
  });

  it('type alias with export', function() {
    test('simple-flow-type-alias', {
      type: 'TypeAliasIdentifier',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 5,
      columnEnd: 9,
    });
  });

  describe('built in types', function() {
    let results;
    before(async function() {
      results = await global.parseFile('flow-built-in-types');
    });

    it('string', function() {
      testType(results, 'StringTypeAnnotation', [
        1,
        10,
        16,
      ]);
    });

    it('number', function() {
      testType(results, 'NumberTypeAnnotation', [
        2,
        9,
        15,
      ]);
    });

    it('boolean', function() {
      testType(results, 'BooleanTypeAnnotation', [
        3,
        12,
        19,
      ]);
    });

    it('null', function() {
      testType(results, 'NullLiteralTypeAnnotation', [
        4,
        15,
        19,
      ]);
    });

    it('void', function() {
      testType(results, 'VoidTypeAnnotation', [
        5,
        12,
        16,
      ]);
    });

    it('any', function() {
      testType(results, 'AnyTypeAnnotation', [
        6,
        12,
        15,
      ]);
    });

    it('mixed', function() {
      testType(results, 'MixedTypeAnnotation', [
        7,
        10,
        15,
      ]);
    });
  })

  describe('Arrays', function() {
    let results;
    before(async function() {
      results = await global.parseFile('flow-array');
    });

    it('generic type annotation', function () {
      testType(results, 'GenericTypeAnnotation', [
        1,
        14,
        27,
      ]);
    });

    it('generic type annotation identifier', function () {
      testType(results, 'GenericTypeAnnotationIdentifier', [
        1,
        14,
        19,
      ]);
    });

    it('generic type annotation parameters (string in Array<string>)', function () {
      testType(results, 'GenericTypeAnnotationParameter', [
        1,
        20,
        26,
      ]);
    });
  });

  describe('Objects', function() {
    let results;
    before(async function() {
      results = await global.parseFile('flow-object');
    });

    it('type keyword', function() {
      testType(results, 'TypeAliasKeyword', [
        1,
        0,
        4,
      ]);
    });

    it('type identifier', function() {
      testType(results, 'TypeAliasIdentifier', [
        1,
        5,
        12,
      ]);
    });

    it('object type start bracket', function() {
      testType(results, 'ObjectTypeAnnotationStartBracket', [
        1,
        15,
        16,
      ]);
    });

    it('object type end bracket', function() {
      testType(results, 'ObjectTypeAnnotationEndBracket', [
        7,
        0,
        1,
      ]);
    });

    it('first object type property (`name: string;`)', function() {
      testType(results, 'ObjectTypeProperty', [2, 2, 15]);
    });
  });

  describe('Objects Inline', function() {
    let results;
    before(async function() {
      results = await global.parseFile('flow-object-inline');
    });

    it('type keyword', function() {
      testType(results, 'TypeAliasKeyword', [ 1, 0, 4, ]);
    });

    it('type identifier', function() {
      testType(results, 'TypeAliasIdentifier', [ 1, 5, 12, ]);
    });

    it('object type start bracket', function() {
      testType(results, 'ObjectTypeAnnotationStartBracket', [ 1, 15, 16, ]);
    });

    it('object type end bracket', function() {
      testType(results, 'ObjectTypeAnnotationEndBracket', [ 1, 94, 95, ]);
    });

    it('first object type property (`name: string;`)', function() {
      testType(results, 'ObjectTypeProperty', [1, 17, 30]);
    });
  });

});
