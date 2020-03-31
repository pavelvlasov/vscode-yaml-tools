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
const completions = require("./completions");
const helpers = require("./helpers");
class YAMLCompletion {
    constructor(schema) {
        this.schema = schema;
    }
    doResolve(item) {
        return Promise.resolve(item);
    }
    doComplete(document, position, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                items: [],
                isIncomplete: false
            };
            const offset = document.offsetAt(position);
            if (document.getText()[offset] === ":") {
                return Promise.resolve(result);
            }
            let node = doc.getNodeFromOffsetEndInclusive(offset);
            if (helpers.isInComment(document, node ? node.start : 0, offset)) {
                return Promise.resolve(result);
            }
            const currentWord = helpers.getCurrentWord(document, offset);
            let overwriteRange = null;
            if (node && node.type === "null") {
                const nodeStartPos = document.positionAt(node.start);
                nodeStartPos.character += 1;
                const nodeEndPos = document.positionAt(node.end);
                nodeEndPos.character += 1;
                overwriteRange = vscode_languageserver_types_1.Range.create(nodeStartPos, nodeEndPos);
            }
            else if (node &&
                (node.type === "string" ||
                    node.type === "number" ||
                    node.type === "boolean")) {
                overwriteRange = vscode_languageserver_types_1.Range.create(document.positionAt(node.start), document.positionAt(node.end));
            }
            else {
                let overwriteStart = offset - currentWord.length;
                if (overwriteStart > 0 &&
                    document.getText()[overwriteStart - 1] === '"') {
                    overwriteStart--;
                }
                overwriteRange = vscode_languageserver_types_1.Range.create(document.positionAt(overwriteStart), position);
            }
            const proposed = {};
            const collector = {
                add: (suggestion) => {
                    if (!suggestion.data) {
                        suggestion.data = {};
                    }
                    const existing = proposed[suggestion.label];
                    if (!existing) {
                        proposed[suggestion.label] = suggestion;
                        if (overwriteRange) {
                            suggestion.textEdit = vscode_languageserver_types_1.TextEdit.replace(overwriteRange, suggestion.insertText || '');
                        }
                        result.items.push(suggestion);
                    }
                    else if (!existing.documentation) {
                        existing.documentation = suggestion.documentation;
                    }
                },
                setAsIncomplete: () => {
                    result.isIncomplete = true;
                },
                error: (message) => {
                    console.log(message);
                },
                log: (message) => {
                    // eslint-disable-next-line no-console
                    console.log(message);
                },
                getNumberOfProposals: () => {
                    return result.items.length;
                }
            };
            const collectionPromises = [];
            let addValue = true;
            let currentProperty = null;
            if (node) {
                if (node.type === "string") {
                    const stringNode = node;
                    if (stringNode.isKey) {
                        addValue = !(node.parent &&
                            node.parent.value);
                        currentProperty = node.parent
                            ? node.parent
                            : null;
                        if (node.parent) {
                            node = node.parent.parent;
                        }
                    }
                }
            }
            // proposals for properties
            if (node && node.type === "object") {
                // don't suggest properties that are already present
                const properties = node.properties;
                properties.forEach(p => {
                    if (!currentProperty || currentProperty !== p) {
                        if (p.key.value) {
                            proposed[p.key.value] = vscode_languageserver_types_1.CompletionItem.create("__");
                        }
                    }
                });
                let separatorAfter = "";
                if (addValue) {
                    separatorAfter = helpers.evaluateSeparatorAfter(document, document.offsetAt(overwriteRange.end));
                }
                // property proposals with schema
                completions.getPropertyCompletions(document, this.schema, doc, node, collector, separatorAfter);
            }
            // property proposal for values
            yield completions.getValueCompletions(this.schema, doc, node, offset, document, collector);
            return Promise.all(collectionPromises).then(() => {
                return result;
            });
        });
    }
}
exports.YAMLCompletion = YAMLCompletion;
//# sourceMappingURL=index.js.map