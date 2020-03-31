"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
exports.getNodeItemByKey = (node, key) => {
    if (node instanceof parser_1.ObjectASTNode) {
        return node.properties.find((property) => {
            return property.key.value === key;
        });
    }
    return;
};
//# sourceMappingURL=yaml.js.map