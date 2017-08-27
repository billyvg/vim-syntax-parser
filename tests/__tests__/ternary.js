describe('Ternary', () => {
  test('special chars (? and :)', () => {
    testTypes('ternary', 'TernaryOperator', [[1, 21, 24], [1, 29, 32]]);
  });

  test('multiline - special chars (? and :)', () => {
    testTypes('ternary-multiline', 'TernaryOperator', [
      [1, 21, -1],
      [2, 0, 2],
      [2, 7, -1],
      [3, 0, -1],
      [4, 0, 2],
    ]);
  });
});
