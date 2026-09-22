const mongoose = require('mongoose');
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('ℹ️  No MONGO_URI provided in .env. Running with in-memory test store.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️ Falling back to in-memory test store.');
    return false;
  }
};

module.exports = { connectDB };
