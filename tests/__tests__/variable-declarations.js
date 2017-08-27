describe('Variable Declarations', () => {
  test('identifies `var` declarations', () => {
    test('var-declaration', {
      type: 'VariableDeclaration',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 0,
      columnEnd: 3,
    });
  });

  test('identifies `const` declarations', () => {
    test('const-declaration', {
      type: 'VariableDeclaration',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 0,
      columnEnd: 5,
    });
  });

  test('identifies `let` declarations', () => {
    test('let-declaration', {
      type: 'VariableDeclaration',
      lineStart: 1,
      lineEnd: 1,
      columnStart: 0,
      columnEnd: 3,
    });
  });
});
