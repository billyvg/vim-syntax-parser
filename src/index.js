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

const BabylonVisitor = (callback) => {
  const expandMultiLines = (nodeObj) => {
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
  };

  // Given a list of nodes, takes start of first node -> end of last node
  const parseRange = (type, nodes, rangeType = 'inside') => {
    if (nodes.length) {
      const firstObj = parseNode(_.first(nodes));
      const lastObj = parseNode(_.last(nodes));
      let lineStart;
      let lineEnd;
      let columnStart;
      let columnEnd;

      if (rangeType === 'left') {
        // start of first node until start of last node
        lineStart = firstObj.lineStart;
        lineEnd = lastObj.lineStart;
        columnStart = firstObj.columnStart;
        columnEnd = lastObj.columnStart;
      } else if (rangeType === 'middle') {
        // end of first node until start of last node
        lineStart = firstObj.lineEnd;
        lineEnd = lastObj.lineStart;
        columnStart = firstObj.columnEnd;
        columnEnd = lastObj.columnStart;
      } else {
        // default is start of first node until end of last node
        lineStart = firstObj.lineStart;
        lineEnd = lastObj.lineEnd;
        columnStart = firstObj.columnStart;
        columnEnd = lastObj.columnEnd;
      }

      return expandMultiLines({
        type,
        lineStart,
        lineEnd,
        columnStart,
        columnEnd,
      });
    } else {
      throw new Error('`nodes` is an invalid or empty array');
    }
  };

  const parseOperator = (node, name = 'Operator') => {
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
      parseOperator(path.node, 'AssignmentOperator');
    },

    LogicalExpression(path) {
      parseOperator(path.node, 'LogicalOperator');
    },

    BinaryExpression(path) {
      parseOperator(path.node, 'BinaryOperator');
    },

    ImportDeclaration(path) {
      const node = path.node;
      const firstSpecifier = _.first(node.specifiers);
      const lastSpecifier = _.last(node.specifiers);

      parseRange('ImportDeclaration', [
        node, firstSpecifier,
      ], 'left');

      // In between specifiers
      node.specifiers.forEach((specifier, i) => {
        if (node.specifiers[i + 1]) {
          parseRange('ImportDeclaration', [
            specifier, node.specifiers[i + 1]
          ], 'middle');
        }
      });

      parseRange('ImportDeclaration', [
        lastSpecifier, node.source,
      ], 'middle');

    },

    ImportSpecifier(path) {
      const node = path.node;
      const obj = parseNode(node);
      callback(null, obj);

      if (node.local && node.imported && node.local.start !== node.imported.start) {
        parseRange('ImportDeclaration', [
            node.imported, node.local
        ], 'middle');
      }
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
        const decl = parseNode(node.declaration);
        expandMultiLines({
          ...obj,
          ...{
            lineEnd: decl.lineStart,
            columnEnd: decl.columnStart,
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

    Decorator(path) {
      const node = path.node;
      const obj = parseNode(node);

      callback(null, obj);

      // If `expression` is a `CallExpression`, then group all args as a type
      if (t.isCallExpression(node.expression)) {
        parseRange('DecoratorArguments', node.expression.arguments, 'inside');
      }
    },

    ClassMethod(path) {
      const node = path.node;
      const obj = parseNode(node);

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

    ReturnStatement(path) {
      const node = path.node;
      const obj = parseNode(node, 'ReturnKeyword');
      callback(null, {
        ...obj,
        columnEnd: obj.columnStart + 7,
      });
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
      expandMultiLines({
        type: 'TernaryOperator',
        lineStart: test.lineEnd,
        lineEnd: consequent.lineStart,
        columnStart: test.columnEnd,
        columnEnd: consequent.columnStart,
      }, callback);

      // :
      expandMultiLines({
        type: 'TernaryOperator',
        lineStart: consequent.lineEnd,
        lineEnd: alternate.lineStart,
        columnStart: consequent.columnEnd,
        columnEnd: alternate.columnStart,
      }, callback);

    },

    JSXOpeningElement(path) {
      const node = path.node;
      const obj = parseNode(node);
      let nameObj;
      let lastArg;

      // Opening element start is always 1 char
      callback(null, {
        ...obj,
        columnEnd: obj.columnStart + 1,
        lineEnd: obj.lineStart,
      });

      if (node.name) {
        nameObj = parseNode(node.name, 'JSXElementName')
        callback(null, nameObj);
      }

      if (node.attributes && node.attributes.length) {
        lastArg = parseNode(node.attributes[node.attributes.length - 1]);
      } else {
        lastArg = nameObj;
      }

      expandMultiLines({
        ...obj,
        columnStart: lastArg.columnEnd,
        lineStart: lastArg.lineEnd,
      }, callback);
    },

    JSXClosingElement(path) {
      const node = path.node;
      const obj = parseNode(node);

      if (node.name) {
        const nameObj = parseNode(node.name, 'JSXElementName');
        callback(null, nameObj);

        // First char of closing element
        expandMultiLines({
          ...obj,
          columnEnd: nameObj.columnStart,
          lineEnd: nameObj.lineStart,
        }, callback);

        // Last char of closing element
        callback(null, {
          ...obj,
          columnStart: obj.columnEnd - 1,
          lineStart: obj.lineEnd,
        });
      }
    },

    JSXSpreadAttribute(path) {
      const node = path.node;
      const obj = parseNode(node);

      callback(null, obj);

      if (node.argument && t.isObjectExpression(node.argument)) {
        expandMultiLines(parseNode(node.argument, 'JSXSpreadAttributeObjectExpression'), callback);

        node.argument.properties.forEach((property) => {
          const propObj = parseNode(property, `${node.type}${property.type}`);
          callback(null, propObj);
        });
      }
    },

    JSXAttribute(path) {
      const node = path.node;
      const obj = parseNode(node);

      if (node.value) {
        const valueObj = parseNode(node.value, 'JSXAttributeValue');
        // Everything up to attribute value
        expandMultiLines({
          ...obj,
          columnEnd: valueObj.columnStart,
          lineEnd: valueObj.lineStart,
        }, callback)

        // Attribute value
        callback(null, valueObj);
      } else {
        // attribute without a value
        callback(null, obj);
      }
    },

    JSXExpressionContainer(path) {
      const node = path.node;
      const obj = parseNode(node);

      callback(null, obj);

      // Container start
      callback(null, {
        ...obj,
        type: 'JSXExpressionContainerStart',
        lineEnd: obj.lineStart,
        columnEnd: obj.columnStart + 1,
      });

      // Container end
      callback(null, {
        ...obj,
        type: 'JSXExpressionContainerEnd',
        lineStart: obj.lineEnd,
        columnStart: obj.columnEnd - 1,
      });

      // Expression
      callback(null, parseNode(node.expression, 'JSXExpression'));
    }
  };


  return visitor;
};

export default function parse(source, options = {}, callback, done) {
  if (typeof callback !== 'function') {
    throw new Error('Callback required');
  }

  try {
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

    // Only parse `=>` from tokens for now
    ast.tokens
      .filter((token) => token.type.label === '=>')
      .forEach((token) => callback(null, parseNode(token, 'ArrowFunctionExpressionToken')));

    if (typeof done === 'function') {
      done();
    }
  } catch(err) {
    callback(err);
  }
};

