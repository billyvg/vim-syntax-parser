describe('Arrow function', () => {
  test('one line expression', () => {
    testTypes('arrow-function-expression', 'ArrowFunctionExpression', [
        [1, 12, 26],
    ]);
  });

  test('parameters', () => {
    testTypes('arrow-function-expression', 'ArrowFunctionParameter', [
        [1, 13, 16],
        [1, 18, 22],
    ]);
  });

  test('with block (curly brackets)', () => {
    testTypes('arrow-function-expression-with-block', 'ArrowFunctionBlock', [
        [1, 27, 28],
        [3, 0, 1],
    ]);
  });
});
