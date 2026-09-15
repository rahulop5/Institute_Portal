// One-off: creates a dev-only Admin account.
// Run from backend/ with:  node _createdevadmin.mjs
// Re-run with --reset to set a fresh password on an existing dev admin.
// Delete this file once you're logged in — it is not part of the app.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";
import User from "./models/User.js";
dotenv.config();

const EMAIL = "dev.admin@iiits.in";
const NAME = "Dev Admin";
const DEPARTMENTS = ["CSE", "ECE", "MDS"]; // all three, so the dashboard isn't dept-scoped
const RESET = process.argv.includes("--reset");

const password = crypto.randomBytes(9).toString("base64url"); // ~12 chars

const uri = (process.env.MONGO_URI || "").trim().replace(/^"|"$/g, "");
await mongoose.connect(uri, { dbName: "clgproject" });

const existingUser = await User.findOne({ email: EMAIL });

if (existingUser && !RESET) {
  console.log(`\n${EMAIL} already exists (role: ${existingUser.role}).`);
  console.log("Re-run with --reset to set a new password:  node _createdevadmin.mjs --reset");
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

// Fresh create: Admin doc + User row must land together, or not at all.
const session = await mongoose.startSession();
try {
  await session.withTransaction(async () => {
    const [admin] = await Admin.create(
      [{ name: NAME, email: EMAIL, departments: DEPARTMENTS, isStaff: false }],
      { session }
    );
    await User.create(
      [
        {
          name: NAME,
          email: EMAIL,
          password: await bcrypt.hash(password, 10),
          role: "Admin",
          referenceId: admin._id,
          lastlogin: new Date(),
        },
      ],
      { session }
    );
  });

  console.log(`\nCreated dev Admin — departments: ${DEPARTMENTS.join(", ")}`);
  console.log(`\n    email:     ${EMAIL}`);
  console.log(`    password:  ${password}\n`);
  console.log("Save it now — it is not recoverable. Change it via Settings once you're in.");
} catch (err) {
  console.error("\nFailed, nothing was written:", err.message);
  process.exitCode = 1;
} finally {
  await session.endSession();
  await mongoose.disconnect();
}
