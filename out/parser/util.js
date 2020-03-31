"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_1 = require("./json");
exports.findProperty = (objectNode, predicate) => {
    if (!objectNode) {
        return;
    }
    return objectNode.getChildNodes().find((node) => {
        return node.type === "property" && predicate(node);
    });
};
exports.getPropertyNodeValue = (propertyNode, location) => {
    if (!propertyNode) {
        return;
    }
    return propertyNode.getChildNodes().find((node) => {
        return node instanceof json_1.ObjectASTNode && node.location === location;
    });
};
//# sourceMappingURL=util.js.map