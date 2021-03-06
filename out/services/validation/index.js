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
const vscode_languageserver_1 = require("vscode-languageserver");
const parser_1 = require("../../parser");
const array_1 = require("../../utils/array");
class YAMLValidation {
    constructor(schema) {
        this.schema = schema;
    }
    doValidation(textDocument, yamlDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.validateWithSchema(textDocument, yamlDocument);
        });
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    validateWithSchema(textDocument, yamlDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            const diagnostics = [];
            const added = {};
            const currentDocProblems = yamlDocument.getValidationProblems(this.schema);
            currentDocProblems.forEach((problem) => {
                yamlDocument.errors.push({
                    location: {
                        start: problem.location.start,
                        end: problem.location.end,
                    },
                    message: problem.message,
                    code: parser_1.ErrorCode.Undefined,
                });
            });
            const addProblem = ({ message, location }, severity) => {
                const signature = `${location.start} ${location.end} ${message}`;
                // remove duplicated messages
                if (!added[signature]) {
                    added[signature] = true;
                    const range = {
                        start: textDocument.positionAt(location.start),
                        end: textDocument.positionAt(location.end),
                    };
                    diagnostics.push({
                        severity,
                        range,
                        message,
                    });
                }
            };
            yamlDocument.errors.forEach((error) => {
                addProblem(error, vscode_languageserver_1.DiagnosticSeverity.Error);
            });
            yamlDocument.warnings.forEach((warning) => {
                addProblem(warning, vscode_languageserver_1.DiagnosticSeverity.Warning);
            });
            return array_1.removeDuplicatesObj(diagnostics);
        });
    }
}
exports.YAMLValidation = YAMLValidation;
//# sourceMappingURL=index.js.map