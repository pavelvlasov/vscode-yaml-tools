import { JSONSchema } from "vscode-json-languageservice";
import { CompletionItem, CompletionList, Position, TextDocument } from "vscode-languageserver-types";
import * as Parser from "../../parser";
export * from "./completion-helper";
export declare class YAMLCompletion {
    private schema;
    constructor(schema: JSONSchema);
    doResolve(item: CompletionItem): Promise<CompletionItem>;
    doComplete(document: TextDocument, position: Position, doc: Parser.YAMLDocument): Promise<CompletionList>;
}
