describe('JSX', function() {
  it('opening element', function() {
    testTypes('jsx-with-children', 'JSXOpeningElement', [
        [3, 4, 5],
        [3, 29, 30],
    ]);
  });

  it('multiline opening element', function() {
    testTypes('jsx-with-children-multiline', 'JSXOpeningElement', [
        [3, 4, 5],
        [5, 26, -1],
        [6, 0, 5],
    ]);
  });

  it('closing element', function() {
    testTypes('jsx-with-children', 'JSXClosingElement', [
        [5, 4, 6],
        [5, 9, 10],
    ]);
  });

  it('multiline closing element', function() {
    testTypes('jsx-with-children-multiline', 'JSXClosingElement', [
        [8, 4, -1],
        [9, 0, 6],
        [10, 4, 5],
    ]);
  });

  it('self-closing closing element', function() {
    testTypes('jsx-with-props', 'JSXOpeningElement', [
        [5, 4, 5],
        [8, 15, -1],
        [9, 0, 6],
    ]);
  });

  it('tag name', function() {
    testTypes('jsx-with-children', 'JSXElementName', [
        [3, 5, 8],
        [5, 6, 9],
    ]);
  });

  describe('spread attributes', function() {
    let results;
    before(async function() {
      results = await parseFile('jsx-spread-props');
    });

    it('spread attributes, entire object expression', function() {
      testTypes(results, 'JSXSpreadAttributeObjectExpression', [
          [4, 10, -1],
          [5, 0, -1],
          [6, 0, -1],
          [7, 0, -1],
          [8, 0, 7],
      ]);
    });

    it('spread attributes with spread object property', function() {
      testTypes(results, 'JSXSpreadAttributeSpreadProperty', [
          [5, 9, 22],
      ]);
    });

    it('spread attributes, normal object properties', function() {
      testTypes(results, 'JSXSpreadAttributeObjectProperty', [
          [6, 9, 30],
          [7, 9, 17],
      ]);
    });
  });

  describe('attributes', function() {
    let results;
    before(async function() {
      results = await parseFile('jsx-with-props');
    });

    it('attribute with value and no value', function() {
      testTypes(results, 'JSXAttribute', [
          [6, 6, 16],
          [7, 6, 10],
          [8, 6, 15],
      ]);
    });

    it('expression container start', function() {
      testTypes(results, 'JSXExpressionContainerStart', [
          [6, 16, 17],
      ]);
    });

    it('expression container end', function() {
      testTypes(results, 'JSXExpressionContainerEnd', [
          [6, 19, 20],
      ]);
    });

    it('attribute value + expression', function() {
      testTypes(results, 'JSXExpression', [
          [6, 17, 19],
      ]);
    });
  });
});
