import * as Parser from "../../parser";
import { Hover, Position, TextDocument } from "vscode-languageserver-types";
import { JSONSchema } from "vscode-json-languageservice";
export declare class YAMLHover {
    private schema;
    constructor(schema: JSONSchema);
    doHover(document: TextDocument, position: Position, doc: Parser.YAMLDocument): Promise<Hover | void>;
}
