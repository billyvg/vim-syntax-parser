describe('Class', function() {
  describe('Basic class', function() {
    let results;
    before(function() {
      results = global.parseFile('class');
    });

    it('class methods', function() {
      testTypes(results, 'ClassMethodIdentifier', [
          [2, 2, 13],
          [7, 2, 5],
          [10, 6, 10],
      ]);
    });

    it('class method parameters', function() {
      testTypes(results, 'ClassMethodParameter', [
          [2, 14, 26],
          [7, 6, 15],
          [7, 17, 26],
      ]);
    });
  });

  it('class method decorator with argument', function() {
    testTypes('class-method-decorator-with-argument', 'DecoratorArguments', [
        [2, 13, 21],
    ]);
  });
});
