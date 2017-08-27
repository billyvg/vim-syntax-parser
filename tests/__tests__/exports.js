describe('Exports', () => {
  test('exports default', () => {
    testTypes('export-default', 'ExportDefaultDeclaration', [
        [1, 0, 14],
    ]);
  });

  test('named export', () => {
    testTypes('export-named', 'ExportNamedDeclaration', [
        [1, 0, 7],
    ]);
  });

  test('specifiers', () => {
    // entire export block
    testTypes('export-specifiers', 'ExportNamedDeclaration', [
        [1, 0, -1],
        [2, 0, -1],
        [3, 0, -1],
        [4, 0, -1],
        [6, 0, -1],
    ]);
  });

  test('export function inline', () => {
    // entire export block
    testTypes('export-function-inline', 'ExportNamedDeclaration', [
        [1, 0, 7],
    ]);
  });
});
