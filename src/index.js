import { parse as babylonParse } from 'babylon';
import * as t from 'babel-types';
import traverse from 'babel-traverse';
import _ from 'lodash';

function getColumnStart(node) {
  const columnStart = node.loc.start.column;

  return columnStart - 1 < 0 ? 0 : columnStart - 1;
}


function parseNode(node, overrideType) {
  return {
    type: overrideType || node.type,
    lineStart: node.loc.start.line,
    lineEnd: node.loc.end.line,
    columnStart: node.loc.start.column,
    columnEnd: node.loc.end.column,
  };
}

function expandMultiLines(path, callback) {
  const obj = parseNode(path.node);
  const {
    lineStart,
    lineEnd,
    columnStart,
    columnEnd,
  } = obj;

  return _.range(lineEnd - lineStart + 1).map((i) => {
    const startCol = i === 0 ? columnStart : 0;
    const endCol = i === lineEnd - lineStart ? columnEnd : -1;
    const line = lineStart + i;

    const newObj = {
      ...obj,
      ...{
        lineStart: line,
        lineEnd: line,
        columnStart: startCol,
        columnEnd: endCol,
      },
    };

    if (callback) {
      callback(null, newObj);
    }

    return newObj;
  });
}

const BabylonVisitor = (callback) => {
  const visitor = {
    enter(path) {
      // If we have a visitor defined, then don't do anything
      if (visitor[path.node.type]) return;
      // console.log(path.node.type);
      callback(null, parseNode(path.node));
    },

    StringLiteral(path) {
      callback(null, parseNode(path.node));
    },

    TemplateLiteral(path) {
      const node = path.node;
      expandMultiLines(path, callback);

      // Expressions inside of template literal
      if (node.expressions) {
        node.expressions.forEach((expressionNode) => {
          callback(null, parseNode(expressionNode, `TemplateLiteralExpression`));
        });
      }
    },

    ImportDeclaration(path) {
      expandMultiLines(path, callback);
    },

    ClassMethod(path) {
      const node = path.node;
      const obj = parseNode(path.node);

      // Entire Class Method block
      callback(null, obj);

      // Class Method name
      if (t.isIdentifier(node.key)) {
        // keywords before method name i.e., `get`, `set`, `async`, `await`
        callback(null, {
          ...obj,
          ...{
            type: 'ClassMethodKeyword',
            columnEnd: getColumnStart(node.key),
          },
        });

        callback(null, parseNode(node.key, 'ClassMethodIdentifier'));
      }

      if (node.params) {
        node.params.forEach((param) => {
          callback(null, parseNode(param, 'ClassMethodParameter'));
        });
      }
    },

    TypeAlias(path) {
      const obj = parseNode(path.node);
      const node = path.node;
      let typeKeywordColumnEnd;

      // Entire TypeAlias
      callback(null, obj);

      // type identifier
      // also use identifier start col as end col for type keyword
      if (node.id) {
        typeKeywordColumnEnd = getColumnStart(node.id);

        callback(null, {
          ...parseNode(node.id),
          ...{
            type: 'TypeAliasIdentifier',
          },
        });
      }

      callback(null, {
        ...obj,
        type: 'TypeAliasKeyword',
        columnEnd: typeKeywordColumnEnd,
        lineEnd: obj.lineStart,
      });
    },

    GenericTypeAnnotation(path) {
      const node = path.node;
      const obj = parseNode(node);

      // GenericTypeAnnotation
      callback(null, obj);

      // Identifier i.e. `Array` in `Array<string>`
      if (node.id) {
        callback(null, parseNode(node.id, 'GenericTypeAnnotationIdentifier'));
      }

      if (node.typeParameters) {
        node.typeParameters.params.forEach((param) => {
          callback(null, parseNode(param, 'GenericTypeAnnotationParameter'));
        });
      }
    },

    ObjectTypeAnnotation(path) {
      const node = path.node
      const obj = parseNode(node);

      // Default type
      callback(null, obj);

      callback(null, {
        ...obj,
        ...{
          type: 'ObjectTypeAnnotationStartBracket',
          lineEnd: obj.lineStart,
          columnEnd: obj.columnStart + 1,
        },
      });

      callback(null, {
        ...obj,
        ...{
          type: 'ObjectTypeAnnotationEndBracket',
          lineStart: obj.lineEnd,
          columnStart: obj.columnEnd - 1,
        },
      });
    },

    VariableDeclaration(path) {
      const obj = parseNode(path.node);
      const node = path.node;
      let columnEnd;

      // Column end should be at the start of the first VariableDeclarator
      if (node.declarations && node.declarations.length) {
        columnEnd = getColumnStart(node.declarations[0]);
      } else {
        columnEnd = -1;
      }

      callback(null, {
        ...obj,
        ...{
          columnEnd,
        },
      });
    },

    Identifier: {
      enter(path) {
        callback(null, parseNode(path.node));
      },
      exit(path) {
        // Class methods are treated differently
        if (path.parent && path.parent.type !== 'ClassMethod') {
          const type = `${path.parent.type}Identifier`;
          callback(null, parseNode(path.node, type));
        }
      },
    },

    ConditionalExpression(path) {
      const node = path.node;
      const obj = parseNode(node);

      // Default
      callback(null, obj);

      const test = parseNode(node.test);
      const consequent = parseNode(node.consequent);
      const alternate = parseNode(node.alternate);

      // ?
      callback(null, {
        type: 'TernaryOperator',
        lineStart: obj.lineStart,
        lineEnd: obj.lineStart,
        columnStart: test.columnEnd,
        columnEnd: consequent.columnStart,
      });

      // :
      callback(null, {
        type: 'TernaryOperator',
        lineStart: obj.lineStart,
        lineEnd: obj.lineStart,
        columnStart: consequent.columnEnd,
        columnEnd: alternate.columnStart,
      });

    },

  };


  return visitor;
};

export default function parse(source, options = {}, callback) {
  if (typeof callback !== 'function') {
    throw new Error('Callback required');
  }

  const ast = babylonParse(source, {
    sourceType: 'module',
    plugins: options.plugins || [
      'jsx',
      'flow',
      'decorators',
      'objectRestSpread',
      'classProperties',
    ],
  });

  const visitor = BabylonVisitor(callback);

  traverse(ast, visitor);
};

