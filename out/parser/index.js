"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const js_yaml_1 = require("js-yaml");
const Yaml = require("yaml-ast-parser");
const json_1 = require("./json");
exports.YAMLDocument = json_1.YAMLDocument;
__export(require("./json"));
function convertError(e) {
    return {
        message: `${e.reason}`,
        location: {
            start: e.mark.position,
            end: e.mark.position + e.mark.column,
        },
        code: json_1.ErrorCode.Undefined,
    };
}
function createJSONDocument(document, yamlDoc) {
    const doc = new json_1.YAMLDocument(document.uri, yamlDoc);
    if (!yamlDoc || !doc.root) {
        // TODO: When this is true, consider not pushing the other errors.
        doc.errors.push({
            message: "Expected a YAML object, array or literal",
            code: json_1.ErrorCode.Undefined,
            location: yamlDoc
                ? {
                    start: yamlDoc.startPosition,
                    end: yamlDoc.endPosition,
                }
                : { start: 0, end: 0 },
        });
        return doc;
    }
    const duplicateKeyReason = "duplicate key";
    // Patch ontop of yaml-ast-parser to disable duplicate key message on merge key
    const isDuplicateAndNotMergeKey = (error, yamlText) => {
        const errorConverted = convertError(error);
        const errorStart = errorConverted.location.start;
        const errorEnd = errorConverted.location.end;
        if (error.reason === duplicateKeyReason &&
            yamlText.substring(errorStart, errorEnd).startsWith("<<")) {
            return false;
        }
        return true;
    };
    doc.errors = yamlDoc.errors
        .filter((e) => e.reason !== duplicateKeyReason && !e.isWarning)
        .map((e) => convertError(e));
    doc.warnings = yamlDoc.errors
        .filter((e) => (e.reason === duplicateKeyReason &&
        isDuplicateAndNotMergeKey(e, document.getText())) ||
        e.isWarning)
        .map((e) => convertError(e));
    return doc;
}
exports.parse = (document) => {
    // We need compiledTypeMap to be available from schemaWithAdditionalTags before we add the new custom propertie
    const compiledTypeMap = {};
    const schemaWithAdditionalTags = js_yaml_1.Schema.create(Object.values(compiledTypeMap));
    schemaWithAdditionalTags.compiledTypeMap = compiledTypeMap;
    const additionalOptions = {
        schema: schemaWithAdditionalTags,
    };
    const text = document.getText();
    return createJSONDocument(document, Yaml.load(text, additionalOptions));
};
//# sourceMappingURL=index.js.map