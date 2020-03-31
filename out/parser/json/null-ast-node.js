"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_node_1 = require("./ast-node");
class NullASTNode extends ast_node_1.ASTNode {
    constructor(document, parent, name, start, end) {
        super(document, parent, "null", name, start, end);
    }
}
exports.NullASTNode = NullASTNode;
//# sourceMappingURL=null-ast-node.js.map