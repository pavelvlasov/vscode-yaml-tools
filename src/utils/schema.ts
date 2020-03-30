import { noop } from "lodash"
import { JSONSchema } from "vscode-json-languageservice"
import { JSONSchemaMap } from "vscode-json-languageservice/lib/umd/jsonSchema"

export const getLastDescription = (
    path: string[],
    schema: JSONSchema
): string | void => {
    let description = undefined

    getSectionRecursive(path, schema, (schemaNode) => {
        if (schemaNode && schemaNode.description) {
            description = schemaNode.description
        }
    })

    return description
}

export const getSection = (
    path: string[],
    schema: JSONSchema
): JSONSchema | null => {
    return getSectionRecursive(path, schema)
}

const getSectionRecursive = (
    path: string[],
    schema: JSONSchema,
    visitor: (schema: JSONSchema) => void = noop
): JSONSchema | null => {
    visitor(schema)

    if (!schema || path.length === 0) {
        return schema
    }

    // independently process each "oneOf" entry to see if our path matches any of them
    if (schema.oneOf && Array.isArray(schema.oneOf)) {
        for (const oneOfEntry of schema.oneOf) {
            const result = getSectionRecursive(
                path.slice(),
                oneOfEntry as JSONSchema,
                visitor
            )

            if (result) {
                // found a match, no need to look further
                return result
            }
        }

        return null
    }

    const next = path.shift()

    if (!next) {
        return null
    }

    if (schema.properties && schema.properties[next]) {
        return getSectionRecursive(
            path,
            schema.properties[next] as JSONSchema,
            visitor
        )
    } else if (schema.patternProperties) {
        Object.keys(schema.patternProperties).forEach((pattern) => {
            const regex = new RegExp(pattern)
            if (regex.test(next)) {
                return getSectionRecursive(
                    path,
                    (schema.patternProperties as JSONSchemaMap)[
                        pattern
                    ] as JSONSchema,
                    visitor
                )
            }
        })
    } else if (schema.additionalProperties) {
        return getSectionRecursive(
            path,
            schema.additionalProperties as JSONSchema,
            visitor
        )
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    } else if (next.match("[0-9]+")) {
        if (schema.items) {
            return getSectionRecursive(
                path,
                schema.items as JSONSchema,
                visitor
            )
        } else if (Array.isArray(schema.items)) {
            try {
                const index = parseInt(next, 10)
                if (schema.items[index]) {
                    return getSectionRecursive(
                        path,
                        schema.items[index],
                        visitor
                    )
                }
                return null
            } catch (err) {
                return null
            }
        }
    }

    return null
}
