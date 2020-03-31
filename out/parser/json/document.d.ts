import { JSONDocument } from "./json-document";
import * as Yaml from "yaml-ast-parser";
import { ASTNode } from "./ast-node";
import { ErrorCode } from "./validation-result";
export interface Problem {
    message: string;
    location: {
        start: number;
        end: number;
    };
    code: ErrorCode;
}
export declare class YAMLDocument extends JSONDocument {
    root: ASTNode | null;
    errors: Problem[];
    warnings: Problem[];
    parameters: string[];
    constructor(uri: string, yamlDoc: Yaml.YAMLNode | void);
    getSchemas(schema: any, doc: any, node: ASTNode): any[];
    getNodeFromOffset(offset: number): ASTNode | null;
    private recursivelyBuildAst;
}
