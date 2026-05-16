const mongoose = require("mongoose");

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
async function connectToMongoDB() {
  if (!process.env.MONGODB_URI) {
    console.error(
      "❌ MONGODB_URI not found in environment. Check your .env file is UTF-8 encoded (not UTF-16).",
    );
    if (process.env.NODE_ENV === "production") process.exit(1);
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 s timeout
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error(
      "   Tip: Make sure your .env file is saved as UTF-8 (not UTF-16/Unicode).",
      "\n   In VS Code: bottom-right corner → click 'UTF-16 LE' → 'Save with Encoding' → UTF-8",
    );
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
async function disconnectFromMongoDB() {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB Disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error.message);
  }
}

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB,
};
