describe('Exports', function() {
  it('exports default', function() {
    testTypes('export-default', 'ExportDefaultDeclaration', [
        [1, 0, 14],
    ]);
  });

  it('named export', function() {
    testTypes('export-named', 'ExportNamedDeclaration', [
        [1, 0, 7],
    ]);
  });

  it('specifiers', function() {
    // entire export block
    testTypes('export-specifiers', 'ExportNamedDeclaration', [
        [1, 0, -1],
        [2, 0, -1],
        [3, 0, -1],
        [4, 0, -1],
        [6, 0, -1],
    ]);
  });

  it('export function inline', function() {
    // entire export block
    testTypes('export-function-inline', 'ExportNamedDeclaration', [
        [1, 0, 7],
    ]);
  });
});
