import { JSONSchema } from "vscode-json-languageservice";
import { ASTNode, IApplicableSchema } from "./ast-node";
import { IProblem } from "./validation-result";
export declare class JSONDocument {
    readonly uri: string;
    readonly root: ASTNode | null;
    readonly syntaxErrors: IProblem[];
    constructor(uri: string, root: ASTNode | null, syntaxErrors: IProblem[]);
    getNodeFromOffset(offset: number): ASTNode | null;
    getNodeFromOffsetEndInclusive(offset: number): ASTNode | null;
    visit(visitor: (node: ASTNode) => boolean): void;
    validate(schema: JSONSchema): IProblem[] | null;
    getMatchingSchemas(schema: JSONSchema, focusOffset?: number, exclude?: ASTNode | null): IApplicableSchema[];
    getValidationProblems(schema: JSONSchema, focusOffset?: number, exclude?: ASTNode | null): IProblem[];
}
