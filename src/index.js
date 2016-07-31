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

function expandMultiLines(nodeObj, callback) {
  const {
    lineStart,
    lineEnd,
    columnStart,
    columnEnd,
  } = nodeObj;

  if (lineEnd === lineStart) {
    if (callback) {
      callback(null, nodeObj);
      return nodeObj;
    }
  } else {
    return _.range(lineEnd - lineStart + 1).map((i) => {
      const startCol = i === 0 ? columnStart : 0;
      const endCol = i === lineEnd - lineStart ? columnEnd : -1;
      const line = lineStart + i;

      // Eliminate unnecessary hightlight groups
      // 1) if start === end === 0, nothing to hightlight
      // TODO: 2) if start === end === end, nothing to highlight
      if (startCol === endCol && startCol === 0) {
      } else {
        const newObj = {
          ...nodeObj,
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
      }
    });
  }
}

const BabylonVisitor = (callback) => {
  const parseOperator = (node, name = 'Operator', callback) => {
    let left;
    let right;

    if (node.left && node.right) {
      left = node.left;
      right = node.right;
    } else if (node.id && node.init) {
      left = node.id;
      right = node.init;
    }

    if (left && right) {
      const leftNode = parseNode(left);
      const rightNode = parseNode(right);

      expandMultiLines({
        type: name,
        lineStart: leftNode.lineEnd,
        lineEnd: rightNode.lineStart,
        columnStart: leftNode.columnEnd,
        columnEnd: rightNode.columnStart,
      }, callback);
    }
  };

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
      expandMultiLines(parseNode(node), callback);

      // Expressions inside of template literal
      if (node.expressions) {
        node.expressions.forEach((expressionNode) => {
          callback(null, parseNode(expressionNode, `TemplateLiteralExpression`));
        });
      }
    },

    AssignmentExpression(path) {
      parseOperator(path.node, 'AssignmentOperator', callback);
    },

    LogicalExpression(path) {
      parseOperator(path.node, 'LogicalOperator', callback);
    },

    BinaryExpression(path) {
      parseOperator(path.node, 'BinaryOperator', callback);
    },

    ImportDeclaration(path) {
      expandMultiLines(parseNode(path.node), callback);
    },

    ExportDefaultDeclaration(path) {
      const obj = parseNode(path.node);
      callback(null, {
        ...obj,
        ...{
          columnEnd: getColumnStart(path.node.declaration),
        },
      });
    },

    ExportNamedDeclaration(path) {
      const node = path.node;
      const obj = parseNode(node);

      if (node.declaration) {
        expandMultiLines({
          ...obj,
          ...{
            columnEnd: getColumnStart(node.declaration),
          },
        }, callback);
      } else if (node.specifiers && node.specifiers.length) {
        expandMultiLines({
          ...obj,
          ...{
            columnEnd: -1,
          },
        }, callback);
      }
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
            lineEnd: obj.lineStart,
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

    ArrowFunctionExpression(path) {
      const node = path.node;
      const obj = parseNode(node);

      // Arrow function expression `() =>`
      callback(null, {
        ...obj,
        ...{
          columnEnd: getColumnStart(node.body),
        },
      })

      // parameters
      if (node.params) {
        node.params.forEach((param) => {
          callback(null, parseNode(param, 'ArrowFunctionParameter'));
        });
      }

      if (node.body && t.isBlockStatement(node.body)) {
        const body = parseNode(node.body);

        // If arrow function expression has a block statement then add type for
        // beginning and ending curly brackets
        callback(null, {
          ...body,
          ...{
            type:  'ArrowFunctionBlock',
            lineEnd: body.lineStart,
            columnEnd: body.columnStart + 1,
          }
        });

        callback(null, {
          ...body,
          ...{
            type:  'ArrowFunctionBlock',
            lineStart: body.lineEnd,
            columnStart: body.columnEnd - 1,
          }
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

    FunctionDeclaration(path) {
      const node = path.node;
      const obj = parseNode(node);

      if (t.isIdentifier(node.id)) {
        const id = parseNode(node.id);
        console.log(id, obj.lineStart);
        callback(null, {
          ...obj,
          ...{
            type: 'FunctionDeclarationKeyword',
            lineEnd: obj.lineStart,
            columnEnd: obj.lineStart === id.lineStart ? getColumnStart(node.id) : -1,
          },
        });

        callback(null, parseNode(node.id, 'FunctionDeclarationIdentifier'));
      }

      if (node.params) {
        node.params.forEach((param) => {
          expandMultiLines(parseNode(param, 'FunctionArgument'), callback);
        });
      }
    },

    AssignmentPattern(path) {
      const node = path.node;
      const obj = parseNode(path.node);

      if (node.left && node.right) {
        const left = parseNode(node.left);
        const right = parseNode(node.right);

        expandMultiLines({
          type: 'DefaultArgumentAssignmentOperator',
          lineStart: left.lineEnd,
          lineEnd: right.lineStart,
          columnStart: left.columnEnd,
          columnEnd: right.columnStart,
        }, callback);

        callback(null, parseNode(node.right, 'DefaultArgument'));
      }
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

    VariableDeclarator(path) {
      parseOperator(path.node || path, 'AssignmentOperator', callback);
    },

    Identifier: {
      enter(path) {
        callback(null, parseNode(path.node));
      },
      exit(path) {
        // Class methods are treated differently
        if (path.parent &&
            path.parent.type !== 'ClassMethod' &&
            path.parent.type !== 'FunctionDeclaration') {
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

    JSXOpeningElement(path) {
      const node = path.node;
      const obj = parseNode(node);

      expandMultiLines(obj, callback);

      if (node.name) {
        callback(null, parseNode(node.name, 'JSXElementName'));
      }
    },

    JSXClosingElement(path) {
      const node = path.node;
      const obj = parseNode(node);

      expandMultiLines(obj, callback);

      if (node.name) {
        callback(null, parseNode(node.name, 'JSXElementName'));
      }
    },

    JSXAttribute(path) {
      const node = path.node;
      const obj = parseNode(node);

      callback(null, obj);

      if (node.value) {
        callback(null, parseNode(node.value, 'JSXAttributeValue'));
      }
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

  // Only parse `=>` for now
  ast.tokens
    .filter((token) => token.type.label === '=>')
    .forEach((token) => callback(null, parseNode(token, 'ArrowFunctionExpressionToken')));
};

