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
  return {
    type: overrideType || node.type,
    lineStart: node.loc.start.line,
    lineEnd: node.loc.end.line,
    columnStart: node.loc.start.column,
    columnEnd: node.loc.end.column
  };
}

function expandMultiLines(path, callback) {
  var obj = parseNode(path.node);
  var lineStart = obj.lineStart;
  var lineEnd = obj.lineEnd;
  var columnStart = obj.columnStart;
  var columnEnd = obj.columnEnd;


  return _lodash2.default.range(lineEnd - lineStart + 1).map(function (i) {
    var startCol = i === 0 ? columnStart : 0;
    var endCol = i === lineEnd - lineStart ? columnEnd : -1;
    var line = lineStart + i;

    var newObj = _extends({}, obj, {
      lineStart: line,
      lineEnd: line,
      columnStart: startCol,
      columnEnd: endCol
    });

    if (callback) {
      callback(null, newObj);
    }

    return newObj;
  });
}

var BabylonVisitor = function BabylonVisitor(callback) {
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
      expandMultiLines(path, callback);

      // Expressions inside of template literal
      if (node.expressions) {
        node.expressions.forEach(function (expressionNode) {
          callback(null, parseNode(expressionNode, 'TemplateLiteralExpression'));
        });
      }
    },
    ImportDeclaration: function ImportDeclaration(path) {
      expandMultiLines(path, callback);
    },
    ClassMethod: function ClassMethod(path) {
      var node = path.node;
      var obj = parseNode(path.node);

      // Entire Class Method block
      callback(null, obj);

      // Class Method name
      if (t.isIdentifier(node.key)) {
        // keywords before method name i.e., `get`, `set`, `async`, `await`
        callback(null, _extends({}, obj, {
          type: 'ClassMethodKeyword',
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


    Identifier: {
      enter: function enter(path) {
        callback(null, parseNode(path.node));
      },
      exit: function exit(path) {
        // Class methods are treated differently
        if (path.parent && path.parent.type !== 'ClassMethod') {
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
      callback(null, {
        type: 'TernaryOperator',
        lineStart: obj.lineStart,
        lineEnd: obj.lineStart,
        columnStart: test.columnEnd,
        columnEnd: consequent.columnStart
      });

      // :
      callback(null, {
        type: 'TernaryOperator',
        lineStart: obj.lineStart,
        lineEnd: obj.lineStart,
        columnStart: consequent.columnEnd,
        columnEnd: alternate.columnStart
      });
    }
  };

  return visitor;
};

function parse(source) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var callback = arguments[2];

  if (typeof callback !== 'function') {
    throw new Error('Callback required');
  }

  var ast = (0, _babylon.parse)(source, {
    sourceType: 'module',
    plugins: options.plugins || ['jsx', 'flow', 'decorators', 'objectRestSpread', 'classProperties']
  });

  var visitor = BabylonVisitor(callback);

  (0, _babelTraverse2.default)(ast, visitor);
};