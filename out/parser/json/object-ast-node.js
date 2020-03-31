"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_node_1 = require("./ast-node");
const localize_1 = require("./localize");
const property_ast_node_1 = require("./property-ast-node");
const validation_result_1 = require("./validation-result");
class ObjectASTNode extends ast_node_1.ASTNode {
    constructor(document, parent, name, start, end) {
        super(document, parent, "object", name, start, end);
        this.properties = [];
    }
    get value() {
        const value = Object.create(null);
        this.properties.forEach((prop) => {
            if (prop instanceof property_ast_node_1.PropertyASTNode &&
                prop.value instanceof ast_node_1.ASTNode) {
                const v = prop.value && prop.value.value;
                if (v !== undefined && prop.key.value) {
                    value[prop.key.value] = v;
                }
            }
        });
        return value;
    }
    getChildNodes() {
        return this.properties;
    }
    getLastChild() {
        return this.properties[this.properties.length - 1];
    }
    addProperty(node) {
        if (!node) {
            return false;
        }
        this.properties.push(node);
        return true;
    }
    getFirstProperty(key) {
        return this.properties.find((property) => {
            return property.key.value === key;
        });
    }
    getKeyList() {
        return this.properties.map((p) => p.key.value);
    }
    visit(visitor) {
        let ctn = visitor(this);
        for (let i = 0; i < this.properties.length && ctn; i++) {
            ctn = this.properties[i].visit(visitor);
        }
        return ctn;
    }
    validate(schema, validationResult, matchingSchemas) {
        if (!matchingSchemas.include(this)) {
            return;
        }
        super.validate(schema, validationResult, matchingSchemas);
        const seenKeys = Object.create(null);
        const unprocessedProperties = [];
        this.properties.forEach((node) => {
            const key = node.key.value;
            // Replace the merge key with the actual values of what the node value points to in seen keys
            if (key === "<<" && node.value) {
                switch (node.value.type) {
                    case "object": {
                        ;
                        node.value.properties.forEach((propASTNode) => {
                            const propKey = propASTNode.key.value;
                            if (propKey) {
                                seenKeys[propKey] = propASTNode.value;
                                unprocessedProperties.push(propKey);
                            }
                        });
                        break;
                    }
                    case "array": {
                        ;
                        node.value.items.forEach((sequenceNode) => {
                            if (sequenceNode instanceof ObjectASTNode) {
                                sequenceNode.properties.forEach((propASTNode) => {
                                    const seqKey = propASTNode.key.value;
                                    if (seqKey) {
                                        seenKeys[seqKey] =
                                            propASTNode.value;
                                        unprocessedProperties.push(seqKey);
                                    }
                                });
                            }
                        });
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
            else {
                if (key) {
                    seenKeys[key] = node.value;
                    unprocessedProperties.push(key);
                }
            }
        });
        if (Array.isArray(schema.required)) {
            schema.required.forEach((propertyName) => {
                if (!seenKeys[propertyName]) {
                    const key = this.parent &&
                        this.parent &&
                        this.parent.key;
                    const location = key
                        ? { start: key.start, end: key.end }
                        : { start: this.start, end: this.start + 1 };
                    validationResult.problems.push({
                        location,
                        severity: validation_result_1.ProblemSeverity.Warning,
                        message: localize_1.default("MissingRequiredPropWarning", 'Missing property "{0}".', propertyName),
                    });
                }
            });
        }
        const propertyProcessed = (prop) => {
            let index = unprocessedProperties.indexOf(prop);
            while (index >= 0) {
                unprocessedProperties.splice(index, 1);
                index = unprocessedProperties.indexOf(prop);
            }
        };
        if (schema.properties) {
            Object.keys(schema.properties).forEach((propertyName) => {
                propertyProcessed(propertyName);
                if (!schema.properties) {
                    return;
                }
                const prop = schema.properties[propertyName];
                const child = seenKeys[propertyName];
                if (child) {
                    const propertyValidationResult = new validation_result_1.ValidationResult();
                    child.validate(prop, propertyValidationResult, matchingSchemas);
                    validationResult.mergePropertyMatch(propertyValidationResult);
                }
            });
        }
        if (schema.patternProperties) {
            Object.keys(schema.patternProperties).forEach((propertyPattern) => {
                const regex = new RegExp(propertyPattern);
                unprocessedProperties
                    .slice(0)
                    .forEach((propertyName) => {
                    if (regex.test(propertyName)) {
                        propertyProcessed(propertyName);
                        const child = seenKeys[propertyName];
                        if (child && schema.patternProperties) {
                            const propertyValidationResult = new validation_result_1.ValidationResult();
                            child.validate(schema.patternProperties[propertyPattern], propertyValidationResult, matchingSchemas);
                            validationResult.mergePropertyMatch(propertyValidationResult);
                        }
                    }
                });
            });
        }
        if (typeof schema.additionalProperties === "object") {
            unprocessedProperties.forEach((propertyName) => {
                const child = seenKeys[propertyName];
                if (child) {
                    const propertyValidationResult = new validation_result_1.ValidationResult();
                    child.validate(schema.additionalProperties, propertyValidationResult, matchingSchemas);
                    validationResult.mergePropertyMatch(propertyValidationResult);
                }
            });
        }
        else if (schema.additionalProperties === false) {
            if (unprocessedProperties.length > 0) {
                unprocessedProperties.forEach((propertyName) => {
                    const child = seenKeys[propertyName];
                    if (child) {
                        let propertyNode = null;
                        if (child.type !== "property") {
                            propertyNode = child.parent;
                            if (propertyNode instanceof ObjectASTNode) {
                                propertyNode = propertyNode.properties[0];
                            }
                        }
                        else {
                            propertyNode = child;
                        }
                        validationResult.problems.push({
                            location: {
                                start: propertyNode.key.start,
                                end: propertyNode.key.end,
                            },
                            severity: validation_result_1.ProblemSeverity.Warning,
                            message: schema.errorMessage ||
                                localize_1.default("DisallowedExtraPropWarning", "Unexpected property {0}", propertyName),
                        });
                    }
                });
            }
        }
        if (schema.maxProperties) {
            if (this.properties.length > schema.maxProperties) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: localize_1.default("MaxPropWarning", "Object has more properties than limit of {0}.", schema.maxProperties),
                });
            }
        }
        if (schema.minProperties) {
            if (this.properties.length < schema.minProperties) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: localize_1.default("MinPropWarning", "Object has fewer properties than the required number of {0}", schema.minProperties),
                });
            }
        }
        if (schema.dependencies) {
            Object.keys(schema.dependencies).forEach((key) => {
                const prop = seenKeys[key];
                if (prop && schema.dependencies) {
                    const propertyDep = schema.dependencies[key];
                    if (Array.isArray(propertyDep)) {
                        propertyDep.forEach((requiredProp) => {
                            if (!seenKeys[requiredProp]) {
                                validationResult.problems.push({
                                    location: {
                                        start: this.start,
                                        end: this.end,
                                    },
                                    severity: validation_result_1.ProblemSeverity.Warning,
                                    message: localize_1.default("RequiredDependentPropWarning", "Object is missing property {0} required by property {1}.", requiredProp, key),
                                });
                            }
                            else {
                                validationResult.propertiesValueMatches++;
                            }
                        });
                    }
                    else if (propertyDep) {
                        const propertyvalidationResult = new validation_result_1.ValidationResult();
                        this.validate(propertyDep, propertyvalidationResult, matchingSchemas);
                        validationResult.mergePropertyMatch(propertyvalidationResult);
                    }
                }
            });
        }
    }
}
exports.ObjectASTNode = ObjectASTNode;
//# sourceMappingURL=object-ast-node.js.map