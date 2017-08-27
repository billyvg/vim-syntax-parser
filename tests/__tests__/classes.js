describe('Class', () => {
  describe('Basic class', () => {
    let results;
    beforeAll(async function() {
      results = await global.parseFile('class');
    });

    test('class methods', () => {
      testTypes(results, 'ClassMethodIdentifier', [
          [2, 2, 13],
          [7, 2, 5],
          [10, 6, 10],
      ]);
    });

    test('class method parameters', () => {
      testTypes(results, 'ClassMethodParameter', [
          [2, 14, 26],
          [7, 6, 15],
          [7, 17, 26],
      ]);
    });
  });

  test('class method decorator with argument', () => {
    testTypes('class-method-decorator-with-argument', 'DecoratorArguments', [
        [2, 13, 21],
    ]);
  });
});
