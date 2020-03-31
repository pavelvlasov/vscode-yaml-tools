import * as Json from "jsonc-parser";
import { JSONSchema } from "vscode-json-languageservice";
import { YAMLDocument } from "../index";
import { ASTNode, ISchemaCollector } from "./ast-node";
import { ValidationResult } from "./validation-result";
export declare class ArrayASTNode extends ASTNode<unknown[]> {
    items: ASTNode[];
    constructor(document: YAMLDocument, parent: ASTNode | null, name: Json.Segment | null, start: number, end?: number);
    get value(): unknown[];
    getChildNodes(): ASTNode[];
    getLastChild(): ASTNode;
    addItem(item: ASTNode): boolean;
    visit(visitor: (node: ASTNode) => boolean | null): boolean | null;
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
}
