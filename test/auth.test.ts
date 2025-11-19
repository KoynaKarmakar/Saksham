// test/auth.test.ts

import { NextRequest, NextResponse } from 'next/server';
import User from '../lib/models/User';
import { generateToken } from '../lib/utils/auth';
// Import Handlers
import { POST as signupHandler } from '../app/api/auth/signup/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { GET as getMeHandler, PUT as updateProfileHandler } from '../app/api/users/me/route';

// FIX: Import the utility function from the setup file
import { simulateHandler } from '../jest.setup';

describe('Auth & User API Endpoints (Profile & Settings)', () => {
    const testUser = {
        name: 'Test User',
        email: 'test-auth@example.com',
        password: 'password123',
    };
    let authToken: string;

    beforeAll(async () => {
        // simulateHandler is now correctly imported
        const res = await simulateHandler(signupHandler, 'POST', '/api/auth/signup', testUser);
        authToken = res.body.token;
    });

    // ... rest of the test file
});