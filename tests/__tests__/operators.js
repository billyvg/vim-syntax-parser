describe('Operators', function() {
  it('assignment', function() {
    testTypes('assignment-operator', 'AssignmentOperator', [
        [1, 9, 12],
    ]);
  });

  it('assignment multiline', function() {
    testTypes('assignment-operator-multiline', 'AssignmentOperator', [
        [1, 9, -1],
        [2, 0, -1],
        [5, 9, -1],
        [6, 0, 2],
        [8, 12, -1],
        [9, 0, 3],
    ]);
  });

  it('logical operator', function() {
    testTypes('logical-operator', 'LogicalOperator', [
        // Affected by order of operations
        [1, 13, 17],
        [1, 18, 22],
    ]);
  })

  it('binary operator', function() {
    testTypes('binary-operator', 'BinaryOperator', [
        // Affected by order of operations
        [1, 13, 16],
        [1, 22, 25],
    ]);
  })
});
