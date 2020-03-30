import { JSONSchema } from "vscode-json-languageservice"
import { ASTNode, IApplicableSchema } from "./ast-node"
import { NoOpSchemaCollector, SchemaCollector } from "./schema-collector"
import { IProblem, ValidationResult } from "./validation-result"

export class JSONDocument {
	readonly uri: string
	readonly root: ASTNode | null
	readonly syntaxErrors: IProblem[]

	constructor(uri: string, root: ASTNode | null, syntaxErrors: IProblem[]) {
		this.uri = uri
		this.root = root
		this.syntaxErrors = syntaxErrors
	}

	getNodeFromOffset(offset: number): ASTNode | null {
		return this.root && this.root.getNodeFromOffset(offset)
	}

	getNodeFromOffsetEndInclusive(offset: number): ASTNode | null {
		return this.root && this.root.getNodeFromOffsetEndInclusive(offset)
	}

	visit(visitor: (node: ASTNode) => boolean): void {
		if (this.root) {
			this.root.visit(visitor)
		}
	}

	validate(schema: JSONSchema): IProblem[] | null {
		if (this.root && schema) {
			const validationResult = new ValidationResult()
			this.root.validate(
				schema,
				validationResult,
				new NoOpSchemaCollector()
			)
			return validationResult.problems
		}
		return null
	}

	getMatchingSchemas(
		schema: JSONSchema,
		focusOffset: number = -1,
		exclude: ASTNode | null = null
	): IApplicableSchema[] {
		const matchingSchemas = new SchemaCollector(focusOffset, exclude)
		const validationResult = new ValidationResult()
		if (this.root && schema) {
			this.root.validate(schema, validationResult, matchingSchemas)
		}
		return matchingSchemas.schemas
	}

	getValidationProblems(
		schema: JSONSchema,
		focusOffset: number = -1,
		exclude: ASTNode | null = null
	) {
		const matchingSchemas = new SchemaCollector(focusOffset, exclude)
		const validationResult = new ValidationResult()
		if (this.root && schema) {
			this.root.validate(schema, validationResult, matchingSchemas)
		}
		return validationResult.problems
	}
}
