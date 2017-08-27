describe('Functions', () => {
  describe('single-line', () => {
    let results;
    beforeAll(async function() {
      results = await parseFile('function-declaration');
    });

    test('function declaration keyword', () => {
      testTypes(results, 'FunctionDeclarationKeyword', [
          [1, 0, 8],
      ]);
    });

    test('function declaration identifier (name)', () => {
      testTypes(results, 'FunctionDeclarationIdentifier', [
          [1, 9, 12],
      ]);
    });

    test('default arguments', () => {
      testTypes(results, 'FunctionArgument', [
          [1, 13, 25],
          [1, 27, 46],
          [1, 48, 57],
      ]);
    });

    test('default arguments assignment operator', () => {
      testTypes(results, 'DefaultArgumentAssignmentOperator', [
          [1, 16, 19],
          [1, 31, 32],
      ]);
    });

    test('default arguments value', () => {
      testTypes(results, 'DefaultArgument', [
          [1, 19, 25],
          [1, 32, 46],
      ]);
    });

    test('return statement', () => {
      testTypes(results, 'ReturnKeyword', [
        [2, 2, 9],
      ]);
    });
  });

  describe('multi-line', () => {
    let results;
    beforeAll(async function() {
      results = await parseFile('function-declaration-multiline');
    });

    test('function declaration keyword', () => {
      testTypes(results, 'FunctionDeclarationKeyword', [
          [1, 0, -1],
      ]);
    });

    test('function declaration identifier (name)', () => {
      testTypes(results, 'FunctionDeclarationIdentifier', [
          [2, 2, 5],
      ]);
    });

    test('default arguments', () => {
      testTypes(results, 'FunctionArgument', [
          [3, 4, -1],
          [4, 0, 14],
          [5, 4, -1],
          [6, 0, 20],
          [7, 4, 13],
      ]);
    });

    test('default arguments assignment operator', () => {
      testTypes(results, 'DefaultArgumentAssignmentOperator', [
          [3, 7, -1],
          [4, 0, 8],
          [5, 8, -1],
          [6, 0, 6],
      ]);
    });
  });
});
