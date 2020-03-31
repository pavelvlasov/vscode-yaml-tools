import * as Parser from "../../parser";
import { CompletionItem, CompletionList, Position, TextDocument } from "vscode-languageserver-types";
import { JSONSchema } from "vscode-json-languageservice";
export declare class YAMLCompletion {
    private schema;
    constructor(schema: JSONSchema);
    doResolve(item: CompletionItem): Promise<CompletionItem>;
    doComplete(document: TextDocument, position: Position, doc: Parser.YAMLDocument): Promise<CompletionList>;
}
