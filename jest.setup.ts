// test/jest.setup.ts (DB connection and cleanup)
import dbConnect from '../lib/db';
import mongoose from 'mongoose';

// Connect to the testing database once before all tests
beforeAll(async () => {
    // Assuming MONGODB_URI is set for testing purposes
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

// --- simulateHandler utility (Used across all test files) ---
// Note: You must place this utility in a globally accessible file or import it in each test file.
/** Helper to simulate Next.js route handler input and parse JSON output */
const simulateHandler = async (handler: Function, method: string, url: string, body?: any, token?: string) => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const mockRequest = {
        method: method,
        url: url,
        json: async () => body,
        headers: headers,
    } as unknown as NextRequest;

    const response: NextResponse = await handler(mockRequest);

    return {
        status: response.status,
        body: response.status !== 204 ? await response.json() : {},
        headers: response.headers,
    };
};