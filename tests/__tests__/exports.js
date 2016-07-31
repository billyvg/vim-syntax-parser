describe('Exports', function() {
  it('exports default', function() {
    testTypes('export-default', 'ExportDefaultDeclaration', [
        [1, 0, 14],
    ]);
  });
});
