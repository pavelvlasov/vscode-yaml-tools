import { JSONDocument } from "./json-document"
import * as Yaml from "yaml-ast-parser"
import { parseYamlBoolean } from "../scalar-type"
import { ArrayASTNode } from "./array-ast-node"
import { ASTNode } from "./ast-node"
import { BooleanASTNode } from "./boolean-ast-node"
import { NullASTNode } from "./null-ast-node"
import { NumberASTNode } from "./number-ast-node"
import { ObjectASTNode } from "./object-ast-node"
import { PropertyASTNode } from "./property-ast-node"
import { StringASTNode } from "./string-ast-node"
import { ErrorCode } from "./validation-result"

export interface Problem {
	message: string
	location: {
		start: number
		end: number
	}
	code: ErrorCode
}

export class YAMLDocument extends JSONDocument {
	root: ASTNode | null = null
	errors: Problem[] = []
	warnings: Problem[] = []
	parameters: string[] = []

	constructor(
		uri: string,
		yamlDoc: Yaml.YAMLNode | void
	) {
		super(uri, null, [])
		if (yamlDoc) {
			this.root = this.recursivelyBuildAst(null, yamlDoc)
		}
		this.errors = []
		this.warnings = []
	}

	getSchemas(schema: any, doc: any, node: ASTNode) {
		const matchingSchemas: any[] = []
		doc.validate(schema, matchingSchemas, node.start)
		return matchingSchemas
	}

	getNodeFromOffset(offset: number): ASTNode | null {
		return this.getNodeFromOffsetEndInclusive(offset)
	}

	private recursivelyBuildAst(parent: ASTNode | null, node: Yaml.YAMLNode): ASTNode | null {
		if (!node) {
			return null;
		}

		switch (node.kind) {
			case Yaml.Kind.MAP: {
				const instance = node as Yaml.YamlMap

				const result = new ObjectASTNode(
					this,
					parent,
					null,
					node.startPosition,
					node.endPosition
				)

				for (const mapping of instance.mappings) {
					result.addProperty(this.recursivelyBuildAst(
						result,
						mapping
					) as PropertyASTNode)
				}

				return result
			}
			case Yaml.Kind.MAPPING: {
				const instance = node as Yaml.YAMLMapping
				const key = instance.key

				// Technically, this is an arbitrary node in YAML
				// I doubt we would get a better string representation by parsing it
				const keyNode = new StringASTNode(
					this,
					null,
					null,
					true,
					key.startPosition,
					key.endPosition
				)
				keyNode.value = key.value

				const result = new PropertyASTNode(
					this,
					parent,
					keyNode
				)
				result.end = instance.endPosition

				const valueNode = instance.value
					? this.recursivelyBuildAst(result, instance.value)
					: new NullASTNode(
							this,
							parent,
							key.value,
							instance.endPosition,
							instance.endPosition
					  )
				
				if (valueNode) {
					valueNode.location = key.value
	
					result.value = valueNode
				}

				return result
			}
			case Yaml.Kind.SEQ: {
				const instance = node as Yaml.YAMLSequence

				const result = new ArrayASTNode(
					this,
					parent,
					null,
					instance.startPosition,
					instance.endPosition
				)

				let count = 0
				for (const item of instance.items) {
					if (item === null && count === instance.items.length - 1) {
						break
					}

					// Be aware of https://github.com/nodeca/js-yaml/issues/321
					// Cannot simply work around it here because we need to know if we are in Flow or Block
					const itemNode =
						item === null
							? new NullASTNode(
									this,
									parent,
									null,
									instance.endPosition,
									instance.endPosition
							  )
							: this.recursivelyBuildAst(result, item)

					if (itemNode) {
						itemNode.location = count++
						result.addItem(itemNode)
					}
				}

				return result
			}
			case Yaml.Kind.SCALAR: {
				const instance = node as Yaml.YAMLScalar
				const type = Yaml.determineScalarType(instance)

				// The name is set either by the sequence or the mapping case.
				const name = null
				const value = instance.value

				// This is a patch for redirecting values with these strings to be boolean nodes because its not supported in the parser.
				const possibleBooleanValues = [
					"y",
					"Y",
					"yes",
					"Yes",
					"YES",
					"n",
					"N",
					"no",
					"No",
					"NO",
					"on",
					"On",
					"ON",
					"off",
					"Off",
					"OFF"
				]
				if (
					instance.plainScalar &&
					possibleBooleanValues.indexOf(value.toString()) !== -1
				) {
					return new BooleanASTNode(
						this,
						parent,
						name,
						parseYamlBoolean(value),
						node.startPosition,
						node.endPosition
					)
				}

				switch (type) {
					case Yaml.ScalarType.null: {
						return new StringASTNode(
							this,
							parent,
							name,
							false,
							instance.startPosition,
							instance.endPosition
						)
					}
					case Yaml.ScalarType.bool: {
						return new BooleanASTNode(
							this,
							parent,
							name,
							Yaml.parseYamlBoolean(value),
							node.startPosition,
							node.endPosition
						)
					}
					case Yaml.ScalarType.int: {
						const result = new NumberASTNode(
							this,
							parent,
							name,
							node.startPosition,
							node.endPosition
						)
						result.value = Yaml.parseYamlInteger(value)
						result.isInteger = true
						return result
					}
					case Yaml.ScalarType.float: {
						const result = new NumberASTNode(
							this,
							parent,
							name,
							node.startPosition,
							node.endPosition
						)
						result.value = Yaml.parseYamlFloat(value)
						result.isInteger = false
						return result
					}
					case Yaml.ScalarType.string: {
						const result = new StringASTNode(
							this,
							parent,
							name,
							false,
							node.startPosition,
							node.endPosition,
						)
						result.value = node.value
						return result
					}
				}

				break
			}
			case Yaml.Kind.ANCHOR_REF: {
				const instance = (node as Yaml.YAMLAnchorReference).value

				return (
					this,
					this.recursivelyBuildAst(parent, instance) ||
						new NullASTNode(
							this,
							parent,
							null,
							node.startPosition,
							node.endPosition
						)
				)
			}
			case Yaml.Kind.INCLUDE_REF: {
				const result = new StringASTNode(
					this,
					parent,
					null,
					false,
					node.startPosition,
					node.endPosition
				)
				result.value = node.value
				return result
			}
		}
	}
}
