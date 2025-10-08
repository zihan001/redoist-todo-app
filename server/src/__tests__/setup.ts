import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, beforeEach, afterAll, afterEach } from 'vitest';

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.MONGO_URI = process.env.MONGO_URI ?? '';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri('redoist_test');
  process.env.MONGO_URI = uri; // must be set before index connects
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // clean DB between tests
  const { collections } = mongoose.connection;
  for (const c of Object.values(collections)) {
    await c.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});