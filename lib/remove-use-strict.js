/**
 * Created by azu on 2014/03/09.
 * LICENSE : MIT
 */
"use strict";
var falafel = require('falafel');
var estraverse = require("estraverse");
var esprima = require("esprima");
var escodegen = require("escodegen");
var astRemove = require("./ast-remove");
var IGNORE_MARK = "---";
function createHelper() {
    return {
        // var add = require("./add")
        isStringLiteral: function (node) {
            return node.type === estraverse.Syntax.ExpressionStatement &&
                node.expression.type === estraverse.Syntax.Literal &&
                typeof node.expression.value === "string";
        }
    }
}

function removeUseStrict(src, opts) {
    var esprimaOptions = { range: true, tokens: true, comment: true };
    var ast = esprima.parse(src, esprimaOptions);
    if (esprimaOptions.comment == true) {
        try {
            ast = require("escodegen").attachComments(ast, ast.comments, ast.tokens);
        } catch (e) {
        }
    }
    return escodegen.generate(removeUseStrictFromAST(ast, opts), {comment: esprimaOptions.comment});
}
/**
 *
 * @param {object} ast
 * @param {object} opts
 * @returns {object} ast
 */
function removeUseStrictFromAST(ast, opts) {
    var scopeChain = {
        _scopes: [],
        pushBlock: function pushBlock() {
            scopeChain._scopes.push([]);
        },
        popBlock: function popBlock() {
            scopeChain._scopes.pop()
        },
        actionOnCurrentScope: function (action) {
            var currentScope = scopeChain._scopes.pop();
            action(currentScope);
            scopeChain._scopes.push(currentScope);
        },
        /*
            [
                "use string;",
                "Directive Prologue",
                false
            ]
         */
        isCurrentDirectivePrologue: function (scope) {
            if (scope.length === 0) {
                return true;
            }
            return scope.every(function (ele) {
                return ele !== IGNORE_MARK;
            });
        }
    };
    var helper = createHelper();

    function handleExpressionStatement(node, parent) {
        scopeChain.actionOnCurrentScope(function (scope) {
            if (helper.isStringLiteral(node)) {
                scope.push(node.expression.value);
                if (!scopeChain.isCurrentDirectivePrologue(scope)) {
                    astRemove(parent, node);
                }
            } else {
                scope.push(IGNORE_MARK);
            }
        });
    }

    function defaultAction(node, parent) {
        scopeChain.actionOnCurrentScope(function (scope) {
            scope.push(IGNORE_MARK);
        });
    }

    estraverse.replace(ast, {
        enter: function enter(node, parent) {
            var fn = {
                "Program": scopeChain.pushBlock,
                "BlockStatement": scopeChain.pushBlock,
                "ExpressionStatement": handleExpressionStatement
            }[node.type];
            if (fn) {
                fn(node, parent);
            } else {
                defaultAction(node, parent);
            }
        },
        leave: function (node, parent) {
            var fn = {
                "Program": scopeChain.popBlock,
                "BlockStatement": scopeChain.popBlock
            }[node.type];
            if (fn) {
                fn(node, parent);
            }
        }

    });
    return ast;
}
module.exports = removeUseStrict;
module.exports.modifyAST = removeUseStrictFromAST;