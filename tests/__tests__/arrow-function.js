describe('Arrow function', function() {
  it('one line expression', function() {
    testTypes('arrow-function-expression', 'ArrowFunctionExpression', [
        [1, 12, 26],
    ]);
  });

  it('parameters', function() {
    testTypes('arrow-function-expression', 'ArrowFunctionParameter', [
        [1, 13, 16],
        [1, 18, 22],
    ]);
  });

  it('with block (curly brackets)', function() {
    testTypes('arrow-function-expression-with-block', 'ArrowFunctionBlock', [
        [1, 27, 28],
        [3, 0, 1],
    ]);
  });
});
