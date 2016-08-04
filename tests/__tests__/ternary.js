describe('Ternary', function() {
  it('special chars (? and :)', function() {
    testTypes('ternary', 'TernaryOperator', [
        [1, 21, 24],
        [1, 29, 32],
    ]);
  });

  it('multiline - special chars (? and :)', function() {
    testTypes('ternary-multiline', 'TernaryOperator', [
        [1, 21, -1],
        [2, 0, 2],
        [2, 7, -1],
        [3, 0, -1],
        [4, 0, 2],
    ]);
  });
});
