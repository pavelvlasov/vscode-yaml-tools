"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const array_1 = require("../../utils/array");
const isEOL = (c) => {
    return c === 0x0a /* LF */ || c === 0x0d; /* CR */
};
exports.completionHelper = (document, textDocumentPosition) => {
    // Get the string we are looking at via a substring
    const linePos = textDocumentPosition.line;
    const position = textDocumentPosition;
    const lineOffset = array_1.getLineOffsets(document.getText());
    const start = lineOffset[linePos]; // Start of where the autocompletion is happening
    let end = 0; // End of where the autocompletion is happening
    if (lineOffset[linePos + 1]) {
        end = lineOffset[linePos + 1];
    }
    else {
        end = document.getText().length;
    }
    while (end - 1 >= 0 && isEOL(document.getText().charCodeAt(end - 1))) {
        end--;
    }
    const textLine = document.getText().substring(start, end);
    // Check if the string we are looking at is a node
    if (!textLine.includes(":")) {
        // We need to add the ":" to load the nodes
        let newText = "";
        // This is for the empty line case
        const trimmedText = textLine.trim();
        if (trimmedText.length === 0 ||
            (trimmedText.length === 1 && trimmedText.startsWith("-"))) {
            // Add a temp node that is in the document but we don't use at all.
            newText =
                document.getText().substring(0, start + textLine.length) +
                    (trimmedText.startsWith("-") && !textLine.endsWith(" ")
                        ? " "
                        : "") +
                    "holder:\r\n" +
                    document
                        .getText()
                        .substr(lineOffset[linePos + 1] || document.getText().length);
            // For when missing semi colon case
        }
        else {
            // Add a semicolon to the end of the current line so we can validate the node
            newText =
                document.getText().substring(0, start + textLine.length) +
                    ":\r\n" +
                    document
                        .getText()
                        .substr(lineOffset[linePos + 1] || document.getText().length);
        }
        return {
            newDocument: vscode_languageserver_1.TextDocument.create(document.uri, document.languageId, document.version, newText),
            newPosition: textDocumentPosition,
        };
    }
    else {
        // All the nodes are loaded
        position.character = position.character - 1;
        return {
            newDocument: document,
            newPosition: position,
        };
    }
};
//# sourceMappingURL=completion-helper.js.map