import { ASTNode } from "../../parser";
import { CompletionItemKind, TextDocument } from "vscode-languageserver-types";
export declare const getLabelForValue: (value: any) => string;
export declare const getSuggestionKind: (type: any) => CompletionItemKind;
export declare const getCurrentWord: (document: TextDocument, offset: number) => string;
export declare const findItemAtOffset: (node: ASTNode<unknown>, document: TextDocument, offset: number) => number;
export declare const isInComment: (document: TextDocument, start: number, offset: number) => boolean;
export declare const evaluateSeparatorAfter: (document: TextDocument, offset: number) => string;
export declare const isInArray: (document: TextDocument, node: ASTNode<unknown>) => boolean;
