const Database = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "terdujournal.db");
const db = new Database(dbPath);

console.log("=== DATABASE VIEWER ===\n");

console.log("=== TABLES ===");
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table'")
  .all();
console.table(tables);

console.log("\n=== USERS ===");
const users = db
  .prepare("SELECT id, username, email, created_at FROM users")
  .all();
console.table(users);

console.log("\n=== MESSAGES ===");
const messages = db
  .prepare(
    `
  SELECT m.id, u.username, m.message, m.created_at
  FROM messages m
  JOIN users u ON u.id = m.user_id
  ORDER BY m.created_at DESC
`,
  )
  .all();
console.table(messages);

console.log("\n=== STATS ===");
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
const messageCount = db.prepare("SELECT COUNT(*) as count FROM messages").get();
console.log(`Total Users: ${userCount.count}`);
console.log(`Total Messages: ${messageCount.count}`);

db.close();
console.log("\nDatabase connection closed.");
