import * as Parser from "../../parser"
import {
	Hover,
	MarkedString,
	Position,
	Range,
	TextDocument
} from "vscode-languageserver-types"
import { JSONSchema } from "vscode-json-languageservice"
import { getLastDescription } from "../../utils/schema"

const createHover = (contents: MarkedString[], hoverRange: Range): Hover => {
	const result: Hover = {
		contents,
		range: hoverRange
	}
	return result
}

export class YAMLHover {
    private schema: JSONSchema

    constructor(schema: JSONSchema) {
        this.schema = schema
    }

	async doHover(
		document: TextDocument,
		position: Position,
		doc: Parser.YAMLDocument
	): Promise<Hover | void> {
		const contents = []

		const offset = document.offsetAt(position)
		const node = doc.getNodeFromOffset(offset)

		if (
			!node ||
			((node.type === "object" || node.type === "array") &&
				offset > node.start + 1 &&
				offset < node.end - 1)
		) {
			return Promise.resolve(void 0)
		}
		const hoverRangeNode = node
		const hoverRange = Range.create(
			document.positionAt(hoverRangeNode.start),
			document.positionAt(hoverRangeNode.end)
		)
		const path = node.getPath()

		if (path.length > 1) {
			const description = getLastDescription(
                node.getPath().map(String),
                this.schema
			)

			if (description) {
				contents.push(description)
			}
		}

		if (contents.length > 0) {
			return createHover(contents, hoverRange)
		}

		return
	}
}