import { TextDocument } from "vscode-languageserver-types";
import { Problem, YAMLDocument } from "./json";
export { YAMLDocument, Problem };
export * from "./json";
export declare const parse: (document: TextDocument) => YAMLDocument;
