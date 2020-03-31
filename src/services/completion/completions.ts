import { JSONSchema } from "vscode-json-languageservice"
import {
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    TextDocument,
} from "vscode-languageserver-types"
import * as nls from "vscode-nls"

import {
    ASTNode,
    NullASTNode,
    ObjectASTNode,
    PropertyASTNode,
    YAMLDocument,
} from "../../parser"
import * as helpers from "./helpers"
import * as textCompletions from "./text"

const localize = nls.loadMessageBundle()

export interface CompletionsCollector {
    add(suggestion: CompletionItem): void
    error(message: string): void
    log(message: string): void
    setAsIncomplete(): void
    getNumberOfProposals(): number
}

export const getPropertyCompletions = (
    textDocument: TextDocument,
    schema: JSONSchema,
    doc: YAMLDocument,
    node: ASTNode,
    collector: CompletionsCollector,
    separatorAfter: string
): void => {
    const matchingSchemas = doc.getMatchingSchemas(schema)
    matchingSchemas.forEach((s) => {
        if (s.node === node && !s.inverted) {
            const schemaProperties = s.schema.properties
            if (schemaProperties) {
                Object.keys(schemaProperties).forEach((key: string) => {
                    const propertySchema = schemaProperties[key] as JSONSchema
                    if (
                        !propertySchema.deprecationMessage &&
                        !propertySchema.doNotSuggest
                    ) {
                        collector.add({
                            kind: CompletionItemKind.Property,
                            label: key,
                            insertText: textCompletions.getInsertTextForProperty(
                                key,
                                propertySchema,
                                separatorAfter,
                                1,
                                helpers.isInArray(textDocument, node)
                            ),
                            insertTextFormat: InsertTextFormat.Snippet,
                            documentation: propertySchema.description || "",
                        })
                    }
                })
            }

            if (
                node.type === "object" &&
                node.parent &&
                node.parent.type === "array" &&
                s.schema.type !== "object"
            ) {
                addSchemaValueCompletions(s.schema, collector, separatorAfter)
            }
        }
    })
}

export const getValueCompletions = async (
    schema: JSONSchema,
    doc: YAMLDocument,
    completionNode: ASTNode | null,
    offset: number,
    document: TextDocument,
    collector: CompletionsCollector
    // eslint-disable-next-line @typescript-eslint/require-await
): Promise<void> => {
    let offsetForSeparator = offset
    let parentKey: string | null = null
    let node: ASTNode | null = completionNode

    if (
        node &&
        (node.type === "string" ||
            node.type === "number" ||
            node.type === "boolean")
    ) {
        offsetForSeparator = node.end
        node = node.parent
    }

    if (node && node instanceof NullASTNode) {
        const nodeParent = node.parent

        /*
         * This is going to be an object for some reason and we need to find the property
         * Its an issue with the null node
         */
        if (nodeParent && nodeParent instanceof ObjectASTNode) {
            nodeParent.properties.forEach((prop) => {
                if (
                    prop.key &&
                    prop.key.location === (node as NullASTNode).location
                ) {
                    node = prop
                }
            })
        }
    }

    if (!node) {
        addSchemaValueCompletions(schema, collector, "")
        return
    }

    if (
        node.type === "property" &&
        offset > (node as PropertyASTNode).colonOffset
    ) {
        const propertyNode = node as PropertyASTNode
        const propertyValueNode = propertyNode.value
        if (propertyValueNode && offset > propertyValueNode.end) {
            return // we are past the value node
        }
        parentKey = propertyNode.key.value
        node = node.parent
    }

    const separatorAfter = helpers.evaluateSeparatorAfter(
        document,
        offsetForSeparator
    )
    if (
        node &&
        (parentKey !== null || node.type === "array" || node.type === "object")
    ) {
        const matchingSchemas = doc.getMatchingSchemas(schema)

        matchingSchemas.map((s) => {
            if (s.node === node && !s.inverted && s.schema) {
                if (s.schema.items) {
                    if (Array.isArray(s.schema.items)) {
                        const index = helpers.findItemAtOffset(
                            node,
                            document,
                            offset
                        )
                        if (index < s.schema.items.length) {
                            addSchemaValueCompletions(
                                (s.schema.items as JSONSchema[])[index],
                                collector,
                                separatorAfter,
                                true
                            )
                        }
                    } else if (
                        (s.schema.items as JSONSchema).type === "object"
                    ) {
                        collector.add({
                            kind: helpers.getSuggestionKind(
                                (s.schema.items as JSONSchema).type
                            ),
                            label: `- (array item)`,
                            documentation: `Create an item of an array${
                                s.schema.description === undefined
                                    ? ""
                                    : "(" + s.schema.description + ")"
                            }`,
                            insertText: `- ${textCompletions
                                .getInsertTextForObject(
                                    s.schema.items as JSONSchema,
                                    separatorAfter
                                )
                                .insertText.trimLeft()}`,
                            insertTextFormat: InsertTextFormat.Snippet,
                        })
                    } else {
                        addSchemaValueCompletions(
                            s.schema.items as JSONSchema,
                            collector,
                            separatorAfter,
                            true
                        )
                    }
                }
                if (s.schema.properties && parentKey) {
                    const propertySchema = s.schema.properties[parentKey]
                    if (propertySchema) {
                        addSchemaValueCompletions(
                            propertySchema as JSONSchema,
                            collector,
                            separatorAfter,
                            false
                        )
                    }
                }
            }
        })
    }
}

