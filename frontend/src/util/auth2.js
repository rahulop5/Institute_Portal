// mongoose_cheatsheet.js

// -----------------------------
// 1. IMPORT & CONNECT TO MONGODB
// -----------------------------
import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/dbname", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "dbname"
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

// -----------------------------
// 2. SCHEMA & MODEL
// -----------------------------
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: { type: String, unique: true },
  hobbies: [String],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// -----------------------------
// 3. CREATE (INSERT)
// -----------------------------
async function createUsers() {
  // Single document
  await User.create({ name: "Rahul", age: 21, email: "rahul@example.com" });

  // Multiple documents
  await User.insertMany([
    { name: "A", age: 20 },
    { name: "B", age: 22 }
  ]);
}

// -----------------------------
// 4. READ (FIND)
// -----------------------------
async function readUsers() {
  // Find all
  const allUsers = await User.find({});

  // Condition
  const someUsers = await User.find({ age: { $gte: 18 } });

  // Find one
  const user = await User.findOne({ email: "rahul@example.com" });

  // Find by ID
  const byId = await User.findById("64f...id");

  // Select fields
  const selected = await User.find({}, "name age");

  // Sort
  const sorted = await User.find().sort({ age: -1 });

  // Limit & Skip (pagination)
  const paginated = await User.find().limit(5).skip(10);
}

// -----------------------------
// 5. UPDATE
// -----------------------------
async function updateUsers() {
  // Update one
  await User.updateOne(
    { email: "rahul@example.com" },
    { $set: { age: 22 } }
  );

  // Update many
  await User.updateMany(
    { age: { $lt: 18 } },
    { $set: { status: "minor" } }
  );

  // Find & update (returns updated doc)
  const updatedUser = await User.findOneAndUpdate(
    { name: "Rahul" },
    { $set: { age: 23 } },
    { new: true }
  );
}

// -----------------------------
// 6. DELETE
// -----------------------------
async function deleteUsers() {
  // Delete one
  await User.deleteOne({ email: "rahul@example.com" });

  // Delete many
  await User.deleteMany({ age: { $lt: 18 } });

  // Find & delete
  const deleted = await User.findOneAndDelete({ name: "Rahul" });
}

// -----------------------------
// 7. ARRAY UPDATES
// -----------------------------
async function arrayUpdates() {
  // Push single
  await User.updateOne(
    { name: "Rahul" },
    { $push: { hobbies: "coding" } }
  );

  // Push multiple
  await User.updateOne(
    { name: "Rahul" },
    { $push: { hobbies: { $each: ["gaming", "music"] } } }
  );

  // Pull
  await User.updateOne(
    { name: "Rahul" },
    { $pull: { hobbies: "gaming" } }
  );

  // Add to set (no duplicates)
  await User.updateOne(
    { name: "Rahul" },
    { $addToSet: { hobbies: "reading" } }
  );
}

// -----------------------------
// 8. COUNT
// -----------------------------
async function countUsers() {
  const count = await User.countDocuments({ age: { $gte: 18 } });
}

