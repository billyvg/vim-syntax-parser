'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = parse;

var _babylon = require('babylon');

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getColumnStart(node) {
  var columnStart = node.loc.start.column;

  return columnStart - 1 < 0 ? 0 : columnStart - 1;
}

function parseNode(node, overrideType) {
  if (!node) return;
  return {
    type: overrideType || node.type,
    lineStart: node.loc.start.line,
    lineEnd: node.loc.end.line,
    columnStart: node.loc.start.column,
    columnEnd: node.loc.end.column
  };
}

var BabylonVisitor = function BabylonVisitor(callback) {
  var expandMultiLines = function expandMultiLines(nodeObj) {
    if (!nodeObj) return;
    var lineStart = nodeObj.lineStart;
    var lineEnd = nodeObj.lineEnd;
    var columnStart = nodeObj.columnStart;
    var columnEnd = nodeObj.columnEnd;


    if (lineEnd === lineStart) {
      if (callback) {
        callback(null, nodeObj);
        return nodeObj;
      }
    } else {
      return _lodash2.default.range(lineEnd - lineStart + 1).map(function (i) {
        var startCol = i === 0 ? columnStart : 0;
        var endCol = i === lineEnd - lineStart ? columnEnd : -1;
        var line = lineStart + i;

        // Eliminate unnecessary hightlight groups
        // 1) if start === end === 0, nothing to hightlight
        // TODO: 2) if start === end === end, nothing to highlight
        if (startCol === endCol && startCol === 0) {} else {
          var newObj = _extends({}, nodeObj, {
            lineStart: line,
            lineEnd: line,
            columnStart: startCol,
            columnEnd: endCol
          });

          if (callback) {
            callback(null, newObj);
          }

          return newObj;
        }
      });
    }
  };

  // Given a list of nodes, takes start of first node -> end of last node
  var parseRange = function parseRange(type, nodes) {
    var rangeType = arguments.length <= 2 || arguments[2] === undefined ? 'inside' : arguments[2];

    if (nodes.length) {
      var firstObj = parseNode(_lodash2.default.first(nodes));
      var lastObj = parseNode(_lodash2.default.last(nodes));
      var lineStart = void 0;
      var lineEnd = void 0;
      var columnStart = void 0;
      var columnEnd = void 0;

      if (!lastObj || !firstObj) {
        console.log(nodes);
        return;
      }

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
        type: type,
        lineStart: lineStart,
        lineEnd: lineEnd,
        columnStart: columnStart,
        columnEnd: columnEnd
      });
    } else {
      throw new Error('`nodes` is an invalid or empty array');
    }
  };

  var parseOperator = function parseOperator(node) {
    var name = arguments.length <= 1 || arguments[1] === undefined ? 'Operator' : arguments[1];

    var left = void 0;
    var right = void 0;

    if (node.left && node.right) {
      left = node.left;
      right = node.right;
    } else if (node.id && node.init) {
      left = node.id;
      right = node.init;
    }

    if (left && right) {
      var leftNode = parseNode(left);
      var rightNode = parseNode(right);

      expandMultiLines({
        type: name,
        lineStart: leftNode.lineEnd,
        lineEnd: rightNode.lineStart,
        columnStart: leftNode.columnEnd,
        columnEnd: rightNode.columnStart
      }, callback);
    }
  };

  var visitor = {
    enter: function enter(path) {
      // If we have a visitor defined, then don't do anything
      if (visitor[path.node.type]) return;
      // console.log(path.node.type);
      callback(null, parseNode(path.node));
    },
    StringLiteral: function StringLiteral(path) {
      callback(null, parseNode(path.node));
    },
    TemplateLiteral: function TemplateLiteral(path) {
      var node = path.node;
      expandMultiLines(parseNode(node), callback);

      // Expressions inside of template literal
      if (node.expressions) {
        node.expressions.forEach(function (expressionNode) {
          callback(null, parseNode(expressionNode, 'TemplateLiteralExpression'));
        });
      }
    },
    AssignmentExpression: function AssignmentExpression(path) {
      parseOperator(path.node, 'AssignmentOperator');
    },
    LogicalExpression: function LogicalExpression(path) {
      parseOperator(path.node, 'LogicalOperator');
    },
    BinaryExpression: function BinaryExpression(path) {
      parseOperator(path.node, 'BinaryOperator');
    },
    ImportDeclaration: function ImportDeclaration(path) {
      var node = path.node;
      var firstSpecifier = _lodash2.default.first(node.specifiers);
      var lastSpecifier = _lodash2.default.last(node.specifiers);

      parseRange('ImportDeclaration', [node, firstSpecifier], 'left');

      // In between specifiers
      node.specifiers.forEach(function (specifier, i) {
        if (node.specifiers[i + 1]) {
          parseRange('ImportDeclaration', [specifier, node.specifiers[i + 1]], 'middle');
        }
      });

      parseRange('ImportDeclaration', [lastSpecifier, node.source], 'middle');
    },
    ImportSpecifier: function ImportSpecifier(path) {
      var node = path.node;
      var obj = parseNode(node);
      callback(null, obj);

      if (node.local && node.imported && node.local.start !== node.imported.start) {
        parseRange('ImportDeclaration', [node.imported, node.local], 'middle');
      }
    },
    ExportDefaultDeclaration: function ExportDefaultDeclaration(path) {
      var obj = parseNode(path.node);
      callback(null, _extends({}, obj, {
        columnEnd: getColumnStart(path.node.declaration)
      }));
    },
    ExportNamedDeclaration: function ExportNamedDeclaration(path) {
      var node = path.node;
      var obj = parseNode(node);

      if (node.declaration) {
        var decl = parseNode(node.declaration);
        expandMultiLines(_extends({}, obj, {
          lineEnd: decl.lineStart,
          columnEnd: decl.columnStart
        }), callback);
      } else if (node.specifiers && node.specifiers.length) {
        expandMultiLines(_extends({}, obj, {
          columnEnd: -1
        }), callback);
      }
    },
    Decorator: function Decorator(path) {
      var node = path.node;
      var obj = parseNode(node);

      expandMultiLines(obj, callback);

      // If `expression` is a `CallExpression`, then group all args as a type
      if (t.isCallExpression(node.expression)) {
        parseRange('DecoratorArguments', node.expression.arguments, 'inside');
      }
    },
    ClassMethod: function ClassMethod(path) {
      var node = path.node;
      var obj = parseNode(node);

      // Entire Class Method block
      callback(null, obj);

      // Class Method name
      if (t.isIdentifier(node.key)) {
        // keywords before method name i.e., `get`, `set`, `async`, `await`
        callback(null, _extends({}, obj, {
          type: 'ClassMethodKeyword',
          lineEnd: obj.lineStart,
          columnEnd: getColumnStart(node.key)
        }));

        callback(null, parseNode(node.key, 'ClassMethodIdentifier'));
      }

      if (node.params) {
        node.params.forEach(function (param) {
          callback(null, parseNode(param, 'ClassMethodParameter'));
        });
      }
    },
    ArrowFunctionExpression: function ArrowFunctionExpression(path) {
      var node = path.node;
      var obj = parseNode(node);

      // Arrow function expression `() =>`
      callback(null, _extends({}, obj, {
        columnEnd: getColumnStart(node.body)
      }));

      // parameters
      if (node.params) {
        node.params.forEach(function (param) {
          callback(null, parseNode(param, 'ArrowFunctionParameter'));
        });
      }

      if (node.body && t.isBlockStatement(node.body)) {
        var body = parseNode(node.body);

        // If arrow function expression has a block statement then add type for
        // beginning and ending curly brackets
        callback(null, _extends({}, body, {
          type: 'ArrowFunctionBlock',
          lineEnd: body.lineStart,
          columnEnd: body.columnStart + 1
        }));

        callback(null, _extends({}, body, {
          type: 'ArrowFunctionBlock',
          lineStart: body.lineEnd,
          columnStart: body.columnEnd - 1
        }));
      }
    },
    TypeAlias: function TypeAlias(path) {
      var obj = parseNode(path.node);
      var node = path.node;
      var typeKeywordColumnEnd = void 0;

      // Entire TypeAlias
      callback(null, obj);

      // type identifier
      // also use identifier start col as end col for type keyword
      if (node.id) {
        typeKeywordColumnEnd = getColumnStart(node.id);

        callback(null, _extends({}, parseNode(node.id), {
          type: 'TypeAliasIdentifier'
        }));
      }

      callback(null, _extends({}, obj, {
        type: 'TypeAliasKeyword',
        columnEnd: typeKeywordColumnEnd,
        lineEnd: obj.lineStart
      }));
    },
    GenericTypeAnnotation: function GenericTypeAnnotation(path) {
      var node = path.node;
      var obj = parseNode(node);

      // GenericTypeAnnotation
      callback(null, obj);

      // Identifier i.e. `Array` in `Array<string>`
      if (node.id) {
        callback(null, parseNode(node.id, 'GenericTypeAnnotationIdentifier'));
      }

      if (node.typeParameters) {
        node.typeParameters.params.forEach(function (param) {
          callback(null, parseNode(param, 'GenericTypeAnnotationParameter'));
        });
      }
    },
    ObjectTypeAnnotation: function ObjectTypeAnnotation(path) {
      var node = path.node;
      var obj = parseNode(node);

      // Default type
      callback(null, obj);

      callback(null, _extends({}, obj, {
        type: 'ObjectTypeAnnotationStartBracket',
        lineEnd: obj.lineStart,
        columnEnd: obj.columnStart + 1
      }));

      callback(null, _extends({}, obj, {
        type: 'ObjectTypeAnnotationEndBracket',
        lineStart: obj.lineEnd,
        columnStart: obj.columnEnd - 1
      }));
    },
    FunctionDeclaration: function FunctionDeclaration(path) {
      var node = path.node;
      var obj = parseNode(node);

      if (t.isIdentifier(node.id)) {
        var id = parseNode(node.id);
        callback(null, _extends({}, obj, {
          type: 'FunctionDeclarationKeyword',
          lineEnd: obj.lineStart,
          columnEnd: obj.lineStart === id.lineStart ? getColumnStart(node.id) : -1
        }));

        callback(null, parseNode(node.id, 'FunctionDeclarationIdentifier'));
      }

      if (node.params) {
        node.params.forEach(function (param) {
          expandMultiLines(parseNode(param, 'FunctionArgument'), callback);
        });
      }
    },
    AssignmentPattern: function AssignmentPattern(path) {
      var node = path.node;
      var obj = parseNode(path.node);

      if (node.left && node.right) {
        var left = parseNode(node.left);
        var right = parseNode(node.right);

        expandMultiLines({
          type: 'DefaultArgumentAssignmentOperator',
          lineStart: left.lineEnd,
          lineEnd: right.lineStart,
          columnStart: left.columnEnd,
          columnEnd: right.columnStart
        }, callback);

        callback(null, parseNode(node.right, 'DefaultArgument'));
      }
    },
    VariableDeclaration: function VariableDeclaration(path) {
      var obj = parseNode(path.node);
      var node = path.node;
      var columnEnd = void 0;

      // Column end should be at the start of the first VariableDeclarator
      if (node.declarations && node.declarations.length) {
        columnEnd = getColumnStart(node.declarations[0]);
      } else {
        columnEnd = -1;
      }

      callback(null, _extends({}, obj, {
        columnEnd: columnEnd
      }));
    },
    VariableDeclarator: function VariableDeclarator(path) {
      parseOperator(path.node || path, 'AssignmentOperator', callback);
    },
    ReturnStatement: function ReturnStatement(path) {
      var node = path.node;
      var obj = parseNode(node, 'ReturnKeyword');
      callback(null, _extends({}, obj, {
        columnEnd: obj.columnStart + 7
      }));
    },


    Identifier: {
      enter: function enter(path) {
        callback(null, parseNode(path.node));
      },
      exit: function exit(path) {
        // Class methods are treated differently
        if (path.parent && path.parent.type !== 'ClassMethod' && path.parent.type !== 'FunctionDeclaration') {
          var type = path.parent.type + 'Identifier';
          callback(null, parseNode(path.node, type));
        }
      }
    },

    ConditionalExpression: function ConditionalExpression(path) {
      var node = path.node;
      var obj = parseNode(node);

      // Default
      callback(null, obj);

      var test = parseNode(node.test);
      var consequent = parseNode(node.consequent);
      var alternate = parseNode(node.alternate);

      // ?
      expandMultiLines({
        type: 'TernaryOperator',
        lineStart: test.lineEnd,
        lineEnd: consequent.lineStart,
        columnStart: test.columnEnd,
        columnEnd: consequent.columnStart
      }, callback);

      // :
      expandMultiLines({
        type: 'TernaryOperator',
        lineStart: consequent.lineEnd,
        lineEnd: alternate.lineStart,
        columnStart: consequent.columnEnd,
        columnEnd: alternate.columnStart
      }, callback);
    },
    JSXOpeningElement: function JSXOpeningElement(path) {
      var node = path.node;
      var obj = parseNode(node);
      var nameObj = void 0;
      var lastArg = void 0;

      // Opening element start is always 1 char
      callback(null, _extends({}, obj, {
        columnEnd: obj.columnStart + 1,
        lineEnd: obj.lineStart
      }));

      if (node.name) {
        nameObj = parseNode(node.name, 'JSXElementName');
        callback(null, nameObj);
      }

      if (node.attributes && node.attributes.length) {
        lastArg = parseNode(node.attributes[node.attributes.length - 1]);
      } else {
        lastArg = nameObj;
      }

      expandMultiLines(_extends({}, obj, {
        columnStart: lastArg.columnEnd,
        lineStart: lastArg.lineEnd
      }), callback);
    },
    JSXClosingElement: function JSXClosingElement(path) {
      var node = path.node;
      var obj = parseNode(node);

      if (node.name) {
        var nameObj = parseNode(node.name, 'JSXElementName');
        callback(null, nameObj);

        // First char of closing element
        expandMultiLines(_extends({}, obj, {
          columnEnd: nameObj.columnStart,
          lineEnd: nameObj.lineStart
        }), callback);

        // Last char of closing element
        callback(null, _extends({}, obj, {
          columnStart: obj.columnEnd - 1,
          lineStart: obj.lineEnd
        }));
      }
    },
    JSXSpreadAttribute: function JSXSpreadAttribute(path) {
      var node = path.node;
      var obj = parseNode(node);

      callback(null, obj);

      if (node.argument && t.isObjectExpression(node.argument)) {
        expandMultiLines(parseNode(node.argument, 'JSXSpreadAttributeObjectExpression'), callback);

        node.argument.properties.forEach(function (property) {
          var propObj = parseNode(property, '' + node.type + property.type);
          callback(null, propObj);
        });
      }
    },
    JSXAttribute: function JSXAttribute(path) {
      var node = path.node;
      var obj = parseNode(node);

      if (node.value) {
        var valueObj = parseNode(node.value, 'JSXAttributeValue');
        // Everything up to attribute value
        expandMultiLines(_extends({}, obj, {
          columnEnd: valueObj.columnStart,
          lineEnd: valueObj.lineStart
        }), callback);

        // Attribute value
        callback(null, valueObj);
      } else {
        // attribute without a value
        callback(null, obj);
      }
    },
    JSXExpressionContainer: function JSXExpressionContainer(path) {
      var node = path.node;
      var obj = parseNode(node);

      callback(null, obj);

      // Container start
      callback(null, _extends({}, obj, {
        type: 'JSXExpressionContainerStart',
        lineEnd: obj.lineStart,
        columnEnd: obj.columnStart + 1
      }));

      // Container end
      callback(null, _extends({}, obj, {
        type: 'JSXExpressionContainerEnd',
        lineStart: obj.lineEnd,
        columnStart: obj.columnEnd - 1
      }));

      // Expression
      callback(null, parseNode(node.expression, 'JSXExpression'));
    }
  };

  return visitor;
};

function parse(source) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return new Promise(function (resolve, reject) {
    try {
      (function () {
        var results = [];
        var cb = function cb(err, result) {
          results.push(result);
        };
        var ast = (0, _babylon.parse)(source, {
          sourceType: 'module',
          plugins: options.plugins || ['jsx', 'flow', 'decorators', 'objectRestSpread', 'classProperties']
        });

        var visitor = BabylonVisitor(cb);

        (0, _babelTraverse2.default)(ast, visitor);

        // Only parse `=>` from tokens for now
        ast.tokens.filter(function (token) {
          return token.type.label === '=>';
        }).forEach(function (token) {
          return cb(null, parseNode(token, 'ArrowFunctionExpressionToken'));
        });

        resolve(results);
      })();
    } catch (err) {
      reject(err);
    }
  });
}