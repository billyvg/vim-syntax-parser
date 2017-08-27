describe('Operators', () => {
  test('assignment', () => {
    testTypes('assignment-operator', 'AssignmentOperator', [[1, 9, 12]]);
  });

  test('assignment multiline', () => {
    testTypes('assignment-operator-multiline', 'AssignmentOperator', [
      [1, 9, -1],
      [2, 0, -1],
      [5, 9, -1],
      [6, 0, 2],
      [8, 12, -1],
      [9, 0, 3],
    ]);
  });

  test('logical operator', () => {
    testTypes('logical-operator', 'LogicalOperator', [
      // Affected by order of operations
      [1, 13, 17],
      [1, 18, 22],
    ]);
  });

  test('binary operator', () => {
    testTypes('binary-operator', 'BinaryOperator', [
      // Affected by order of operations
      [1, 13, 16],
      [1, 22, 25],
    ]);
  });
});