export const addSchemaValueCompletions = (
    schema: JSONSchema,
    collector: CompletionsCollector,
    separatorAfter: string,
    forArrayItem = false
): void => {
    const types: { [type: string]: boolean } = {}
    addSchemaValueCompletionsCore(
        schema,
        collector,
        types,
        separatorAfter,
        forArrayItem
    )

    if (types.boolean) {
        addBooleanValueCompletion(true, collector, separatorAfter)
        addBooleanValueCompletion(false, collector, separatorAfter)
    }
    if (types.null) {
        addNullValueCompletion(collector, separatorAfter)
    }
}

export const addSchemaValueCompletionsCore = (
    schema: JSONSchema,
    collector: CompletionsCollector,
    types: { [type: string]: boolean },
    separatorAfter: string,
    forArrayItem = false
): void => {
    addDefaultValueCompletions(
        schema,
        collector,
        separatorAfter,
        0,
        forArrayItem
    )
    addEnumValueCompletions(schema, collector, separatorAfter, forArrayItem)
    collectTypes(schema, types)
    if (Array.isArray(schema.allOf)) {
        schema.allOf.forEach((s) =>
            addSchemaValueCompletionsCore(
                s as JSONSchema,
                collector,
                types,
                separatorAfter,
                forArrayItem
            )
        )
    }
    if (Array.isArray(schema.anyOf)) {
        schema.anyOf.forEach((s) =>
            addSchemaValueCompletionsCore(
                s as JSONSchema,
                collector,
                types,
                separatorAfter,
                forArrayItem
            )
        )
    }
    if (Array.isArray(schema.oneOf)) {
        schema.oneOf.forEach((s) =>
            addSchemaValueCompletionsCore(
                s as JSONSchema,
                collector,
                types,
                separatorAfter,
                forArrayItem
            )
        )
    }
}

export const addDefaultValueCompletions = (
    schema: JSONSchema,
    collector: CompletionsCollector,
    separatorAfter: string,
    arrayDepth = 0,
    forArrayItem = false
): void => {
    let hasProposals = false
    if (schema.default) {
        let type = schema.type
        let value = schema.default
        for (let i = arrayDepth; i > 0; i--) {
            value = [value]
            type = "array"
        }
        collector.add({
            kind: helpers.getSuggestionKind(type),
            label: forArrayItem
                ? `- ${helpers.getLabelForValue(value)}`
                : helpers.getLabelForValue(value),
            insertText: forArrayItem
                ? `- ${textCompletions.getInsertTextForValue(
                      value,
                      separatorAfter
                  )}`
                : textCompletions.getInsertTextForValue(value, separatorAfter),
            insertTextFormat: InsertTextFormat.Snippet,
            detail: localize("json.suggest.default", "Default value"),
        })
        hasProposals = true
    }
    if (!hasProposals && schema.items && !Array.isArray(schema.items)) {
        addDefaultValueCompletions(
            schema.items as JSONSchema,
            collector,
            separatorAfter,
            arrayDepth + 1
        )
    }
}

export const addEnumValueCompletions = (
    schema: JSONSchema,
    collector: CompletionsCollector,
    separatorAfter: string,
    forArrayItem = false
): void => {
    if (Array.isArray(schema.enum)) {
        for (let i = 0, length = schema.enum.length; i < length; i++) {
            const enm = schema.enum[i]
            let documentation = schema.description
            if (schema.enumDescriptions && i < schema.enumDescriptions.length) {
                documentation = schema.enumDescriptions[i]
            }
            collector.add({
                kind: helpers.getSuggestionKind(schema.type),
                label: forArrayItem
                    ? `- ${helpers.getLabelForValue(enm)}`
                    : helpers.getLabelForValue(enm),
                insertText: forArrayItem
                    ? `- ${textCompletions.getInsertTextForValue(
                          enm,
                          separatorAfter
                      )}`
                    : textCompletions.getInsertTextForValue(
                          enm,
                          separatorAfter
                      ),
                insertTextFormat: InsertTextFormat.Snippet,
                documentation,
            })
        }
    }
}

export const collectTypes = (
    schema: JSONSchema,
    types: { [type: string]: boolean }
) => {
    const type = schema.type
    if (Array.isArray(type)) {
        type.forEach((t) => (types[t] = true))
    } else if (type) {
        types[type] = true
    }
}

export const addBooleanValueCompletion = (
    value: boolean,
    collector: CompletionsCollector,
    separatorAfter: string
): void => {
    collector.add({
        kind: helpers.getSuggestionKind("boolean"),
        label: value ? "true" : "false",
        insertText: textCompletions.getInsertTextForValue(
            value,
            separatorAfter
        ),
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "",
    })
}

export const addNullValueCompletion = (
    collector: CompletionsCollector,
    separatorAfter: string
): void => {
    collector.add({
        kind: helpers.getSuggestionKind("null"),
        label: "null",
        insertText: "null" + separatorAfter,
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "",
    })
}
