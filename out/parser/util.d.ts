import { ObjectASTNode, PropertyASTNode } from "./json";
export declare const findProperty: (objectNode: void | ObjectASTNode, predicate: (node: PropertyASTNode) => boolean) => void | PropertyASTNode;
export declare const getPropertyNodeValue: (propertyNode: void | PropertyASTNode, location: string) => void | ObjectASTNode;
