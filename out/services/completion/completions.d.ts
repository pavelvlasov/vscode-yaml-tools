import { JSONSchema } from "vscode-json-languageservice";
import { CompletionItem, TextDocument } from "vscode-languageserver-types";
import { ASTNode, YAMLDocument } from "../../parser";
export interface CompletionsCollector {
    add(suggestion: CompletionItem): void;
    error(message: string): void;
    log(message: string): void;
    setAsIncomplete(): void;
    getNumberOfProposals(): number;
}
export declare const getPropertyCompletions: (textDocument: TextDocument, schema: JSONSchema, doc: YAMLDocument, node: ASTNode<unknown>, collector: CompletionsCollector, separatorAfter: string) => void;
export declare const getValueCompletions: (schema: JSONSchema, doc: YAMLDocument, completionNode: ASTNode<unknown> | null, offset: number, document: TextDocument, collector: CompletionsCollector) => Promise<void>;
export declare const addSchemaValueCompletions: (schema: JSONSchema, collector: CompletionsCollector, separatorAfter: string, forArrayItem?: boolean) => void;
export declare const addSchemaValueCompletionsCore: (schema: JSONSchema, collector: CompletionsCollector, types: {
    [type: string]: boolean;
}, separatorAfter: string, forArrayItem?: boolean) => void;
export declare const addDefaultValueCompletions: (schema: JSONSchema, collector: CompletionsCollector, separatorAfter: string, arrayDepth?: number, forArrayItem?: boolean) => void;
export declare const addEnumValueCompletions: (schema: JSONSchema, collector: CompletionsCollector, separatorAfter: string, forArrayItem?: boolean) => void;
export declare const collectTypes: (schema: JSONSchema, types: {
    [type: string]: boolean;
}) => void;
export declare const addBooleanValueCompletion: (value: boolean, collector: CompletionsCollector, separatorAfter: string) => void;
export declare const addNullValueCompletion: (collector: CompletionsCollector, separatorAfter: string) => void;
