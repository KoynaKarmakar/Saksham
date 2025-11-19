// test/jest.setup.ts

import dbConnect from '../lib/db';
import mongoose from 'mongoose';

// Connect to the testing database once before all tests
beforeAll(async () => {
    // Ensure that your test environment has MONGODB_URI set to a test database
    if (process.env.NODE_ENV !== 'test' || !process.env.MONGODB_URI) {
        console.error("Warning: MONGODB_URI or NODE_ENV=test not set for testing.");
        // Fallback to a mock connection for presentation purposes if real connection isn't available
        // For a real setup, you should throw an error or use a memory database (e.g., mongodb-memory-server).
        // For this demonstration, we connect, assuming a separate test DB is linked.
    }
    await dbConnect();
});

// Clear the database after each test to ensure isolation
afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = Object.keys(mongoose.connection.collections);
        for (const collectionName of collections) {
            const collection = mongoose.connection.collections[collectionName];
            await collection.deleteMany({});
        }
    }
});

// Disconnect after all tests are done
afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
});