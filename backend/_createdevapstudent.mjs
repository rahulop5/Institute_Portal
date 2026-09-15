// One-off: creates a dev-only Student account dedicated to AP testing.
// AP has no mutual-exclusion with BTP/Honors, but a separate account keeps
// manual testing unambiguous (matches the dev.honorsstudent pattern).
// Run from backend/ with:  node _createdevapstudent.mjs
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import Student from "./models/feedback/Student.js";
import User from "./models/User.js";
dotenv.config();

const EMAIL = "dev.apstudent@iiits.in";
const NAME = "Dev AP Student";
const ROLL_NUMBER = "DEVSTU003";
const DEPARTMENT = "CSE";
const BATCH = "2025";
const RESET = process.argv.includes("--reset");

const password = crypto.randomBytes(9).toString("base64url");
const uri = (process.env.MONGO_URI || "").trim().replace(/^"|"$/g, "");
await mongoose.connect(uri, { dbName: "clgproject" });

const existingUser = await User.findOne({ email: EMAIL });

if (existingUser && !RESET) {
  console.log(`\n${EMAIL} already exists. Re-run with --reset for a new password.`);
  await mongoose.disconnect();
  process.exit(0);
}
if (existingUser && RESET) {
  existingUser.password = await bcrypt.hash(password, 10);
  await existingUser.save();
  console.log(`\nPassword reset for ${EMAIL}\n\n    email:     ${EMAIL}\n    password:  ${password}\n`);
  await mongoose.disconnect();
  process.exit(0);
}

const session = await mongoose.startSession();
try {
  await session.withTransaction(async () => {
    const [student] = await Student.create(
      [{ name: NAME, email: EMAIL, rollNumber: ROLL_NUMBER, department: DEPARTMENT, batch: BATCH }],
      { session }
    );
    await User.create(
      [{ name: NAME, email: EMAIL, password: await bcrypt.hash(password, 10), role: "Student", referenceId: student._id, lastlogin: new Date() }],
      { session }
    );
  });
  console.log(`\nCreated dev AP Student\n\n    email:     ${EMAIL}\n    password:  ${password}\n`);
} catch (err) {
  console.error("\nFailed, nothing was written:", err.message);
  process.exitCode = 1;
} finally {
  await session.endSession();
  await mongoose.disconnect();
}
