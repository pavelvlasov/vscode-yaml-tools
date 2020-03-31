import * as Json from "jsonc-parser";
import { YAMLDocument } from "../index";
import { ASTNode } from "./ast-node";
export declare class NullASTNode extends ASTNode<null> {
    constructor(document: YAMLDocument, parent: ASTNode | null, name: Json.Segment | null, start: number, end?: number);
}
