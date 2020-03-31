"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const localize_1 = require("./localize");
var ProblemSeverity;
(function (ProblemSeverity) {
    ProblemSeverity[ProblemSeverity["Error"] = 0] = "Error";
    ProblemSeverity[ProblemSeverity["Warning"] = 1] = "Warning";
})(ProblemSeverity = exports.ProblemSeverity || (exports.ProblemSeverity = {}));
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["Undefined"] = 0] = "Undefined";
    ErrorCode[ErrorCode["EnumValueMismatch"] = 1] = "EnumValueMismatch";
    ErrorCode[ErrorCode["CommentsNotAllowed"] = 2] = "CommentsNotAllowed";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
class ValidationResult {
    constructor() {
        this.problems = [];
        this.propertiesMatches = 0;
        this.propertiesValueMatches = 0;
        this.primaryValueMatches = 0;
        this.enumValueMatch = false;
        this.enumValues = [];
        this.warnings = [];
        this.errors = [];
    }
    hasProblems() {
        return !!this.problems.length;
    }
    mergeAll(validationResults) {
        validationResults.forEach(validationResult => {
            this.merge(validationResult);
        });
    }
    merge(validationResult) {
        this.problems = this.problems.concat(validationResult.problems);
    }
    mergeEnumValues(validationResult) {
        if (!this.enumValueMatch &&
            !validationResult.enumValueMatch &&
            this.enumValues &&
            validationResult.enumValues) {
            this.enumValues = this.enumValues.concat(validationResult.enumValues);
            for (const error of this.problems) {
                if (error.code === ErrorCode.EnumValueMismatch) {
                    error.message = localize_1.default("enumWarning", "Value is not accepted. Valid values: {0}.", this.enumValues.map(v => JSON.stringify(v)).join(", "));
                }
            }
        }
    }
    mergePropertyMatch(propertyValidationResult) {
        this.merge(propertyValidationResult);
        this.propertiesMatches++;
        if (propertyValidationResult.enumValueMatch ||
            (!this.hasProblems() && propertyValidationResult.propertiesMatches)) {
            this.propertiesValueMatches++;
        }
        if (propertyValidationResult.enumValueMatch &&
            propertyValidationResult.enumValues &&
            propertyValidationResult.enumValues.length === 1) {
            this.primaryValueMatches++;
        }
    }
    compareGeneric(other) {
        const hasProblems = this.hasProblems();
        if (hasProblems !== other.hasProblems()) {
            return hasProblems ? -1 : 1;
        }
        if (this.enumValueMatch !== other.enumValueMatch) {
            return other.enumValueMatch ? -1 : 1;
        }
        if (this.propertiesValueMatches !== other.propertiesValueMatches) {
            return this.propertiesValueMatches - other.propertiesValueMatches;
        }
        if (this.primaryValueMatches !== other.primaryValueMatches) {
            return this.primaryValueMatches - other.primaryValueMatches;
        }
        return this.propertiesMatches - other.propertiesMatches;
    }
}
exports.ValidationResult = ValidationResult;
//# sourceMappingURL=validation-result.js.map