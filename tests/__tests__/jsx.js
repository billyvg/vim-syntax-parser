describe('JSX', function() {
  it('opening element', function() {
    testTypes('jsx-with-children', 'JSXOpeningElement', [
        [3, 4, 30],
    ]);
  });

  it('multiline opening element', function() {
    testTypes('jsx-with-children-multiline', 'JSXOpeningElement', [
        [3, 4, -1],
        [4, 0, -1],
        [5, 0, 5],
    ]);
  });

  it('closing element', function() {
    testTypes('jsx-with-children', 'JSXClosingElement', [
        [5, 4, 10],
    ]);
  });

  it('multiline closing element', function() {
    testTypes('jsx-with-children-multiline', 'JSXClosingElement', [
        [7, 4, -1],
        [8, 0, -1],
        [9, 0, 5],
    ]);
  });

  it('tag name', function() {
    testTypes('jsx-with-children', 'JSXElementName', [
        [3, 5, 8],
        [5, 6, 9],
    ]);
  });

  it('spread attributes, entire object expression', function() {
    testTypes('jsx-spread-props', 'JSXSpreadAttributeObjectExpression', [
        [4, 10, -1],
        [5, 0, -1],
        [6, 0, -1],
        [7, 0, -1],
        [8, 0, 7],
    ]);
  });

  it('spread attributes with spread object property', function() {
    testTypes('jsx-spread-props', 'JSXSpreadAttributeSpreadProperty', [
        [5, 9, 22],
    ]);
  });

  it('spread attributes, normal object properties', function() {
    testTypes('jsx-spread-props', 'JSXSpreadAttributeObjectProperty', [
        [6, 9, 30],
        [7, 9, 17],
    ]);
  });
});
