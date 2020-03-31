"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map = require("lodash/map");
function equals(one, other) {
    if (one === other) {
        return true;
    }
    if (one === null ||
        one === undefined ||
        other === null ||
        other === undefined) {
        return false;
    }
    if (typeof one !== typeof other) {
        return false;
    }
    if (typeof one !== "object") {
        return false;
    }
    if (Array.isArray(one) !== Array.isArray(other)) {
        return false;
    }
    if (Array.isArray(one)) {
        if (one.length !== other.length) {
            return false;
        }
        for (let i = 0; i < one.length; i++) {
            if (!equals(one[i], other[i])) {
                return false;
            }
        }
    }
    else {
        const oneKeys = map(one, (item, oneKey) => oneKey);
        oneKeys.sort();
        const otherKeys = map(other, (item, otherKey) => otherKey);
        otherKeys.sort();
        if (!equals(oneKeys, otherKeys)) {
            return false;
        }
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < oneKeys.length; i++) {
            if (!equals(one[oneKeys[i]], other[oneKeys[i]])) {
                return false;
            }
        }
    }
    return true;
}
exports.equals = equals;
exports.logObject = (obj) => {
    const cache = [];
    const res = JSON.stringify(obj, (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (cache.includes(value)) {
                // Duplicate reference found
                try {
                    // If this value does not reference a parent it can be deduped
                    return JSON.parse(JSON.stringify(value));
                }
                catch (error) {
                    // discard key if value cannot be deduped
                    return;
                }
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    }, 2);
    // eslint-disable-next-line no-console
    console.log(res);
};
//# sourceMappingURL=objects.js.map