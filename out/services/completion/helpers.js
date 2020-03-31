"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONParser = require("jsonc-parser");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
exports.getLabelForValue = (value) => {
    const label = typeof value === "string" ? value : JSON.stringify(value);
    if (label.length > 57) {
        return label.substr(0, 57).trim() + "...";
    }
    return label;
};
exports.getSuggestionKind = (type) => {
    if (Array.isArray(type)) {
        const array = type;
        type = array.length > 0 ? array[0] : null;
    }
    if (!type) {
        return vscode_languageserver_types_1.CompletionItemKind.Value;
    }
    switch (type) {
        case "string":
            return vscode_languageserver_types_1.CompletionItemKind.Value;
        case "object":
            return vscode_languageserver_types_1.CompletionItemKind.Module;
        case "property":
            return vscode_languageserver_types_1.CompletionItemKind.Property;
        default:
            return vscode_languageserver_types_1.CompletionItemKind.Value;
    }
};
exports.getCurrentWord = (document, offset) => {
    let i = offset - 1;
    const text = document.getText();
    while (i >= 0 && ' \t\n\r\v":{[,]}'.indexOf(text.charAt(i)) === -1) {
        i--;
    }
    return text.substring(i + 1, offset);
};
exports.findItemAtOffset = (node, document, offset) => {
    const scanner = JSONParser.createScanner(document.getText(), true);
    const children = node.getChildNodes();
    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (offset > child.end) {
            scanner.setPosition(child.end);
            const token = scanner.scan();
            if (token === 5 /* CommaToken */ &&
                offset >= scanner.getTokenOffset() + scanner.getTokenLength()) {
                return i + 1;
            }
            return i;
        }
        else if (offset >= child.start) {
            return i;
        }
    }
    return 0;
};
exports.isInComment = (document, start, offset) => {
    const scanner = JSONParser.createScanner(document.getText(), false);
    scanner.setPosition(start);
    let token = scanner.scan();
    while (token !== 17 /* EOF */ &&
        scanner.getTokenOffset() + scanner.getTokenLength() < offset) {
        token = scanner.scan();
    }
    return ((token === 12 /* LineCommentTrivia */ ||
        token === 13 /* BlockCommentTrivia */) &&
        scanner.getTokenOffset() <= offset);
};
exports.evaluateSeparatorAfter = (document, offset) => {
    const scanner = JSONParser.createScanner(document.getText(), true);
    scanner.setPosition(offset);
    const token = scanner.scan();
    switch (token) {
        case 5 /* CommaToken */:
        case 2 /* CloseBraceToken */:
        case 4 /* CloseBracketToken */:
        case 17 /* EOF */:
            return "";
        default:
            return "";
    }
};
exports.isInArray = (document, node) => {
    if (node.parent && node.parent.type === "array") {
        const nodePosition = document.positionAt(node.start);
        const arrayPosition = document.positionAt(node.start);
        return nodePosition.line === arrayPosition.line;
    }
    return false;
};
//# sourceMappingURL=helpers.js.map