import { JSONSchema } from "vscode-json-languageservice";
import { Diagnostic, TextDocument } from "vscode-languageserver";
import { YAMLDocument } from "../../parser";
export declare class YAMLValidation {
    private schema;
    constructor(schema: JSONSchema);
    doValidation(textDocument: TextDocument, yamlDocument: YAMLDocument): Promise<Diagnostic[]>;
    private validateWithSchema;
}
