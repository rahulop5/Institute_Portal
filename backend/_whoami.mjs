// Temp diagnostic: read-only. Checks which accounts the default seed
// password "yoyoyo" actually opens, and picks a sample login for you.
// Run from backend/ with:  node _whoami.mjs
// Delete this file when you're done — it is not part of the app.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const DEFAULT_PW = "yoyoyo";

const uri = (process.env.MONGO_URI || "").trim().replace(/^"|"$/g, "");
await mongoose.connect(uri, { dbName: "clgproject" });
const col = mongoose.connection.db.collection("users");

// One sample per role, plus every Admin.
const samples = [
  ...(await col.find({ role: "Faculty" }).limit(3).toArray()),
  ...(await col.find({ role: "Student" }).limit(3).toArray()),
  ...(await col.find({ role: "Admin" }).toArray()),
];

const rows = [];
for (const u of samples) {
  rows.push({
    email: u.email,
    role: u.role,
    'yoyoyo works?': (await bcrypt.compare(DEFAULT_PW, u.password)) ? "YES" : "no",
  });
}

console.log(`\n--- does "${DEFAULT_PW}" open these accounts? ---`);
console.table(rows);

const win = rows.find((r) => r['yoyoyo works?'] === "YES");
console.log(
  win
    ? `\nLog in with:  ${win.email}  /  ${DEFAULT_PW}   (role: ${win.role})`
    : `\nNo account matched "${DEFAULT_PW}". Passwords have been changed since import.`
);

await mongoose.disconnect();
