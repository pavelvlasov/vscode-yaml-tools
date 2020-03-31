"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_collector_1 = require("./schema-collector");
const validation_result_1 = require("./validation-result");
class JSONDocument {
    constructor(uri, root, syntaxErrors) {
        this.uri = uri;
        this.root = root;
        this.syntaxErrors = syntaxErrors;
    }
    getNodeFromOffset(offset) {
        return this.root && this.root.getNodeFromOffset(offset);
    }
    getNodeFromOffsetEndInclusive(offset) {
        return this.root && this.root.getNodeFromOffsetEndInclusive(offset);
    }
    visit(visitor) {
        if (this.root) {
            this.root.visit(visitor);
        }
    }
    validate(schema) {
        if (this.root && schema) {
            const validationResult = new validation_result_1.ValidationResult();
            this.root.validate(schema, validationResult, new schema_collector_1.NoOpSchemaCollector());
            return validationResult.problems;
        }
        return null;
    }
    getMatchingSchemas(schema, focusOffset = -1, exclude = null) {
        const matchingSchemas = new schema_collector_1.SchemaCollector(focusOffset, exclude);
        const validationResult = new validation_result_1.ValidationResult();
        if (this.root && schema) {
            this.root.validate(schema, validationResult, matchingSchemas);
        }
        return matchingSchemas.schemas;
    }
    getValidationProblems(schema, focusOffset = -1, exclude = null) {
        const matchingSchemas = new schema_collector_1.SchemaCollector(focusOffset, exclude);
        const validationResult = new validation_result_1.ValidationResult();
        if (this.root && schema) {
            this.root.validate(schema, validationResult, matchingSchemas);
        }
        return validationResult.problems;
    }
}
exports.JSONDocument = JSONDocument;
//# sourceMappingURL=json-document.js.map