describe('Ternary', function() {
  let results;
  before(function() {
    results = global.parseFile('ternary');
  });

  it('special chars (? and :)', function() {
    testTypes(results, 'TernaryOperator', [
        [1, 21, 24],
        [1, 29, 32],
    ]);
  });
});
