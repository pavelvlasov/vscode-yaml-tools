"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SchemaCollector {
    constructor(focusOffset = -1, exclude = null) {
        this.schemas = [];
        this.focusOffset = focusOffset;
        this.exclude = exclude;
    }
    add(schema) {
        this.schemas.push(schema);
    }
    merge(other) {
        this.schemas.push(...other.schemas);
    }
    include(node) {
        return ((this.focusOffset === -1 || node.contains(this.focusOffset)) &&
            node !== this.exclude);
    }
    newSub() {
        return new SchemaCollector(-1, this.exclude);
    }
}
exports.SchemaCollector = SchemaCollector;
class NoOpSchemaCollector {
    get schemas() {
        return [];
    }
    add() {
        return;
    }
    merge() {
        return;
    }
    include() {
        return true;
    }
    newSub() {
        return this;
    }
}
exports.NoOpSchemaCollector = NoOpSchemaCollector;
//# sourceMappingURL=schema-collector.js.map