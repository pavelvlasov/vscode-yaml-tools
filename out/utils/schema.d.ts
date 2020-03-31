import { JSONSchema } from "vscode-json-languageservice";
export declare const getLastDescription: (path: string[], schema: JSONSchema) => string | void;
export declare const getSection: (path: string[], schema: JSONSchema) => JSONSchema | null;
