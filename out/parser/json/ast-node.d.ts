import * as Json from "jsonc-parser";
import { JSONSchema, Segment } from "vscode-json-languageservice";
import { YAMLDocument } from "..";
import { ValidationResult } from "./validation-result";
export interface IApplicableSchema {
    node: ASTNode;
    inverted?: boolean;
    schema: JSONSchema;
}
export declare enum EnumMatch {
    Key = 0,
    Enum = 1
}
export interface ISchemaCollector {
    schemas: IApplicableSchema[];
    add(schema: IApplicableSchema): void;
    merge(other: ISchemaCollector): void;
    include(node: ASTNode): boolean;
    newSub(): ISchemaCollector;
}
export declare class ASTNode<TValue = unknown> {
    start: number;
    end: number;
    type: string;
    parent: ASTNode | null;
    location: Json.Segment | null;
    document: YAMLDocument;
    protected _value: TValue | null;
    constructor(document: YAMLDocument, parent: ASTNode | null, type: string, location: Json.Segment | null, start: number, end?: number);
    get value(): TValue | null;
    set value(newValue: TValue | null);
    get nodeType(): string;
    getPath(): Json.JSONPath;
    getLocation(): Segment | null;
    getChildNodes(): ASTNode[];
    getLastChild(): ASTNode | null;
    contains(offset: number, includeRightBound?: boolean): boolean;
    toString(): string;
    visit(visitor: (node: ASTNode) => boolean | null): boolean | null;
    getNodeFromOffset(offset: number): ASTNode | null;
    getNodeCollectorCount(): number;
    getNodeFromOffsetEndInclusive(offset: number): ASTNode | null;
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
    get(path: Segment[]): ASTNode | null;
}
