"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_node_1 = require("./ast-node");
const localize_1 = require("./localize");
const validation_result_1 = require("./validation-result");
class StringASTNode extends ast_node_1.ASTNode {
    constructor(document, parent, name, isKey, start, end) {
        super(document, parent, "string", name, start, end);
        this.isKey = isKey;
        this.value = "";
    }
    validate(schema, validationResult, matchingSchemas) {
        if (!matchingSchemas.include(this)) {
            return;
        }
        super.validate(schema, validationResult, matchingSchemas);
        if (schema.minLength &&
            this.value &&
            this.value.length < schema.minLength) {
            validationResult.problems.push({
                location: { start: this.start, end: this.end },
                severity: validation_result_1.ProblemSeverity.Warning,
                message: localize_1.default("minLengthWarning", "String is shorter than the minimum length of {0}.", schema.minLength),
            });
        }
        if (schema.maxLength &&
            this.value &&
            this.value.length > schema.maxLength) {
            validationResult.problems.push({
                location: { start: this.start, end: this.end },
                severity: validation_result_1.ProblemSeverity.Warning,
                message: localize_1.default("maxLengthWarning", "String is longer than the maximum length of {0}.", schema.maxLength),
            });
        }
        if (schema.pattern) {
            const regex = new RegExp(schema.pattern);
            if (this.value && !regex.test(this.value)) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: schema.patternErrorMessage ||
                        schema.errorMessage ||
                        localize_1.default("patternWarning", 'String does not match the pattern of "{0}".', schema.pattern),
                });
            }
        }
    }
}
exports.StringASTNode = StringASTNode;
//# sourceMappingURL=string-ast-node.js.map