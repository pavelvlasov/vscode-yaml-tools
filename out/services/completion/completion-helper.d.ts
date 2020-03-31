import { Position, TextDocument } from "vscode-languageserver";
interface Output {
    newDocument: TextDocument;
    newPosition: Position;
}
export declare const completionHelper: (document: TextDocument, textDocumentPosition: Position) => Output;
export {};
