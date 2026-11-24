import mongoose from "mongoose";

// Global guard against "array widening". Mongoose quietly turns {field: [a, b]} into
// {field: {$in: [a, b]}} when `field` is not an array. A request that sends an id as a list,
// e.g. {"projid": [myProjectId, someoneElsesProjectId]}, then passes an ownership check that
// loads one document and widens the write that follows to other people's records.
// Code that wants "any of" always writes $in explicitly, so a raw array against a non-array
// field is never intended: such a query is refused before it runs.
//
// Must be imported before any model is compiled (first import in index.js).

const OPS = ["countDocuments", "deleteMany", "deleteOne", "distinct", "find", "findOne", "findOneAndDelete",
    "findOneAndReplace", "findOneAndUpdate", "replaceOne", "updateMany", "updateOne"];

function isArrayPath(schema, key) {
    const p = schema.path(key);
    if (p) return !!(p.$isMongooseArray || p.$isMongooseDocumentArray || p.instance === "Array");
    // "a.b" inside an array of subdocuments: the element field itself is not an array
    return false;
}

export function rawArrayKey(schema, filter, depth = 0) {
    if (!filter || typeof filter !== "object" || depth > 6) return null;
    for (const [k, v] of Object.entries(filter)) {
        if (k === "$and" || k === "$or" || k === "$nor") {
            if (Array.isArray(v)) for (const f of v) { const bad = rawArrayKey(schema, f, depth + 1); if (bad) return bad; }
            continue;
        }
        if (k.startsWith("$")) continue;
        if (Array.isArray(v) && !isArrayPath(schema, k)) return k;
    }
    return null;
}

export class UnsafeQueryError extends Error {
    constructor(key) {
        super(`Refused query: a list was given for "${key}"`);
        this.status = 400;
    }
}

mongoose.plugin((schema) => {
    schema.pre(OPS, function () {
        const bad = rawArrayKey(this.model.schema, this.getFilter());
        if (bad) {
            console.warn(`[queryGuard] ${this.model.modelName}.${this.op}: list given for "${bad}"`);
            throw new UnsafeQueryError(bad);
        }
    });
});
