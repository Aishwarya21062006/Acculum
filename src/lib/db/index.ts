import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { setupSchema } from './schema';
import { runSeed } from './seed';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'acculum.db');
const isDev = process.env.NODE_ENV !== 'production';

// Initialize singleton database connection
let db: Database.Database;

try {
  db = new Database(dbPath, {
    verbose: isDev ? console.log : undefined,
    fileMustExist: false,
  });
  
  // Performance tuning
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  
  // Setup tables and seed if necessary
  const isNewDB = !db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='students'").get();
  
  if (isNewDB) {
    console.log("Setting up new database schema...");
    setupSchema(db);
    console.log("Running seed data...");
    runSeed(db);
    console.log("Database initialized successfully!");
  }

} catch (err) {
  console.error("Failed to initialize database:", err);
  throw err;
}

export default db;
