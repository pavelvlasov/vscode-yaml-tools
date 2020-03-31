import { JSONSchema, Segment } from "vscode-json-languageservice";
import { YAMLDocument } from "../index";
import { ASTNode, ISchemaCollector } from "./ast-node";
import { StringASTNode } from "./string-ast-node";
import { ValidationResult } from "./validation-result";
export declare class PropertyASTNode extends ASTNode<ASTNode> {
    key: StringASTNode;
    colonOffset: number;
    constructor(document: YAMLDocument, parent: ASTNode | null, key: StringASTNode);
    getChildNodes(): ASTNode[];
    getLastChild(): ASTNode | null;
    getLocation(): Segment | null;
    visit(visitor: (node: ASTNode) => boolean | null): boolean | null;
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
}
