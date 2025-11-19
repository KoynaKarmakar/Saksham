// test/auth.test.ts

import request from 'supertest';
import { NextRequest, NextResponse } from 'next/server';
import { POST as signupHandler } from '../app/api/auth/signup/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { GET as getMeHandler, PUT as updateProfileHandler } from '../app/api/users/me/route';
import User from '../lib/models/User';
import { generateToken } from '../lib/utils/auth';

// --- Test Utilities ---

/** Helper to simulate Next.js route handler input and parse JSON output */
const simulateHandler = async (handler: Function, method: string, url: string, body?: any, token?: string) => {
    // Mock NextRequest and headers
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

    // Simulate Supertest-like response
    return {
        status: response.status,
        body: await response.json(),
        headers: response.headers,
    };
};

describe('Auth & User API Endpoints', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        tagline: 'Gig worker for testing.',
    };
    let authToken: string;

    // --- 1. POST /api/auth/signup ---
    describe('POST /api/auth/signup', () => {
        it('should register a new user and return a token (201)', async () => {
            const res = await simulateHandler(signupHandler, 'POST', '/api/auth/signup', testUser);
            expect(res.status).toBe(201);
            expect(res.body.user).toHaveProperty('_id');
            expect(res.body.user.email).toBe(testUser.email);
            expect(res.body).toHaveProperty('token');
        });

        it('should fail if required fields are missing (400)', async () => {
            const res = await simulateHandler(signupHandler, 'POST', '/api/auth/signup', { name: 'Incomplete' });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Please enter all required fields');
        });

        it('should fail if email already exists (409)', async () => {
            // Re-use the existing testUser data
            const res = await simulateHandler(signupHandler, 'POST', '/api/auth/signup', testUser);
            expect(res.status).toBe(409);
            expect(res.body.message).toContain('User with this email already exists');
        });
    });

    // --- 2. POST /api/auth/login ---
    describe('POST /api/auth/login', () => {
        it('should successfully log in a user and return a token (200)', async () => {
            const res = await simulateHandler(loginHandler, 'POST', '/api/auth/login', {
                email: testUser.email,
                password: testUser.password,
            });
            expect(res.status).toBe(200);
            expect(res.body.user.email).toBe(testUser.email);
            expect(res.body).toHaveProperty('token');
            authToken = res.body.token; // Save token for protected routes
        });

        it('should fail with incorrect password (401)', async () => {
            const res = await simulateHandler(loginHandler, 'POST', '/api/auth/login', {
                email: testUser.email,
                password: 'wrongpassword',
            });
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should fail with non-existent email (401)', async () => {
            const res = await simulateHandler(loginHandler, 'POST', '/api/auth/login', {
                email: 'nonexistent@example.com',
                password: testUser.password,
            });
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        });
    });

    // --- 3. GET /api/users/me ---
    describe('GET /api/users/me', () => {
        it('should fetch the authenticated user profile (200)', async () => {
            const res = await simulateHandler(getMeHandler, 'GET', '/api/users/me', null, authToken);
            expect(res.status).toBe(200);
            expect(res.body.user.email).toBe(testUser.email);
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('should fail if not authorized (401)', async () => {
            const res = await simulateHandler(getMeHandler, 'GET', '/api/users/me', null, 'invalidtoken');
            expect(res.status).toBe(401);
            expect(res.body.message).toContain('Not authorized');
        });
    });

    // --- 4. PUT /api/users/me ---
    describe('PUT /api/users/me', () => {
        const updateData = {
            tagline: 'Updated tagline for testing.',
            portfolio: { title: 'New Portfolio', url: 'http://new.com' },
        };

        it('should update user profile data (200)', async () => {
            const res = await simulateHandler(updateProfileHandler, 'PUT', '/api/users/me', updateData, authToken);
            expect(res.status).toBe(200);
            expect(res.body.user.tagline).toBe(updateData.tagline);
            expect(res.body.user.portfolio.title).toBe(updateData.portfolio.title);
        });

        it('should return 400 if no valid fields are provided', async () => {
            const res = await simulateHandler(updateProfileHandler, 'PUT', '/api/users/me', { invalidField: 'test' }, authToken);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('No valid fields provided');
        });

        it('should fail if not authorized (401)', async () => {
            const res = await simulateHandler(updateProfileHandler, 'PUT', '/api/users/me', updateData, 'invalidtoken');
            expect(res.status).toBe(401);
        });
    });
});