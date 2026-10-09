// One-off: creates a dev-only Academic Office account for testing course grades release
// Run:  node _createdevacademicoffice.mjs   (add --reset to set a fresh password on an existing one)
// Delete this file once you're done testing - it is not part of the app.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import AcademicOffice from "./models/AcademicOffice.js";
import User from "./models/User.js";
dotenv.config();

const EMAIL = "dev.academicoffice@iiits.in";
const NAME = "Dev Academic Office";
const RESET = process.argv.includes("--reset");
const password = crypto.randomBytes(9).toString("base64url");

await mongoose.connect((process.env.MONGO_URI || "").trim().replace(/^"|"$/g, ""), { dbName: "clgproject" });
try {
  const existing = await User.findOne({ email: EMAIL });
  if (existing && !RESET) {
    console.log(`${EMAIL} already exists (role: ${existing.role}). Re-run with --reset for a new password.`);
  } else if (existing) {
    existing.password = await bcrypt.hash(password, 10);
    await existing.save();
    console.log(`Password reset.  email: ${EMAIL}  password: ${password}`);
  } else {
    const doc = await AcademicOffice.create({ name: NAME, email: EMAIL });
    await User.create({ name: NAME, email: EMAIL, password: await bcrypt.hash(password, 10), role: "AcademicOffice", referenceId: doc._id, lastlogin: new Date() });
    console.log(`Created.  email: ${EMAIL}  password: ${password}`);
  }
} catch (err) {
  console.error("Failed:", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
