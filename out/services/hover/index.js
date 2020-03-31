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
const schema_1 = require("../../utils/schema");
const createHover = (contents, hoverRange) => {
    const result = {
        contents,
        range: hoverRange
    };
    return result;
};
class YAMLHover {
    constructor(schema) {
        this.schema = schema;
    }
    doHover(document, position, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const contents = [];
            const offset = document.offsetAt(position);
            const node = doc.getNodeFromOffset(offset);
            if (!node ||
                ((node.type === "object" || node.type === "array") &&
                    offset > node.start + 1 &&
                    offset < node.end - 1)) {
                return Promise.resolve(void 0);
            }
            const hoverRangeNode = node;
            const hoverRange = vscode_languageserver_types_1.Range.create(document.positionAt(hoverRangeNode.start), document.positionAt(hoverRangeNode.end));
            const path = node.getPath();
            if (path.length > 1) {
                const description = schema_1.getLastDescription(node.getPath().map(String), this.schema);
                if (description) {
                    contents.push(description);
                }
            }
            if (contents.length > 0) {
                return createHover(contents, hoverRange);
            }
            return;
        });
    }
}
exports.YAMLHover = YAMLHover;
//# sourceMappingURL=index.js.map