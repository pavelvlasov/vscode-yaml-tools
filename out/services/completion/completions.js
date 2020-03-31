"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const nls = require("vscode-nls");
const parser_1 = require("../../parser");
const helpers = require("./helpers");
const textCompletions = require("./text");
const localize = nls.loadMessageBundle();
exports.getPropertyCompletions = (textDocument, schema, doc, node, collector, separatorAfter) => {
    const matchingSchemas = doc.getMatchingSchemas(schema);
    matchingSchemas.forEach((s) => {
        if (s.node === node && !s.inverted) {
            const schemaProperties = s.schema.properties;
            if (schemaProperties) {
                Object.keys(schemaProperties).forEach((key) => {
                    const propertySchema = schemaProperties[key];
                    if (!propertySchema.deprecationMessage &&
                        !propertySchema.doNotSuggest) {
                        collector.add({
                            kind: vscode_languageserver_types_1.CompletionItemKind.Property,
                            label: key,
                            insertText: textCompletions.getInsertTextForProperty(key, propertySchema, separatorAfter, 1, helpers.isInArray(textDocument, node)),
                            insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
                            documentation: propertySchema.description || "",
                        });
                    }
                });
            }
            if (node.type === "object" &&
                node.parent &&
                node.parent.type === "array" &&
                s.schema.type !== "object") {
                exports.addSchemaValueCompletions(s.schema, collector, separatorAfter);
            }
        }
    });
};
exports.getValueCompletions = (schema, doc, completionNode, offset, document, collector
// eslint-disable-next-line @typescript-eslint/require-await
) => __awaiter(void 0, void 0, void 0, function* () {
    let offsetForSeparator = offset;
    let parentKey = null;
    let node = completionNode;
    if (node &&
        (node.type === "string" ||
            node.type === "number" ||
            node.type === "boolean")) {
        offsetForSeparator = node.end;
        node = node.parent;
    }
    if (node && node instanceof parser_1.NullASTNode) {
        const nodeParent = node.parent;
        /*
         * This is going to be an object for some reason and we need to find the property
         * Its an issue with the null node
         */
        if (nodeParent && nodeParent instanceof parser_1.ObjectASTNode) {
            nodeParent.properties.forEach((prop) => {
                if (prop.key &&
                    prop.key.location === node.location) {
                    node = prop;
                }
            });
        }
    }
    if (!node) {
        exports.addSchemaValueCompletions(schema, collector, "");
        return;
    }
    if (node.type === "property" &&
        offset > node.colonOffset) {
        const propertyNode = node;
        const propertyValueNode = propertyNode.value;
        if (propertyValueNode && offset > propertyValueNode.end) {
            return; // we are past the value node
        }
        parentKey = propertyNode.key.value;
        node = node.parent;
    }
    const separatorAfter = helpers.evaluateSeparatorAfter(document, offsetForSeparator);
    if (node &&
        (parentKey !== null || node.type === "array" || node.type === "object")) {
        const matchingSchemas = doc.getMatchingSchemas(schema);
        matchingSchemas.map((s) => {
            if (s.node === node && !s.inverted && s.schema) {
                if (s.schema.items) {
                    if (Array.isArray(s.schema.items)) {
                        const index = helpers.findItemAtOffset(node, document, offset);
                        if (index < s.schema.items.length) {
                            exports.addSchemaValueCompletions(s.schema.items[index], collector, separatorAfter, true);
                        }
                    }
                    else if (s.schema.items.type === "object") {
                        collector.add({
                            kind: helpers.getSuggestionKind(s.schema.items.type),
                            label: `- (array item)`,
                            documentation: `Create an item of an array${s.schema.description === undefined
                                ? ""
                                : "(" + s.schema.description + ")"}`,
                            insertText: `- ${textCompletions
                                .getInsertTextForObject(s.schema.items, separatorAfter)
                                .insertText.trimLeft()}`,
                            insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
                        });
                    }
                    else {
                        exports.addSchemaValueCompletions(s.schema.items, collector, separatorAfter, true);
                    }
                }
                if (s.schema.properties && parentKey) {
                    const propertySchema = s.schema.properties[parentKey];
                    if (propertySchema) {
                        exports.addSchemaValueCompletions(propertySchema, collector, separatorAfter, false);
                    }
                }
            }
        });
    }
});
exports.addSchemaValueCompletions = (schema, collector, separatorAfter, forArrayItem = false) => {
    const types = {};
    exports.addSchemaValueCompletionsCore(schema, collector, types, separatorAfter, forArrayItem);
    if (types.boolean) {
        exports.addBooleanValueCompletion(true, collector, separatorAfter);
        exports.addBooleanValueCompletion(false, collector, separatorAfter);
    }
    if (types.null) {
        exports.addNullValueCompletion(collector, separatorAfter);
    }
};
exports.addSchemaValueCompletionsCore = (schema, collector, types, separatorAfter, forArrayItem = false) => {
    exports.addDefaultValueCompletions(schema, collector, separatorAfter, 0, forArrayItem);
    exports.addEnumValueCompletions(schema, collector, separatorAfter, forArrayItem);
    exports.collectTypes(schema, types);
    if (Array.isArray(schema.allOf)) {
        schema.allOf.forEach((s) => exports.addSchemaValueCompletionsCore(s, collector, types, separatorAfter, forArrayItem));
    }
    if (Array.isArray(schema.anyOf)) {
        schema.anyOf.forEach((s) => exports.addSchemaValueCompletionsCore(s, collector, types, separatorAfter, forArrayItem));
    }
    if (Array.isArray(schema.oneOf)) {
        schema.oneOf.forEach((s) => exports.addSchemaValueCompletionsCore(s, collector, types, separatorAfter, forArrayItem));
    }
};
exports.addDefaultValueCompletions = (schema, collector, separatorAfter, arrayDepth = 0, forArrayItem = false) => {
    let hasProposals = false;
    if (schema.default) {
        let type = schema.type;
        let value = schema.default;
        for (let i = arrayDepth; i > 0; i--) {
            value = [value];
            type = "array";
        }
        collector.add({
            kind: helpers.getSuggestionKind(type),
            label: forArrayItem
                ? `- ${helpers.getLabelForValue(value)}`
                : helpers.getLabelForValue(value),
            insertText: forArrayItem
                ? `- ${textCompletions.getInsertTextForValue(value, separatorAfter)}`
                : textCompletions.getInsertTextForValue(value, separatorAfter),
            insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
            detail: localize("json.suggest.default", "Default value"),
        });
        hasProposals = true;
    }
    if (!hasProposals && schema.items && !Array.isArray(schema.items)) {
        exports.addDefaultValueCompletions(schema.items, collector, separatorAfter, arrayDepth + 1);
    }
};
exports.addEnumValueCompletions = (schema, collector, separatorAfter, forArrayItem = false) => {
    if (Array.isArray(schema.enum)) {
        for (let i = 0, length = schema.enum.length; i < length; i++) {
            const enm = schema.enum[i];
            let documentation = schema.description;
            if (schema.enumDescriptions && i < schema.enumDescriptions.length) {
                documentation = schema.enumDescriptions[i];
            }
            collector.add({
                kind: helpers.getSuggestionKind(schema.type),
                label: forArrayItem
                    ? `- ${helpers.getLabelForValue(enm)}`
                    : helpers.getLabelForValue(enm),
                insertText: forArrayItem
                    ? `- ${textCompletions.getInsertTextForValue(enm, separatorAfter)}`
                    : textCompletions.getInsertTextForValue(enm, separatorAfter),
                insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
                documentation,
            });
        }
    }
};
exports.collectTypes = (schema, types) => {
    const type = schema.type;
    if (Array.isArray(type)) {
        type.forEach((t) => (types[t] = true));
    }
    else if (type) {
        types[type] = true;
    }
};
exports.addBooleanValueCompletion = (value, collector, separatorAfter) => {
    collector.add({
        kind: helpers.getSuggestionKind("boolean"),
        label: value ? "true" : "false",
        insertText: textCompletions.getInsertTextForValue(value, separatorAfter),
        insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
        documentation: "",
    });
};
exports.addNullValueCompletion = (collector, separatorAfter) => {
    collector.add({
        kind: helpers.getSuggestionKind("null"),
        label: "null",
        insertText: "null" + separatorAfter,
        insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
        documentation: "",
    });
};
//# sourceMappingURL=completions.js.map