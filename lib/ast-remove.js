/**
 * Created by azu on 2014/03/09.
 * LICENSE : MIT
 */
"use strict";
var estraverse = require("estraverse");
var _ = require("lodash");
module.exports = function (ast, removeNode) {
    estraverse.replace(ast, {
        enter: function (node, parent) {
            _.forEach(parent.body, function (currentNode, iterator) {
                if (currentNode === removeNode) {
                    parent.body.splice(iterator, 1);
                }
            });
        }
    });
};