// -----------------------------
// 9. AGGREGATION
// -----------------------------
async function aggregationExample() {
  const result = await User.aggregate([
    { $match: { age: { $gte: 18 } } },
    { $group: { _id: "$age", total: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
}

// -----------------------------
// 10. POPULATE (FOREIGN KEY LOOKUP)
// -----------------------------
const orderSchema = new mongoose.Schema({
  product: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});
const Order = mongoose.model("Order", orderSchema);

async function populateExample() {
  const orders = await Order.find().populate("userId", "name email");
}

// -----------------------------
// 11. INDEXES
// -----------------------------
userSchema.index({ email: 1 }, { unique: true });

// -----------------------------
// 12. TRANSACTIONS
// -----------------------------
async function transactionExample() {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await User.create([{ name: "Test" }], { session });
    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}

// -----------------------------
// CALLING EXAMPLES (Uncomment to run)
// -----------------------------
// createUsers();
// readUsers();
// updateUsers();
// deleteUsers();
// arrayUpdates();
// countUsers();
// aggregationExample();
// populateExample();
// transactionExample();






// redis_cheatsheet.js

// -----------------------------
// 1. IMPORT & CONNECT TO REDIS
// -----------------------------
import { createClient } from "redis";

// Create client
const client = createClient({
  url: "redis://localhost:6379"
});

// Handle events
client.on("error", (err) => console.error("Redis Error:", err));
client.on("connect", () => console.log("Redis Client Connected"));

// Connect
await client.connect();

// -----------------------------
// 2. BASIC STRING COMMANDS
// -----------------------------
async function stringCommands() {
  // SET a value
  await client.set("name", "Rahul");

  // SET with expiry (in seconds)
  await client.setEx("session_token", 60, "abc123");

  // GET a value
  const name = await client.get("name");
  console.log("Name:", name);

  // GET multiple keys
  const values = await client.mGet(["name", "session_token"]);
  console.log(values);

  // DELETE a key
  await client.del("name");

  // Check if a key exists
  const exists = await client.exists("session_token"); // returns count
  console.log("Exists?", exists > 0);
}

// -----------------------------
// 3. LIST COMMANDS
// -----------------------------
async function listCommands() {
  // LPUSH (left push)
  await client.lPush("tasks", "task1");

  // RPUSH (right push)
  await client.rPush("tasks", "task2", "task3");

  // LPOP (remove from left)
  const firstTask = await client.lPop("tasks");
  console.log("First Task:", firstTask);

  // RPOP (remove from right)
  const lastTask = await client.rPop("tasks");
  console.log("Last Task:", lastTask);

  // LRANGE (get range of list)
  const allTasks = await client.lRange("tasks", 0, -1);
  console.log("All Tasks:", allTasks);
}

// -----------------------------
// 4. SET COMMANDS
// -----------------------------
async function setCommands() {
  // SADD (add to set)
  await client.sAdd("tags", "node", "redis", "db");

  // SMEMBERS (get all members)
  const members = await client.sMembers("tags");
  console.log("Tags:", members);

  // SISMEMBER (check if exists)
  const hasTag = await client.sIsMember("tags", "redis");
  console.log("Has 'redis' tag?", hasTag === 1);

  // SREM (remove from set)
  await client.sRem("tags", "db");
}

// -----------------------------
// 5. HASH COMMANDS
// -----------------------------
async function hashCommands() {
  // HSET
  await client.hSet("user:1", { name: "Rahul", age: "21" });

  // HGET
  const name = await client.hGet("user:1", "name");
  console.log("Name:", name);

  // HGETALL
  const user = await client.hGetAll("user:1");
  console.log("User:", user);

  // HDEL
  await client.hDel("user:1", "age");
}

// -----------------------------
// 6. PUB/SUB (Publish/Subscribe)
// -----------------------------
async function pubSubExample() {
  const subscriber = client.duplicate();
  await subscriber.connect();

  await subscriber.subscribe("news", (message) => {
    console.log("Received message:", message);
  });

  // Publisher
  await client.publish("news", "Hello Subscribers!");
}

// -----------------------------
// 7. TRANSACTIONS (MULTI/EXEC)
// -----------------------------
async function transactionExample() {
  const results = await client
    .multi()
    .set("x", "1")
    .incr("x")
    .get("x")
    .exec();

  console.log("Transaction results:", results);
}

// -----------------------------
// 8. JSON STORAGE (Manual Serialization)
// -----------------------------
async function jsonExample() {
  const obj = { name: "Rahul", skills: ["Node.js", "Redis"] };

  // Store JSON as string
  await client.set("user:json", JSON.stringify(obj));

  // Retrieve and parse
  const data = JSON.parse(await client.get("user:json"));
  console.log("Parsed JSON:", data);
}

// -----------------------------
// 9. KEYS & PATTERNS
// -----------------------------
async function keysExample() {
  // Get all keys
  const keys = await client.keys("*");
  console.log("All Keys:", keys);

  // Delete matching keys
  const delCount = await client.del(...keys);
  console.log("Deleted keys:", delCount);
}

// -----------------------------
// CALLING EXAMPLES (Uncomment to run)
// -----------------------------
// await stringCommands();
// await listCommands();
// await setCommands();
// await hashCommands();
// await pubSubExample();
// await transactionExample();
// await jsonExample();
// await keysExample();

// -----------------------------
// DISCONNECT WHEN DONE
// -----------------------------
await client.quit();





//ratelimiting


// ratelimit_cheatsheet.js

import express from "express";
import rateLimit from "express-rate-limit";
import { createClient } from "redis"; // For Redis-based
import RedisStore from "rate-limit-redis"; // npm install rate-limit-redis

const app = express();

// -----------------------------
// 1. SIMPLE IN-MEMORY RATE LIMIT (Custom)
// -----------------------------
const requests = {};
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

function customRateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!requests[ip]) {
    requests[ip] = [];
  }

  // Remove timestamps older than window
  requests[ip] = requests[ip].filter(ts => now - ts < WINDOW_MS);

  if (requests[ip].length >= MAX_REQUESTS) {
    return res.status(429).json({ message: "Too many requests, slow down!" });
  }

  // Add current timestamp
  requests[ip].push(now);
  next();
}

// Example usage
app.get("/custom", customRateLimiter, (req, res) => {
  res.send("Custom rate limit OK");
});

// -----------------------------
// 2. EXPRESS-RATE-LIMIT (Most popular)
// -----------------------------
// npm install express-rate-limit
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: "Too many requests from this IP" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

app.get("/api/test", (req, res) => {
  res.send("express-rate-limit OK");
});

// -----------------------------
// 3. REDIS-BACKED RATE LIMIT (Distributed)
// -----------------------------
const redisClient = createClient({ url: "redis://localhost:6379" });
await redisClient.connect();

const redisLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many requests (Redis-backed)" },
});

