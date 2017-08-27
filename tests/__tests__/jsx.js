describe('JSX', () => {
  test('opening element', () => {
    testTypes('jsx-with-children', 'JSXOpeningElement', [
      [3, 4, 5],
      [3, 29, 30],
    ]);
  });

  test('multiline opening element', () => {
    testTypes('jsx-with-children-multiline', 'JSXOpeningElement', [
      [3, 4, 5],
      [5, 26, -1],
      [6, 0, 5],
    ]);
  });

  test('closing element', () => {
    testTypes('jsx-with-children', 'JSXClosingElement', [
      [5, 4, 6],
      [5, 9, 10],
    ]);
  });

  test('multiline closing element', () => {
    testTypes('jsx-with-children-multiline', 'JSXClosingElement', [
      [8, 4, -1],
      [9, 0, 6],
      [10, 4, 5],
    ]);
  });

  test('self-closing closing element', () => {
    testTypes('jsx-with-props', 'JSXOpeningElement', [
      [5, 4, 5],
      [8, 15, -1],
      [9, 0, 6],
    ]);
  });

  test('tag name', () => {
    testTypes('jsx-with-children', 'JSXElementName', [[3, 5, 8], [5, 6, 9]]);
  });

  describe('spread attributes', () => {
    let results;
    beforeAll(async function() {
      results = await parseFile('jsx-spread-props');
    });

    test('spread attributes, entire object expression', () => {
      testTypes(results, 'JSXSpreadAttributeObjectExpression', [
        [4, 10, -1],
        [5, 0, -1],
        [6, 0, -1],
        [7, 0, -1],
        [8, 0, 7],
      ]);
    });

    test('spread attributes with spread object property', () => {
      testTypes(results, 'JSXSpreadAttributeSpreadProperty', [[5, 9, 22]]);
    });

    test('spread attributes, normal object properties', () => {
      testTypes(results, 'JSXSpreadAttributeObjectProperty', [
        [6, 9, 30],
        [7, 9, 17],
      ]);
    });
  });

  describe('attributes', () => {
    let results;
    beforeAll(async function() {
      results = await parseFile('jsx-with-props');
    });

    test('attribute with value and no value', () => {
      testTypes(results, 'JSXAttribute', [[6, 6, 16], [7, 6, 10], [8, 6, 15]]);
    });

    test('expression container start', () => {
      testTypes(results, 'JSXExpressionContainerStart', [[6, 16, 17]]);
    });

    test('expression container end', () => {
      testTypes(results, 'JSXExpressionContainerEnd', [[6, 19, 20]]);
    });

    test('attribute value + expression', () => {
      testTypes(results, 'JSXExpression', [[6, 17, 19]]);
    });
  });
});
