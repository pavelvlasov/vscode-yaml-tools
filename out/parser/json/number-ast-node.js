"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_node_1 = require("./ast-node");
const localize_1 = require("./localize");
const validation_result_1 = require("./validation-result");
class NumberASTNode extends ast_node_1.ASTNode {
    constructor(document, parent, name, start, end) {
        super(document, parent, "number", name, start, end);
        this.isInteger = true;
        this.value = Number.NaN;
    }
    validate(schema, validationResult, matchingSchemas) {
        if (!matchingSchemas.include(this)) {
            return;
        }
        // work around type validation in the base class
        let typeIsInteger = false;
        if (schema.type === "integer" ||
            (Array.isArray(schema.type) && schema.type.includes("integer"))) {
            typeIsInteger = true;
        }
        if (typeIsInteger && this.isInteger === true) {
            this.type = "integer";
        }
        super.validate(schema, validationResult, matchingSchemas);
        this.type = "number";
        const val = this.value;
        if (typeof val === "number" && typeof schema.multipleOf === "number") {
            if (val % schema.multipleOf !== 0) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: localize_1.default("multipleOfWarning", "Value is not divisible by {0}.", schema.multipleOf),
                });
            }
        }
        if (typeof schema.minimum === "number") {
            if (schema.exclusiveMinimum && val <= schema.minimum) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: localize_1.default("exclusiveMinimumWarning", "Value is below the exclusive minimum of {0}.", schema.minimum),
                });
            }
            if (!schema.exclusiveMinimum && val < schema.minimum) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: localize_1.default("minimumWarning", "Value is below the minimum of {0}.", schema.minimum),
                });
            }
        }
        if (typeof schema.maximum === "number") {
            if (schema.exclusiveMaximum && val >= schema.maximum) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: localize_1.default("exclusiveMaximumWarning", "Value is above the exclusive maximum of {0}.", schema.maximum),
                });
            }
            if (!schema.exclusiveMaximum && val > schema.maximum) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: localize_1.default("maximumWarning", "Value is above the maximum of {0}.", schema.maximum),
                });
            }
        }
    }
}
exports.NumberASTNode = NumberASTNode;
//# sourceMappingURL=number-ast-node.js.map