describe('Functions', function() {
  describe('single-line', function() {
    let results;
    before(function() {
      results = parseFile('function-declaration');
    });

    it('function declaration keyword', function() {
      testTypes(results, 'FunctionDeclarationKeyword', [
          [1, 0, 8],
      ]);
    });

    it('function declaration identifier (name)', function() {
      testTypes(results, 'FunctionDeclarationIdentifier', [
          [1, 9, 12],
      ]);
    });

    it('default arguments', function() {
      testTypes(results, 'FunctionArgument', [
          [1, 13, 25],
          [1, 27, 46],
          [1, 48, 57],
      ]);
    });

    it('default arguments assignment operator', function() {
      testTypes(results, 'DefaultArgumentAssignmentOperator', [
          [1, 16, 19],
          [1, 31, 32],
      ]);
    });

    it('default arguments value', function() {
      testTypes(results, 'DefaultArgument', [
          [1, 19, 25],
          [1, 32, 46],
      ]);
    });

    it('return statement', function() {
      testTypes(results, 'ReturnKeyword', [
        [2, 2, 9],
      ]);
    });
  });

  describe('multi-line', function() {
    let results;
    before(function() {
      results = parseFile('function-declaration-multiline');
    });

    it('function declaration keyword', function() {
      testTypes(results, 'FunctionDeclarationKeyword', [
          [1, 0, -1],
      ]);
    });

    it('function declaration identifier (name)', function() {
      testTypes(results, 'FunctionDeclarationIdentifier', [
          [2, 2, 5],
      ]);
    });

    it('default arguments', function() {
      testTypes(results, 'FunctionArgument', [
          [3, 4, -1],
          [4, 0, 14],
          [5, 4, -1],
          [6, 0, 20],
          [7, 4, 13],
      ]);
    });

    it('default arguments assignment operator', function() {
      testTypes(results, 'DefaultArgumentAssignmentOperator', [
          [3, 7, -1],
          [4, 0, 8],
          [5, 8, -1],
          [6, 0, 6],
      ]);
    });
  });
});
