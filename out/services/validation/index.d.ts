import { YAMLDocument } from "../../parser";
import { Diagnostic, TextDocument } from "vscode-languageserver";
import { JSONSchema } from "vscode-json-languageservice";
export declare class YAMLValidation {
    private schema;
    constructor(schema: JSONSchema);
    doValidation(textDocument: TextDocument, yamlDocument: YAMLDocument): Promise<Diagnostic[]>;
    private validateWithSchema;
}
