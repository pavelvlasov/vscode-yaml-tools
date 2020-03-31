import { ASTNode, IApplicableSchema, ISchemaCollector } from "./ast-node";
export declare class SchemaCollector implements ISchemaCollector {
    schemas: IApplicableSchema[];
    private focusOffset;
    private exclude;
    constructor(focusOffset?: number, exclude?: ASTNode | null);
    add(schema: IApplicableSchema): void;
    merge(other: ISchemaCollector): void;
    include(node: ASTNode): boolean;
    newSub(): ISchemaCollector;
}
export declare class NoOpSchemaCollector implements ISchemaCollector {
    get schemas(): never[];
    add(): void;
    merge(): void;
    include(): boolean;
    newSub(): ISchemaCollector;
}
