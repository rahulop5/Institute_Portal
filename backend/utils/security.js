import mongoose from "mongoose";

// Request-shape guards shared by every route. Clients only ever send plain values; a key that
// starts with "$" or contains "." is a MongoDB operator / dotted path smuggled into a filter or
// update ({"email": {"$ne": null}} logs in as someone, {"projid": {"$gte": id}} widens a write
// to other people's records). Rejecting them here closes that whole class before any handler runs.
const MAX_DEPTH = 12;
function badKey(value, depth = 0) {
    if (depth > MAX_DEPTH) return "(nested too deeply)";
    if (Array.isArray(value)) {
        for (const v of value) {
            const k = badKey(v, depth + 1);
            if (k) return k;
        }
        return null;
    }
    if (value && typeof value === "object" && !(value instanceof Date)) {
        for (const key of Object.keys(value)) {
            if (key.startsWith("$") || key.includes(".") || key === "__proto__" || key === "constructor" || key === "prototype") return key;
            const k = badKey(value[key], depth + 1);
            if (k) return k;
        }
    }
    return null;
}

export function rejectOperators(req, res, next) {
    // req.params is filled per-route, so it is checked again by the handlers that use it (oid()).
    const key = badKey(req.body) || badKey(req.query);
    if (key) return res.status(400).json({message: "Invalid request"});
    next();
}

// A plain string from the request, or null. Use for every value that goes into a query.
export const str = (v) => (typeof v === "string" ? v : null);

// A valid ObjectId string from the request, or null.
export const oid = (v) => (typeof v === "string" && mongoose.isValidObjectId(v) && /^[0-9a-fA-F]{24}$/.test(v) ? v : null);

export const normEmail = (v) => (typeof v === "string" ? v.trim().toLowerCase() : null);

// Last-resort error handler: never leak messages or stack traces to the client.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
    const status = err.name === "MulterError" ? 400 : err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    if (res.headersSent) return;
    res.status(status >= 400 && status < 600 ? status : 500).json({message: status < 500 ? "Invalid request" : "Something went wrong. Please try again."});
}

// A trimmed string from the request cut to `max` characters, or undefined.
export const clip = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

// Problem with a list of per-student marks, or null. Each student at most once.
export function markListProblem(list) {
    if (!Array.isArray(list) || list.length === 0) return "Enter marks for at least one student";
    if (list.length > 50) return "Too many entries";
    const seen = new Set();
    for (const m of list) {
        if (!m || typeof m !== "object" || typeof m.studentId !== "string") return "Each entry needs a student";
        if (seen.has(m.studentId)) return "A student appears twice";
        seen.add(m.studentId);
    }
    return null;
}
