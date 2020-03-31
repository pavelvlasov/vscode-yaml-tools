"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_node_1 = require("./ast-node");
class PropertyASTNode extends ast_node_1.ASTNode {
    constructor(document, parent, key) {
        super(document, parent, "property", null, key.start, key.end);
        this.key = key;
        key.parent = this;
        key.location = key.value;
        this.colonOffset = -1;
    }
    getChildNodes() {
        return this.value ? [this.key, this.value] : [this.key];
    }
    getLastChild() {
        return this.value;
    }
    getLocation() {
        return this.key.location;
    }
    visit(visitor) {
        return (visitor(this) &&
            this.key.visit(visitor) &&
            this.value &&
            this.value.visit(visitor));
    }
    validate(schema, validationResult, matchingSchemas) {
        if (!matchingSchemas.include(this)) {
            return;
        }
        if (this.value) {
            this.value.validate(schema, validationResult, matchingSchemas);
        }
    }
}
exports.PropertyASTNode = PropertyASTNode;
//# sourceMappingURL=property-ast-node.js.map