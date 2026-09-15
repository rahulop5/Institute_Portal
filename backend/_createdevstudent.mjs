// One-off: creates a dev-only Student account, for browser-testing the BTP/
// Honors/AP student dashboards without touching real student logins.
// Run from backend/ with:  node _createdevstudent.mjs
// Re-run with --reset to set a fresh password on an existing dev student.
// Delete this file once you're done testing — it is not part of the app.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import Student from "./models/feedback/Student.js";
import User from "./models/User.js";
dotenv.config();

const EMAIL = "dev.student@iiits.in";
const NAME = "Dev Student";
const ROLL_NUMBER = "DEVSTU001";
const DEPARTMENT = "CSE";
const BATCH = "2025";
const RESET = process.argv.includes("--reset");

const password = crypto.randomBytes(9).toString("base64url");

const uri = (process.env.MONGO_URI || "").trim().replace(/^"|"$/g, "");
await mongoose.connect(uri, { dbName: "clgproject" });

const existingUser = await User.findOne({ email: EMAIL });

if (existingUser && !RESET) {
  console.log(`\n${EMAIL} already exists (role: ${existingUser.role}).`);
  console.log("Re-run with --reset to set a new password:  node _createdevstudent.mjs --reset");
  await mongoose.disconnect();
  process.exit(0);
}

if (existingUser && RESET) {
  existingUser.password = await bcrypt.hash(password, 10);
  await existingUser.save();
  console.log(`\nPassword reset for ${EMAIL}`);
  console.log(`\n    email:     ${EMAIL}`);
  console.log(`    password:  ${password}\n`);
  console.log("Save it now — it is not recoverable.");
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
      [
        {
          name: NAME,
          email: EMAIL,
          password: await bcrypt.hash(password, 10),
          role: "Student",
          referenceId: student._id,
          lastlogin: new Date(),
        },
      ],
      { session }
    );
  });

  console.log(`\nCreated dev Student — dept: ${DEPARTMENT}, batch: ${BATCH}`);
  console.log(`\n    email:     ${EMAIL}`);
  console.log(`    password:  ${password}\n`);
  console.log("Save it now — it is not recoverable.");
} catch (err) {
  console.error("\nFailed, nothing was written:", err.message);
  process.exitCode = 1;
} finally {
  await session.endSession();
  await mongoose.disconnect();
}
