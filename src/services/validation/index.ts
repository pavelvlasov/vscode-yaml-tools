import {
	ErrorCode,
	Problem,
	YAMLDocument
} from "../../parser"
import {
	Diagnostic,
	DiagnosticSeverity,
	TextDocument
} from "vscode-languageserver"

import { removeDuplicatesObj } from "../../utils/array"
import { JSONSchema } from "vscode-json-languageservice"

export class YAMLValidation {
    private schema: JSONSchema

	constructor(
        schema: JSONSchema,
	) {
        this.schema = schema
	}

	async doValidation(textDocument: TextDocument, yamlDocument: YAMLDocument) {
		await this.validateWithSchema(textDocument, yamlDocument)
	}

	private async validateWithSchema(
		textDocument: TextDocument,
		yamlDocument: YAMLDocument,
	): Promise<Diagnostic[]> {
		let diagnostics: Diagnostic[] = []
		const added: {[key: string]: boolean} = {}

		const currentDocProblems = yamlDocument.getValidationProblems(
            this.schema
        )
        currentDocProblems.forEach(problem => {
            yamlDocument.errors.push({
                location: {
                    start: problem.location.start,
                    end: problem.location.end
                },
                message: problem.message,
                code: ErrorCode.Undefined
            })
        })

        // @ts-ignore
        if (this.schema && this.schema.errors.length > 0) {
            // @ts-ignore
            this.schema.errors.forEach(error => {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: {
                            line: 0,
                            character: 0
                        },
                        end: {
                            line: 0,
                            character: 1
                        }
                    },
                    message: error
                })
            })
        }

		const addProblem = (
			{ message, location }: Problem,
			severity: DiagnosticSeverity
		) => {
			const signature = `${location.start} ${location.end} ${message}`
			// remove duplicated messages
			if (!added[signature]) {
				added[signature] = true
				const range = {
					start: textDocument.positionAt(location.start),
					end: textDocument.positionAt(location.end)
				}
				diagnostics.push({
					severity,
					range,
					message: `[Serverless IDE] ${message}`
				})
			}
		}

		yamlDocument.errors.forEach(error => {
			addProblem(error, DiagnosticSeverity.Error)
		})

		yamlDocument.warnings.forEach(warning => {
			addProblem(warning, DiagnosticSeverity.Warning)
		})

		return removeDuplicatesObj(diagnostics)
	}
}