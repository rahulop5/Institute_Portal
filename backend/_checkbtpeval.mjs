import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const uri = (process.env.MONGO_URI || "").trim().replace(/^"|"$/g, "");
await mongoose.connect(uri, { dbName: "clgproject" });
const db = mongoose.connection.db;

const projects = await db.collection("btps").find({}).toArray();
for (const p of projects) {
  console.log("\nProject:", p.name, p._id.toString(), "status:", p.status, "evaluators:", p.evaluators?.length);
  const evals = await db.collection("btpevaluations").find({ projectRef: p._id }).sort({ time: 1 }).toArray();
  evals.forEach((e, i) => {
    console.log(`  Round ${i+1} (${e._id}): canstudentsee=${e.canstudentsee}`);
    console.log("    marksgiven:", JSON.stringify(e.marksgiven));
    console.log("    panelEvaluations:", JSON.stringify(e.panelEvaluations));
  });
}

await mongoose.disconnect();
