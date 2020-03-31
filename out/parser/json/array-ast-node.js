"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_node_1 = require("./ast-node");
const localize_1 = require("./localize");
const validation_result_1 = require("./validation-result");
class ArrayASTNode extends ast_node_1.ASTNode {
    constructor(document, parent, name, start, end) {
        super(document, parent, "array", name, start, end);
        this.items = [];
    }
    get value() {
        return this.items.map((v) => v.value);
    }
    getChildNodes() {
        return this.items;
    }
    getLastChild() {
        return this.items[this.items.length - 1];
    }
    addItem(item) {
        if (item) {
            this.items.push(item);
            return true;
        }
        return false;
    }
    visit(visitor) {
        let ctn = visitor(this);
        for (let i = 0; i < this.items.length && ctn; i++) {
            ctn = this.items[i].visit(visitor);
        }
        return ctn;
    }
    validate(schema, validationResult, matchingSchemas) {
        if (!matchingSchemas.include(this)) {
            return;
        }
        super.validate(schema, validationResult, matchingSchemas);
        if (Array.isArray(schema.items)) {
            const subSchemas = schema.items;
            subSchemas.forEach((subSchema, index) => {
                const itemValidationResult = new validation_result_1.ValidationResult();
                const item = this.items[index];
                if (item) {
                    item.validate(subSchema, itemValidationResult, matchingSchemas);
                    validationResult.mergePropertyMatch(itemValidationResult);
                }
                else if (this.items.length >= subSchemas.length) {
                    validationResult.propertiesValueMatches++;
                }
            });
            if (this.items.length > subSchemas.length) {
                if (typeof schema.additionalItems === "object") {
                    for (let i = subSchemas.length; i < this.items.length; i++) {
                        const itemValidationResult = new validation_result_1.ValidationResult();
                        this.items[i].validate(schema.additionalItems, itemValidationResult, matchingSchemas);
                        validationResult.mergePropertyMatch(itemValidationResult);
                    }
                }
                else if (schema.additionalItems === false) {
                    validationResult.problems.push({
                        location: { start: this.start, end: this.end },
                        severity: validation_result_1.ProblemSeverity.Warning,
                        message: localize_1.default("additionalItemsWarning", "Array has too many items according to schema. Expected {0} or fewer.", subSchemas.length),
                    });
                }
            }
        }
        else if (schema.items) {
            this.items.forEach((item) => {
                const itemValidationResult = new validation_result_1.ValidationResult();
                item.validate(schema.items, itemValidationResult, matchingSchemas);
                validationResult.mergePropertyMatch(itemValidationResult);
            });
        }
        if (schema.minItems && this.items.length < schema.minItems) {
            validationResult.problems.push({
                location: { start: this.start, end: this.end },
                severity: validation_result_1.ProblemSeverity.Warning,
                message: localize_1.default("minItemsWarning", "Array has too few items. Expected {0} or more.", schema.minItems),
            });
        }
        if (schema.maxItems && this.items.length > schema.maxItems) {
            validationResult.problems.push({
                location: { start: this.start, end: this.end },
                severity: validation_result_1.ProblemSeverity.Warning,
                message: localize_1.default("maxItemsWarning", "Array has too many items. Expected {0} or fewer.", schema.minItems),
            });
        }
        if (schema.uniqueItems === true) {
            const values = this.items.map((node) => {
                return node.value;
            });
            const duplicates = values.some((value, index) => {
                return index !== values.lastIndexOf(value);
            });
            if (duplicates) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: localize_1.default("uniqueItemsWarning", "Array has duplicate items."),
                });
            }
        }
    }
}
exports.ArrayASTNode = ArrayASTNode;
//# sourceMappingURL=array-ast-node.js.map