app.use("/redis", redisLimiter);

app.get("/redis/test", (req, res) => {
  res.send("Redis-backed rate limit OK");
});

// -----------------------------
// 4. TOKEN BUCKET ALGORITHM (Manual)
// -----------------------------
const buckets = {};
const TOKENS_PER_INTERVAL = 5;
const INTERVAL_MS = 60 * 1000;

function tokenBucketLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!buckets[ip]) {
    buckets[ip] = { tokens: TOKENS_PER_INTERVAL, lastRefill: now };
  }

  const bucket = buckets[ip];
  const elapsed = now - bucket.lastRefill;

  // Refill tokens
  if (elapsed > INTERVAL_MS) {
    bucket.tokens = TOKENS_PER_INTERVAL;
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens--;
    next();
  } else {
    res.status(429).json({ message: "Rate limit exceeded (Token Bucket)" });
  }
}

app.get("/token", tokenBucketLimiter, (req, res) => {
  res.send("Token bucket OK");
});

// -----------------------------
// 5. SLIDING WINDOW COUNTER (Manual)
// -----------------------------
const slidingWindow = {};
const SW_WINDOW_MS = 60 * 1000;
const SW_MAX_REQ = 5;

function slidingWindowLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!slidingWindow[ip]) {
    slidingWindow[ip] = [];
  }

  slidingWindow[ip] = slidingWindow[ip].filter(ts => now - ts < SW_WINDOW_MS);

  if (slidingWindow[ip].length >= SW_MAX_REQ) {
    return res.status(429).json({ message: "Rate limit exceeded (Sliding Window)" });
  }

  slidingWindow[ip].push(now);
  next();
}

app.get("/sliding", slidingWindowLimiter, (req, res) => {
  res.send("Sliding window OK");
});

// -----------------------------
// START SERVER
// -----------------------------
app.listen(3000, () => {
  console.log("Rate limit examples running on http://localhost:3000");
});
