// One-off: creates a dev-only Faculty account, for browser-testing the BTP/
// Honors/AP faculty dashboards without touching real faculty logins.
// Run from backend/ with:  node _createdevfaculty.mjs
// Re-run with --reset to set a fresh password on an existing dev faculty.
// Delete this file once you're done testing — it is not part of the app.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import Faculty from "./models/Faculty.js";
import User from "./models/User.js";
dotenv.config();

const EMAIL = "dev.faculty@iiits.in";
const NAME = "Dev Faculty";
const EMP_NO = "DEVFAC001";
const DEPT = "CSE";
const RESET = process.argv.includes("--reset");

const password = crypto.randomBytes(9).toString("base64url");

const uri = (process.env.MONGO_URI || "").trim().replace(/^"|"$/g, "");
await mongoose.connect(uri, { dbName: "clgproject" });

const existingUser = await User.findOne({ email: EMAIL });

if (existingUser && !RESET) {
  console.log(`\n${EMAIL} already exists (role: ${existingUser.role}).`);
  console.log("Re-run with --reset to set a new password:  node _createdevfaculty.mjs --reset");
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
    const [fac] = await Faculty.create(
      [{ name: NAME, email: EMAIL, emp_no: EMP_NO, dept: DEPT, role: "faculty" }],
      { session }
    );
    await User.create(
      [
        {
          name: NAME,
          email: EMAIL,
          password: await bcrypt.hash(password, 10),
          role: "Faculty",
          referenceId: fac._id,
          lastlogin: new Date(),
        },
      ],
      { session }
    );
  });

  console.log(`\nCreated dev Faculty — dept: ${DEPT}`);
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
