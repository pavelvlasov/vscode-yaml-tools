import { ASTNode, IApplicableSchema, ISchemaCollector } from "./ast-node"

export class SchemaCollector implements ISchemaCollector {
	schemas: IApplicableSchema[] = []
	private focusOffset: number
	private exclude: ASTNode | null
	constructor(focusOffset: number = -1, exclude: ASTNode | null = null) {
		this.focusOffset = focusOffset
		this.exclude = exclude
	}
	add(schema: IApplicableSchema) {
		this.schemas.push(schema)
	}
	merge(other: ISchemaCollector) {
		this.schemas.push(...other.schemas)
	}
	include(node: ASTNode) {
		return (
			(this.focusOffset === -1 || node.contains(this.focusOffset)) &&
			node !== this.exclude
		)
	}
	newSub(): ISchemaCollector {
		return new SchemaCollector(-1, this.exclude)
	}
}

export class NoOpSchemaCollector implements ISchemaCollector {
	get schemas() {
		return []
	}
	add() {
		return
	}
	merge() {
		return
	}
	include() {
		return true
	}
	newSub(): ISchemaCollector {
		return this
	}
}