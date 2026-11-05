import mongoose from 'mongoose';

let dbStatus = 'disconnected';

export async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing in .env file');
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'studiospace',
      serverSelectionTimeoutMS: 10000,
    });
    dbStatus = 'connected';
    console.log('MongoDB connected successfully!');
  } catch (error) {
    dbStatus = 'error';
    const hint = /ip|network|allowlist|whitelist|not authorized|ETIMEOUT|ECONNREFUSED|DNS/i.test(
      error.message
    )
      ? ' Check MongoDB Atlas Network Access (IP allowlist), credentials and cluster reachability.'
      : '';
    throw new Error(`MongoDB connection failed: ${error.message}.${hint}`);
  }
}

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  if (dbStatus === 'connected') dbStatus = 'disconnected';
});

export function dbState() {
  const readyState = mongoose.connection.readyState;
  if (readyState === 1) return 'connected';
  if (readyState === 2) return 'connecting';
  if (readyState === 3) return 'disconnecting';
  if (dbStatus === 'error') return 'error';
  return 'disconnected';
}
