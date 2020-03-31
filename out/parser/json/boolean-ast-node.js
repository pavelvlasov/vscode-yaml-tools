"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_node_1 = require("./ast-node");
class BooleanASTNode extends ast_node_1.ASTNode {
    constructor(document, parent, name, value, start, end) {
        super(document, parent, "boolean", name, start, end);
        this.value = value;
    }
    getValue() {
        return this.value;
    }
}
exports.BooleanASTNode = BooleanASTNode;
//# sourceMappingURL=boolean-ast-node.js.map