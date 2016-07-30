describe('Variable Declarations', function() {
  it('identifies `var` declarations', function() {
    test('var-declaration', {
      type: 'VariableDeclaration',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 0,
      columnEnd: 3,
    });
  });

  it('identifies `const` declarations', function() {
    test('const-declaration', {
      type: 'VariableDeclaration',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 0,
      columnEnd: 5,
    });
  });

  it('identifies `let` declarations', function() {
    test('let-declaration', {
      type: 'VariableDeclaration',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 0,
      columnEnd: 3,
    });
  });
});
