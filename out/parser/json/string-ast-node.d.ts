import * as Json from "jsonc-parser";
import { JSONSchema } from "vscode-json-languageservice";
import { YAMLDocument } from "../index";
import { ASTNode, ISchemaCollector } from "./ast-node";
import { ValidationResult } from "./validation-result";
export declare class StringASTNode extends ASTNode<string> {
    isKey: boolean;
    constructor(document: YAMLDocument, parent: ASTNode | null, name: Json.Segment | null, isKey: boolean, start: number, end?: number);
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
}
