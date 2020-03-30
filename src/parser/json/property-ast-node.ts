import { Segment } from "vscode-json-languageservice"

import { JSONSchema } from "../../model"
import { YAMLDocument } from "../index"
import { ASTNode, ISchemaCollector } from "./ast-node"
import { StringASTNode } from "./string-ast-node"
import { ValidationResult } from "./validation-result"

export class PropertyASTNode extends ASTNode<ASTNode> {
	key: StringASTNode
	colonOffset: number

	constructor(
		document: YAMLDocument,
		parent: ASTNode | null,
		key: StringASTNode
	) {
		super(document, parent, "property", null, key.start, key.end)
		this.key = key
		key.parent = this
		key.location = key.value
		this.colonOffset = -1
	}

	getChildNodes(): ASTNode[] {
		return this.value ? [this.key, this.value] : [this.key]
	}

	getLastChild(): ASTNode | null {
		return this.value
	}

	getLocation(): Segment | null {
		return this.key.location
	}

	visit(visitor: (node: ASTNode) => boolean | null): boolean | null {
		return (
			visitor(this as ASTNode) &&
			this.key.visit(visitor) &&
			this.value &&
			this.value.visit(visitor)
		)
	}

	validate(
		schema: JSONSchema,
		validationResult: ValidationResult,
		matchingSchemas: ISchemaCollector
	): void {
		if (!matchingSchemas.include(this as ASTNode)) {
			return
		}
		if (this.value) {
			this.value.validate(schema, validationResult, matchingSchemas)
		}
	}
}
