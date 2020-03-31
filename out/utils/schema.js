"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
exports.getLastDescription = (path, schema) => {
    let description = undefined;
    getSectionRecursive(path, schema, (schemaNode) => {
        if (schemaNode && schemaNode.description) {
            description = schemaNode.description;
        }
    });
    return description;
};
exports.getSection = (path, schema) => {
    return getSectionRecursive(path, schema);
};
const getSectionRecursive = (path, schema, visitor = lodash_1.noop) => {
    visitor(schema);
    if (!schema || path.length === 0) {
        return schema;
    }
    // independently process each "oneOf" entry to see if our path matches any of them
    if (schema.oneOf && Array.isArray(schema.oneOf)) {
        for (const oneOfEntry of schema.oneOf) {
            const result = getSectionRecursive(path.slice(), oneOfEntry, visitor);
            if (result) {
                // found a match, no need to look further
                return result;
            }
        }
        return null;
    }
    const next = path.shift();
    if (!next) {
        return null;
    }
    if (schema.properties && schema.properties[next]) {
        return getSectionRecursive(path, schema.properties[next], visitor);
    }
    else if (schema.patternProperties) {
        Object.keys(schema.patternProperties).forEach((pattern) => {
            const regex = new RegExp(pattern);
            if (regex.test(next)) {
                return getSectionRecursive(path, schema.patternProperties[pattern], visitor);
            }
        });
    }
    else if (schema.additionalProperties) {
        return getSectionRecursive(path, schema.additionalProperties, visitor);
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    }
    else if (next.match("[0-9]+")) {
        if (schema.items) {
            return getSectionRecursive(path, schema.items, visitor);
        }
        else if (Array.isArray(schema.items)) {
            try {
                const index = parseInt(next, 10);
                if (schema.items[index]) {
                    return getSectionRecursive(path, schema.items[index], visitor);
                }
                return null;
            }
            catch (err) {
                return null;
            }
        }
    }
    return null;
};
//# sourceMappingURL=schema.js.map