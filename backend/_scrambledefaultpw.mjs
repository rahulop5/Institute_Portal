// One-off security fix: lock every account that still uses the old shared default password.
// Each such account gets a random password nobody knows and all its sessions are logged out;
// the owner gets back in with "Forgot password" (an OTP to their own email).
//
//   Count only:   MONGO_DB_NAME=clgproject_test node _scrambledefaultpw.mjs --dry-run
//   Apply (test): MONGO_DB_NAME=clgproject_test node _scrambledefaultpw.mjs
//   Apply (prod): MONGO_DB_NAME=clgproject node _scrambledefaultpw.mjs --confirm-production
//
// Writes the affected emails to scrambled-accounts-<db>.txt (gitignored) so they can be told.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const OLD_DEFAULT = "yoyoyo";
const DB = process.env.MONGO_DB_NAME;
const dryRun = process.argv.includes("--dry-run");
if (!DB) { console.error("Set MONGO_DB_NAME (e.g. clgproject_test)."); process.exit(1); }
if (DB === "clgproject" && !dryRun && !process.argv.includes("--confirm-production")) {
    console.error("This is the PRODUCTION database. Re-run with --confirm-production to apply (or --dry-run to count).");
    process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI.trim().replace(/^"|"$/g, ""), {dbName: DB});
const users = mongoose.connection.db.collection("users");
try {
    const all = await users.find({}, {projection: {email: 1, role: 1, password: 1}}).toArray();
    const hits = [];
    // check in parallel batches (bcrypt is slow on purpose)
    for (let i = 0; i < all.length; i += 25) {
        const batch = all.slice(i, i + 25);
        const res = await Promise.all(batch.map((u) => (typeof u.password === "string" ? bcrypt.compare(OLD_DEFAULT, u.password) : false)));
        batch.forEach((u, k) => res[k] && hits.push(u));
    }
    const byRole = {};
    for (const u of hits) byRole[u.role] = (byRole[u.role] || 0) + 1;
    console.log(`${DB}: ${all.length} accounts, ${hits.length} still use the old default password`, byRole);
    if (dryRun || !hits.length) {
        if (dryRun) console.log("Dry run: nothing changed.");
    } else {
        const now = new Date();
        let done = 0;
        for (let i = 0; i < hits.length; i += 25) {
            const batch = hits.slice(i, i + 25);
            await Promise.all(batch.map(async (u) => {
                const hash = await bcrypt.hash(crypto.randomBytes(24).toString("base64url"), 10);
                // only if it is still the default (someone may have just changed it)
                const r = await users.updateOne({_id: u._id, password: u.password}, {$set: {password: hash, passwordChangedAt: now}});
                done += r.modifiedCount;
            }));
        }
        const file = `scrambled-accounts-${DB}.txt`;
        fs.writeFileSync(file, `Accounts locked ${now.toISOString()} (old default password). They sign in again via "Forgot password".\n` + hits.map((u) => `${u.role}\t${u.email}`).join("\n") + "\n");
        console.log(`Locked ${done} account(s). List written to ${file}`);
    }
} finally {
    await mongoose.disconnect();
}
