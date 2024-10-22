import { JSONFilePreset } from "lowdb/node";
import { MongoDbUtils } from "./db-utils.mongo.js";
import { LowDBUtils } from "./db-utils.lowdb.js";
import { DropboxAdapter } from "./db-utils.dropbox.js";
import { Low } from "lowdb";

// Create a database utility based on the type (this is a factory function)
// Supported types: "mongo", "lowdb", "dropbox"
// Default type: "lowdb"
export async function createDBUtils(type) {
  type = ["mongo", "lowdb", "dropbox"].includes(type) ? type : "lowdb";
  if (type === "mongo") {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is required");
    }
    const dbUtils = new MongoDbUtils(mongoUri);
    await dbUtils.connect();
    return dbUtils;
  } else if (type === "lowdb") {
    const dbFile = process.env.LOWDB_FILE || "db.json";
    const db = await JSONFilePreset(dbFile, {
      users: [],
    });

    // Read the file if it exists, else default to the initial data
    await db.read();
    // If the file doesn't exist, create it with the initial data
    await db.write();
    const dbUtils = new LowDBUtils(db);
    return dbUtils;
  } else if (type === "dropbox") {
    const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
    const filePath = process.env.DROPBOX_FILE_PATH || "/db.json";
    if (!accessToken) {
      throw new Error("DROPBOX_ACCESS_TOKEN environment variable is required");
    }
    const adapter = new DropboxAdapter(accessToken, filePath);
    const db = new Low(adapter, {
      users: [],
    });
    try {
      await db.read();
      console.log(`Using an existing file at ${filePath} in Dropbox`);
    } catch (error) {
      // If the file doesn't exist, create it
      await db.write();
      console.log(`Created a new file at ${filePath} in Dropbox`);
    }
    const dbUtils = new LowDBUtils(db);
    return dbUtils;
  }
}
