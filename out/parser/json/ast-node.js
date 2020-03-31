"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objects = require("../../utils");
const localize_1 = require("./localize");
const validation_result_1 = require("./validation-result");
var EnumMatch;
(function (EnumMatch) {
    EnumMatch[EnumMatch["Key"] = 0] = "Key";
    EnumMatch[EnumMatch["Enum"] = 1] = "Enum";
})(EnumMatch = exports.EnumMatch || (exports.EnumMatch = {}));
function genericComparison(maxOneMatch, subValidationResult, bestMatch, subSchema, subMatchingSchemas) {
    if (!maxOneMatch &&
        !subValidationResult.hasProblems() &&
        !bestMatch.validationResult.hasProblems()) {
        // no errors, both are equally good matches
        bestMatch.matchingSchemas.merge(subMatchingSchemas);
        bestMatch.validationResult.propertiesMatches +=
            subValidationResult.propertiesMatches;
        bestMatch.validationResult.propertiesValueMatches +=
            subValidationResult.propertiesValueMatches;
    }
    else {
        const compareResult = subValidationResult.compareGeneric(bestMatch.validationResult);
        if (compareResult > 0) {
            // our node is the best matching so far
            bestMatch = {
                schema: subSchema,
                validationResult: subValidationResult,
                matchingSchemas: subMatchingSchemas,
            };
        }
        else if (compareResult === 0) {
            // there's already a best matching but we are as good
            bestMatch.matchingSchemas.merge(subMatchingSchemas);
            bestMatch.validationResult.mergeEnumValues(subValidationResult);
        }
    }
    return bestMatch;
}
class ASTNode {
    constructor(document, parent, type, location, start, end) {
        this._value = null;
        this.type = type;
        this.location = location;
        this.start = start;
        this.end = end || Number.MAX_SAFE_INTEGER;
        this.parent = parent;
        this.document = document;
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        this._value = newValue;
    }
    get nodeType() {
        return this.type;
    }
    getPath() {
        const path = this.parent ? this.parent.getPath() : [];
        if (this.location !== null) {
            path.push(this.location);
        }
        return path;
    }
    getLocation() {
        return this.location;
    }
    getChildNodes() {
        return [];
    }
    getLastChild() {
        return null;
    }
    contains(offset, includeRightBound = false) {
        return ((offset >= this.start && offset < this.end) ||
            (includeRightBound && offset === this.end));
    }
    toString() {
        return ("type: " +
            this.type +
            " (" +
            this.start +
            "/" +
            this.end +
            ")" +
            (this.parent ? " parent: {" + this.parent.toString() + "}" : ""));
    }
    visit(visitor) {
        return visitor(this);
    }
    getNodeFromOffset(offset) {
        const findNode = (node) => {
            if (offset >= node.start && offset < node.end) {
                const children = node.getChildNodes();
                for (let i = 0; i < children.length && children[i].start <= offset; i++) {
                    const item = findNode(children[i]);
                    if (item) {
                        return item;
                    }
                }
                return node;
            }
            return null;
        };
        return findNode(this);
    }
    getNodeCollectorCount() {
        const collector = [];
        const findNode = (node) => {
            const children = node.getChildNodes();
            children.forEach((child) => {
                const item = findNode(child);
                if (item && item.type === "property") {
                    collector.push(item);
                }
            });
            return node;
        };
        findNode(this);
        return collector.length;
    }
    getNodeFromOffsetEndInclusive(offset) {
        const collector = [];
        const findNode = (node) => {
            if (offset >= node.start && offset <= node.end) {
                const children = node.getChildNodes();
                for (let i = 0; i < children.length && children[i].start <= offset; i++) {
                    const item = findNode(children[i]);
                    if (item) {
                        collector.push(item);
                    }
                }
                return node;
            }
            return null;
        };
        const foundNode = findNode(this);
        let currMinDist = Number.MAX_VALUE;
        let currMinNode = null;
        collector.forEach((currNode) => {
            const minDist = currNode.end - offset + (offset - currNode.start);
            if (minDist < currMinDist) {
                currMinNode = currNode;
                currMinDist = minDist;
            }
        });
        return currMinNode || foundNode;
    }
    validate(schema, validationResult, matchingSchemas) {
        if (!matchingSchemas.include(this)) {
            return;
        }
        if (this.nodeType === "any") {
            return;
        }
        if (Array.isArray(schema.type)) {
            if (!schema.type.includes(this.nodeType)) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: schema.errorMessage ||
                        localize_1.default("typeArrayMismatchWarning", "Incorrect type. Expected one of {0}.", schema.type.join(", ")),
                });
            }
        }
        else if (schema.type) {
            if (this.nodeType !== schema.type) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: schema.errorMessage ||
                        localize_1.default("typeMismatchWarning", 'Incorrect type. Expected "{0}".', schema.type),
                });
            }
        }
        if (Array.isArray(schema.allOf)) {
            schema.allOf.forEach((subSchema) => {
                this.validate(subSchema, validationResult, matchingSchemas);
            });
        }
        if (schema.not) {
            const subValidationResult = new validation_result_1.ValidationResult();
            const subMatchingSchemas = matchingSchemas.newSub();
            this.validate(schema.not, subValidationResult, subMatchingSchemas);
            if (!subValidationResult.hasProblems()) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: localize_1.default("notSchemaWarning", "Matches a schema that is not allowed."),
                });
            }
            subMatchingSchemas.schemas.forEach((ms) => {
                ms.inverted = !ms.inverted;
                matchingSchemas.add(ms);
            });
        }
        const testAlternatives = (alternatives, maxOneMatch) => {
            const matches = [];
            // remember the best match that is used for error messages
            let bestMatch;
            alternatives.forEach((subSchema) => {
                const subValidationResult = new validation_result_1.ValidationResult();
                const subMatchingSchemas = matchingSchemas.newSub();
                this.validate(subSchema, subValidationResult, subMatchingSchemas);
                if (!subValidationResult.hasProblems()) {
                    matches.push(subSchema);
                }
                if (!bestMatch) {
                    bestMatch = {
                        schema: subSchema,
                        validationResult: subValidationResult,
                        matchingSchemas: subMatchingSchemas,
                    };
                }
                else {
                    bestMatch = genericComparison(maxOneMatch, subValidationResult, bestMatch, subSchema, subMatchingSchemas);
                }
            });
            if (matches.length > 1 && maxOneMatch) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.start + 1 },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    message: localize_1.default("oneOfWarning", "Matches multiple schemas when only one must validate."),
                });
            }
            // @ts-ignore
            if (bestMatch) {
                validationResult.merge(bestMatch.validationResult);
                validationResult.propertiesMatches +=
                    bestMatch.validationResult.propertiesMatches;
                validationResult.propertiesValueMatches +=
                    bestMatch.validationResult.propertiesValueMatches;
                matchingSchemas.merge(bestMatch.matchingSchemas);
            }
            return matches.length;
        };
        if (Array.isArray(schema.anyOf)) {
            testAlternatives(schema.anyOf, false);
        }
        if (Array.isArray(schema.oneOf)) {
            testAlternatives(schema.oneOf, true);
        }
        if (Array.isArray(schema.enum)) {
            const val = this.value;
            let enumValueMatch = false;
            for (const e of schema.enum) {
                if (objects.equals(val, e)) {
                    enumValueMatch = true;
                    break;
                }
            }
            validationResult.enumValues = schema.enum;
            validationResult.enumValueMatch = enumValueMatch;
            if (!enumValueMatch) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: validation_result_1.ProblemSeverity.Warning,
                    code: validation_result_1.ErrorCode.EnumValueMismatch,
                    message: schema.errorMessage ||
                        localize_1.default("enumWarning", "Value is not accepted. Valid values: {0}.", schema.enum.map((v) => JSON.stringify(v)).join(", ")),
                });
            }
        }
        if (schema.deprecationMessage && this.parent) {
            validationResult.problems.push({
                location: { start: this.parent.start, end: this.parent.end },
                severity: validation_result_1.ProblemSeverity.Warning,
                message: schema.deprecationMessage,
            });
        }
        matchingSchemas.add({ node: this, schema });
    }
    get(path) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let currentNode = this;
        for (const segment of path) {
            const found = currentNode.getChildNodes().find((node) => {
                if (node.location === null) {
                    const { value } = node;
                    if (value &&
                        value instanceof ASTNode &&
                        value.location === segment) {
                        currentNode = value;
                        return true;
                    }
                }
                else if (node.location === segment) {
                    currentNode = node;
                    return true;
                }
                return false;
            });
            if (!found) {
                return null;
            }
        }
        return currentNode || null;
    }
}
exports.ASTNode = ASTNode;
//# sourceMappingURL=ast-node.js.map