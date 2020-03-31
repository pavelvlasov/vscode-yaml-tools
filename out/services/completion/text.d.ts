import { JSONSchema } from "vscode-json-languageservice";
export declare const getInsertTextForPlainText: (text: string) => string;
export declare const getInsertTextForValue: (value: any, separatorAfter: string) => string;
export declare const getInsertTextForString: (schema: JSONSchema, insertIndex?: number) => string;
export declare const getPropertyType: (propertySchema: JSONSchema) => string | undefined;
export declare const getInsertTextForObject: (schema: JSONSchema, separatorAfter: string, indent?: string, insertIndex?: number) => {
    insertText: string;
    insertIndex: number;
    isEmpty: boolean;
};
export declare const getInsertTextForArray: (schema: JSONSchema, separatorAfter: string, indent?: string, insertIndex?: number) => {
    insertText: string;
    insertIndex: number;
};
export declare const getInsertTextForProperty: (key: string, propertySchema: JSONSchema, separatorAfter: string, insertIndex?: number, isInArray?: boolean) => string;
