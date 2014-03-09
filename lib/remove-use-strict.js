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
var _ = require("lodash");
var IGNORE_MARK = "× / _ / × < 来週も見てくださいね";
function createHelper(src) {
    return {
        // "use strict"
        isStringLiteral: function (node) {
            return node.type === estraverse.Syntax.ExpressionStatement &&
                node.expression.type === estraverse.Syntax.Literal &&
                typeof node.expression.value === "string";
        },
        getCodeFromRange: function (range) {
            if (!src || !range) {
                return null;
            }
            return src.substring(range[0], range[1]);
        }

    }
}

var defaultOptions = {
    force: false // force remove all
};

function removeUseStrict(src, opts) {
    var esprimaOptions = { raw: true, range: true, tokens: true, comment: true };
    var ast = esprima.parse(src, esprimaOptions);
    if (esprimaOptions.comment == true) {
        try {
            ast = require("escodegen").attachComments(ast, ast.comments, ast.tokens);
        } catch (e) {
        }
    }
    return escodegen.generate(removeUseStrictFromAST(ast, src, opts), {
        comment: esprimaOptions.comment,
        verbatim: "x-verbatim-property"
    });
}
/**
 *
 * @param {object} ast
 * @param {object} opts
 * @returns {object} ast
 */
function removeUseStrictFromAST(ast, source, opts) {
    var options = _.merge(defaultOptions, opts);
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
            if (options.force) {
                return false;
            }
            return scope.every(function (ele) {
                return ele !== IGNORE_MARK;
            });
        }
    };
    var helper = createHelper(source);

    function handleExpressionStatement(node, parent) {
        scopeChain.actionOnCurrentScope(function (scope) {
            if (helper.isStringLiteral(node)) {
                var value = node.expression.value;
                scope.push(value);
                if (!scopeChain.isCurrentDirectivePrologue(scope) && value === "use strict") {
                    astRemove(parent, node);
                }
            } else {
                scope.push(IGNORE_MARK);
            }
        });
    }

    // for escodegen format issue
    // https://twitter.com/azu_re/status/442619373635657728
    // https://twitter.com/constellation/status/442619849617833984
    function embedVerbatim(node) {
        var embed = helper.getCodeFromRange(node.range);
        if (embed) {
            node["x-verbatim-property"] = {
                content : embed,
                precedence : escodegen.Precedence.Primary
            }
        }
    }

    function defaultAction(node, parent) {
        scopeChain.actionOnCurrentScope(function (scope) {
            scope.push(IGNORE_MARK);
        });
    }

    estraverse.traverse(ast, {
        enter: function enter(node, parent) {
            var fn = {
                "ArrayExpression": embedVerbatim,
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