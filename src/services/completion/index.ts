import { JSONSchema } from "vscode-json-languageservice"
import {
    CompletionItem,
    CompletionList,
    Position,
    Range,
    TextDocument,
    TextEdit,
} from "vscode-languageserver-types"

import * as Parser from "../../parser"
import * as completions from "./completions"
import * as helpers from "./helpers"

export * from "./completion-helper"

export class YAMLCompletion {
    private schema: JSONSchema

    constructor(schema: JSONSchema) {
        this.schema = schema
    }

    doResolve(item: CompletionItem): Promise<CompletionItem> {
        return Promise.resolve(item)
    }

    async doComplete(
        document: TextDocument,
        position: Position,
        doc: Parser.YAMLDocument
    ): Promise<CompletionList> {
        const result: CompletionList = {
            items: [],
            isIncomplete: false,
        }

        const offset = document.offsetAt(position)
        if (document.getText()[offset] === ":") {
            return Promise.resolve(result)
        }

        let node = doc.getNodeFromOffsetEndInclusive(offset)
        if (helpers.isInComment(document, node ? node.start : 0, offset)) {
            return Promise.resolve(result)
        }

        const currentWord = helpers.getCurrentWord(document, offset)

        let overwriteRange: any = null
        if (node && node.type === "null") {
            const nodeStartPos = document.positionAt(node.start)
            nodeStartPos.character += 1
            const nodeEndPos = document.positionAt(node.end)
            nodeEndPos.character += 1
            overwriteRange = Range.create(nodeStartPos, nodeEndPos)
        } else if (
            node &&
            (node.type === "string" ||
                node.type === "number" ||
                node.type === "boolean")
        ) {
            overwriteRange = Range.create(
                document.positionAt(node.start),
                document.positionAt(node.end)
            )
        } else {
            let overwriteStart = offset - currentWord.length
            if (
                overwriteStart > 0 &&
                document.getText()[overwriteStart - 1] === '"'
            ) {
                overwriteStart--
            }
            overwriteRange = Range.create(
                document.positionAt(overwriteStart),
                position
            )
        }

        const proposed: { [key: string]: CompletionItem } = {}
        const collector: completions.CompletionsCollector = {
            add: (suggestion: CompletionItem) => {
                if (!suggestion.data) {
                    suggestion.data = {}
                }
                const existing = proposed[suggestion.label]
                if (!existing) {
                    proposed[suggestion.label] = suggestion
                    if (overwriteRange) {
                        suggestion.textEdit = TextEdit.replace(
                            overwriteRange,
                            suggestion.insertText || ""
                        )
                    }
                    result.items.push(suggestion)
                } else if (!existing.documentation) {
                    existing.documentation = suggestion.documentation
                }
            },
            setAsIncomplete: () => {
                result.isIncomplete = true
            },
            error: (message: string) => {
                // eslint-disable-next-line no-console
                console.log(message)
            },
            log: (message: string) => {
                // eslint-disable-next-line no-console
                console.log(message)
            },
            getNumberOfProposals: () => {
                return result.items.length
            },
        }

        const collectionPromises: Promise<any>[] = []

        let addValue = true

        let currentProperty: Parser.PropertyASTNode | null = null

        if (node) {
            if (node.type === "string") {
                const stringNode = node as Parser.StringASTNode
                if (stringNode.isKey) {
                    addValue = !(
                        node.parent &&
                        (node.parent as Parser.PropertyASTNode).value
                    )
                    currentProperty = node.parent
                        ? (node.parent as Parser.PropertyASTNode)
                        : null
                    if (node.parent) {
                        node = node.parent.parent
                    }
                }
            }
        }

        // proposals for properties
        if (node && node.type === "object") {
            // don't suggest properties that are already present
            const properties = (node as Parser.ObjectASTNode).properties
            properties.forEach((p) => {
                if (!currentProperty || currentProperty !== p) {
                    if (p.key.value) {
                        proposed[p.key.value] = CompletionItem.create("__")
                    }
                }
            })

            let separatorAfter = ""
            if (addValue) {
                separatorAfter = helpers.evaluateSeparatorAfter(
                    document,
                    document.offsetAt(overwriteRange.end)
                )
            }

            // property proposals with schema
            completions.getPropertyCompletions(
                document,
                this.schema,
                doc,
                node,
                collector,
                separatorAfter
            )
        }

        // property proposal for values
        await completions.getValueCompletions(
            this.schema,
            doc,
            node,
            offset,
            document,
            collector
        )

        return Promise.all(collectionPromises).then(() => {
            return result
        })
    }
}
