import * as Json from "jsonc-parser";
import { JSONSchema } from "vscode-json-languageservice";
import { YAMLDocument } from "..";
import { ASTNode, ISchemaCollector } from "./ast-node";
import { PropertyASTNode } from "./property-ast-node";
import { ValidationResult } from "./validation-result";
export declare class ObjectASTNode extends ASTNode<null> {
    properties: PropertyASTNode[];
    constructor(document: YAMLDocument, parent: ASTNode | null, name: Json.Segment | null, start: number, end?: number);
    get value(): any;
    getChildNodes(): ASTNode[];
    getLastChild(): ASTNode;
    addProperty(node: PropertyASTNode): boolean;
    getFirstProperty(key: string): PropertyASTNode | void;
    getKeyList(): (string | null)[];
    visit(visitor: (node: ASTNode) => boolean | null): boolean | null;
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
}
