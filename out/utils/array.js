"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toArray = require("lodash/toArray");
function removeDuplicates(arr, prop) {
    const lookup = {};
    arr.forEach((item) => {
        lookup[item[prop]] = item;
    });
    return toArray(lookup);
}
exports.removeDuplicates = removeDuplicates;
function getLineOffsets(textDocString) {
    const lineOffsets = [];
    const text = textDocString;
    let isLineStart = true;
    for (let i = 0; i < text.length; i++) {
        if (isLineStart) {
            lineOffsets.push(i);
            isLineStart = false;
        }
        const ch = text.charAt(i);
        isLineStart = ch === "\r" || ch === "\n";
        if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
            i++;
        }
    }
    if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
    }
    return lineOffsets;
}
exports.getLineOffsets = getLineOffsets;
function removeDuplicatesObj(objArray) {
    const nonDuplicateSet = new Set();
    const nonDuplicateArr = [];
    objArray.forEach((currObj) => {
        const stringifiedObj = JSON.stringify(currObj);
        if (!nonDuplicateSet.has(stringifiedObj)) {
            nonDuplicateArr.push(currObj);
            nonDuplicateSet.add(stringifiedObj);
        }
    });
    return nonDuplicateArr;
}
exports.removeDuplicatesObj = removeDuplicatesObj;
//# sourceMappingURL=array.js.map