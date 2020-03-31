import { ASTNode, ObjectASTNode, PropertyASTNode } from "../parser";
export declare const getNodeItemByKey: (node: ObjectASTNode | ASTNode<unknown>, key: string) => void | PropertyASTNode;
