import { Schema, Type } from "js-yaml"
import { TextDocument } from "vscode-languageserver-types"
import * as Yaml from "yaml-ast-parser"

import { ErrorCode, Problem, YAMLDocument } from "./json"

export { YAMLDocument, Problem }
export * from "./json"

function convertError(e: Yaml.YAMLException): Problem {
    return {
        message: `${e.reason}`,
        location: {
            start: e.mark.position,
            end: e.mark.position + e.mark.column,
        },
        code: ErrorCode.Undefined,
    }
}

function createJSONDocument(
    document: TextDocument,
    yamlDoc: Yaml.YAMLNode | void
) {
    const doc = new YAMLDocument(document.uri, yamlDoc)

    if (!yamlDoc || !doc.root) {
        // TODO: When this is true, consider not pushing the other errors.
        doc.errors.push({
            message: "Expected a YAML object, array or literal",
            code: ErrorCode.Undefined,
            location: yamlDoc
                ? {
                      start: yamlDoc.startPosition,
                      end: yamlDoc.endPosition,
                  }
                : { start: 0, end: 0 },
        })

        return doc
    }

    const duplicateKeyReason = "duplicate key"

    // Patch ontop of yaml-ast-parser to disable duplicate key message on merge key
    const isDuplicateAndNotMergeKey = (
        error: Yaml.YAMLException,
        yamlText: string
    ) => {
        const errorConverted = convertError(error)
        const errorStart = errorConverted.location.start
        const errorEnd = errorConverted.location.end
        if (
            error.reason === duplicateKeyReason &&
            yamlText.substring(errorStart, errorEnd).startsWith("<<")
        ) {
            return false
        }
        return true
    }
    doc.errors = yamlDoc.errors
        .filter((e) => e.reason !== duplicateKeyReason && !e.isWarning)
        .map((e) => convertError(e))
    doc.warnings = yamlDoc.errors
        .filter(
            (e) =>
                (e.reason === duplicateKeyReason &&
                    isDuplicateAndNotMergeKey(e, document.getText())) ||
                e.isWarning
        )
        .map((e) => convertError(e))

    return doc
}

export const parse = (document: TextDocument): YAMLDocument => {
    // We need compiledTypeMap to be available from schemaWithAdditionalTags before we add the new custom propertie
    const compiledTypeMap: { [key: string]: Type } = {}

    const schemaWithAdditionalTags = Schema.create(
        Object.values(compiledTypeMap)
    )
    ;(schemaWithAdditionalTags as any).compiledTypeMap = compiledTypeMap

    const additionalOptions: Yaml.LoadOptions = {
        schema: schemaWithAdditionalTags,
    }
    const text = document.getText()

    return createJSONDocument(document, Yaml.load(text, additionalOptions))
}
