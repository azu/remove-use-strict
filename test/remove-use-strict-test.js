"use strict";
var assert = require("power-assert");
var parse = function (code) {
    var ast = require("esprima").parse(code, { range: true, tokens: true, comment: true });
    try {
        ast = require("escodegen").attachComments(ast, ast.comments, ast.tokens);
    } catch (e) {
    }
    return ast;
};
var deparse = function (ast) {
    return require("escodegen").generate(ast, {comment: true});
};
var rst = require("../lib/remove-use-strict");
describe("removeUseStrict", function () {
    context("when does not contain use strict", function () {
        var code = 'var a = 1;';
        it("should return  input string", function () {
            assert.deepEqual(rst(code), deparse(parse(code)));
        });
    });
    context("when contain delective prologue string", function () {
        it("should not remove use strict", function () {
            var code = '"use strict"\n' +
                'var a = 1;';
            assert.deepEqual(rst(code), deparse(parse(code)));
        });
        it("should remove all use strict", function () {
            var code = '"use strict";\n' +
                'function a(){ "use strict"; \n var a = "use strict"; }';
            assert.deepEqual(rst(code), deparse(parse(code)));
        });
    });
    context("with comment code", function () {
        it("should preserve coment", function () {
            var code = '"use strict";// test';
            assert(/test/.test(rst(code)));
        });
        it("should remove all unnecessary use strict", function () {
            var code = 'var a = 1;\n' +
                '"use strict";\n"use strict";';
            assert.deepEqual(rst(code), 'var a = 1;');
        });
    });
    context("when contain use strict which is not delective prologue", function () {
        it("should remove unnecessary use strict", function () {
            var code = 'var a = 1;\n' +
                '"use strict";';
            assert.deepEqual(rst(code), 'var a = 1;');
        });
        it("should remove all unnecessary use strict", function () {
            var code = 'var a = 1;\n' +
                '"use strict";\n"use strict";';
            assert.deepEqual(rst(code), 'var a = 1;');
        });
    });
    context("with duplicate use strict", function () {
        it("should remove the other one", function () {
            var code = '"use strict";\n'
                + '"use strict";'
                + '"use strict";'
                + 'var a = 1;';
            assert.deepEqual(rst(code), "'use strict';\nvar a = 1;");
        });
    });
    context("with force option", function () {
        it("should remove all use strict", function () {
            var code = '"use strict";\n' +
                'function a(){ "use strict"; \n var a = "use strict"; }';
            assert.deepEqual(rst(code, {
                force: true
            }), deparse(parse('function a(){  var a = "use strict"; }')));
        });
    });
    context("with format aray", function () {
        it("should preserve ArrayExpression []", function () {
            var code = 'fn([1,2,3]);';
            assert.deepEqual(rst(code), code);
        });
    });
});