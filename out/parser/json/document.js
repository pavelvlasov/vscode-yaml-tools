"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_document_1 = require("./json-document");
const Yaml = require("yaml-ast-parser");
const scalar_type_1 = require("../scalar-type");
const array_ast_node_1 = require("./array-ast-node");
const boolean_ast_node_1 = require("./boolean-ast-node");
const null_ast_node_1 = require("./null-ast-node");
const number_ast_node_1 = require("./number-ast-node");
const object_ast_node_1 = require("./object-ast-node");
const property_ast_node_1 = require("./property-ast-node");
const string_ast_node_1 = require("./string-ast-node");
class YAMLDocument extends json_document_1.JSONDocument {
    constructor(uri, yamlDoc) {
        super(uri, null, []);
        this.root = null;
        this.errors = [];
        this.warnings = [];
        this.parameters = [];
        if (yamlDoc) {
            this.root = this.recursivelyBuildAst(null, yamlDoc);
        }
        this.errors = [];
        this.warnings = [];
    }
    getSchemas(schema, doc, node) {
        const matchingSchemas = [];
        doc.validate(schema, matchingSchemas, node.start);
        return matchingSchemas;
    }
    getNodeFromOffset(offset) {
        return this.getNodeFromOffsetEndInclusive(offset);
    }
    recursivelyBuildAst(parent, node) {
        if (!node) {
            return null;
        }
        switch (node.kind) {
            case Yaml.Kind.MAP: {
                const instance = node;
                const result = new object_ast_node_1.ObjectASTNode(this, parent, null, node.startPosition, node.endPosition);
                for (const mapping of instance.mappings) {
                    result.addProperty(this.recursivelyBuildAst(result, mapping));
                }
                return result;
            }
            case Yaml.Kind.MAPPING: {
                const instance = node;
                const key = instance.key;
                // Technically, this is an arbitrary node in YAML
                // I doubt we would get a better string representation by parsing it
                const keyNode = new string_ast_node_1.StringASTNode(this, null, null, true, key.startPosition, key.endPosition);
                keyNode.value = key.value;
                const result = new property_ast_node_1.PropertyASTNode(this, parent, keyNode);
                result.end = instance.endPosition;
                const valueNode = instance.value
                    ? this.recursivelyBuildAst(result, instance.value)
                    : new null_ast_node_1.NullASTNode(this, parent, key.value, instance.endPosition, instance.endPosition);
                if (valueNode) {
                    valueNode.location = key.value;
                    result.value = valueNode;
                }
                return result;
            }
            case Yaml.Kind.SEQ: {
                const instance = node;
                const result = new array_ast_node_1.ArrayASTNode(this, parent, null, instance.startPosition, instance.endPosition);
                let count = 0;
                for (const item of instance.items) {
                    if (item === null && count === instance.items.length - 1) {
                        break;
                    }
                    // Be aware of https://github.com/nodeca/js-yaml/issues/321
                    // Cannot simply work around it here because we need to know if we are in Flow or Block
                    const itemNode = item === null
                        ? new null_ast_node_1.NullASTNode(this, parent, null, instance.endPosition, instance.endPosition)
                        : this.recursivelyBuildAst(result, item);
                    if (itemNode) {
                        itemNode.location = count++;
                        result.addItem(itemNode);
                    }
                }
                return result;
            }
            case Yaml.Kind.SCALAR: {
                const instance = node;
                const type = Yaml.determineScalarType(instance);
                // The name is set either by the sequence or the mapping case.
                const name = null;
                const value = instance.value;
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
                ];
                if (instance.plainScalar &&
                    possibleBooleanValues.indexOf(value.toString()) !== -1) {
                    return new boolean_ast_node_1.BooleanASTNode(this, parent, name, scalar_type_1.parseYamlBoolean(value), node.startPosition, node.endPosition);
                }
                switch (type) {
                    case Yaml.ScalarType.null: {
                        return new string_ast_node_1.StringASTNode(this, parent, name, false, instance.startPosition, instance.endPosition);
                    }
                    case Yaml.ScalarType.bool: {
                        return new boolean_ast_node_1.BooleanASTNode(this, parent, name, Yaml.parseYamlBoolean(value), node.startPosition, node.endPosition);
                    }
                    case Yaml.ScalarType.int: {
                        const result = new number_ast_node_1.NumberASTNode(this, parent, name, node.startPosition, node.endPosition);
                        result.value = Yaml.parseYamlInteger(value);
                        result.isInteger = true;
                        return result;
                    }
                    case Yaml.ScalarType.float: {
                        const result = new number_ast_node_1.NumberASTNode(this, parent, name, node.startPosition, node.endPosition);
                        result.value = Yaml.parseYamlFloat(value);
                        result.isInteger = false;
                        return result;
                    }
                    case Yaml.ScalarType.string: {
                        const result = new string_ast_node_1.StringASTNode(this, parent, name, false, node.startPosition, node.endPosition);
                        result.value = node.value;
                        return result;
                    }
                }
                break;
            }
            case Yaml.Kind.ANCHOR_REF: {
                const instance = node.value;
                return (this,
                    this.recursivelyBuildAst(parent, instance) ||
                        new null_ast_node_1.NullASTNode(this, parent, null, node.startPosition, node.endPosition));
            }
            case Yaml.Kind.INCLUDE_REF: {
                const result = new string_ast_node_1.StringASTNode(this, parent, null, false, node.startPosition, node.endPosition);
                result.value = node.value;
                return result;
            }
        }
    }
}
exports.YAMLDocument = YAMLDocument;
//# sourceMappingURL=document.js.map