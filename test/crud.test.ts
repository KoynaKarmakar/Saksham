// test/crud.test.ts

import { NextRequest, NextResponse } from 'next/server';
import { GET as getClientsHandler, POST as createClientHandler } from '../app/api/clients/route';
import { GET as getTasksHandler, POST as createTaskHandler } from '../app/api/tasks/route';
import User from '../lib/models/User';
import Client from '../lib/models/Client';
import Task from '../lib/models/Task';
import { generateToken } from '../lib/utils/auth';

// --- Test Utilities (Simulate Handler) ---

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
        body: await response.json(),
        headers: response.headers,
    };
};

describe('Client and Task CRUD Endpoints', () => {
    let user1: any;
    let user2: any;
    let token1: string;
    let token2: string;

    beforeAll(async () => {
        // Setup two test users for isolation testing
        user1 = await User.create({ name: 'User One', email: 'user1@test.com', password: 'password1' });
        user2 = await User.create({ name: 'User Two', email: 'user2@test.com', password: 'password2' });
        token1 = generateToken(user1._id.toString());
        token2 = generateToken(user2._id.toString());
    });

    afterAll(async () => {
        // Clean up users
        await User.deleteMany({ email: { $in: ['user1@test.com', 'user2@test.com'] } });
    });

    // --- 1. Clients Module (/api/clients) ---
    describe('Clients Module', () => {
        const clientData = {
            name: 'Acme Corp',
            contactName: 'Wile E.',
            contactEmail: 'wile@acme.com',
            contactPhone: '111-222-3333',
        };

        it('should allow authenticated user to create a client (201)', async () => {
            const res = await simulateHandler(createClientHandler, 'POST', '/api/clients', clientData, token1);
            expect(res.status).toBe(201);
            expect(res.body.client.name).toBe(clientData.name);
            expect(res.body.client.user.toString()).toBe(user1._id.toString());
        });

        it('should fail client creation if required fields are missing (400)', async () => {
            const res = await simulateHandler(createClientHandler, 'POST', '/api/clients', { name: 'Incomplete' }, token1);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Missing required client fields');
        });

        it('should return only user1\'s clients (GET /api/clients)', async () => {
            // User 2 creates a client
            await Client.create({ ...clientData, name: 'Globex', user: user2._id });

            // User 1 fetches clients
            const res = await simulateHandler(getClientsHandler, 'GET', '/api/clients', null, token1);
            expect(res.status).toBe(200);
            expect(res.body.clients.length).toBe(1);
            expect(res.body.clients[0].name).toBe(clientData.name);
        });

        it('should fail client creation if unauthorized (401)', async () => {
            const res = await simulateHandler(createClientHandler, 'POST', '/api/clients', clientData, 'invalid');
            expect(res.status).toBe(401);
        });
    });

    // --- 2. Tasks Module (/api/tasks) ---
    describe('Tasks Module', () => {
        const taskData = {
            text: 'Finish design review',
            priority: 'High',
        };

        it('should allow authenticated user to create a task (201)', async () => {
            const res = await simulateHandler(createTaskHandler, 'POST', '/api/tasks', taskData, token1);
            expect(res.status).toBe(201);
            expect(res.body.task.text).toBe(taskData.text);
            expect(res.body.task.user.toString()).toBe(user1._id.toString());
        });

        it('should fail task creation if text is missing (400)', async () => {
            const res = await simulateHandler(createTaskHandler, 'POST', '/api/tasks', { priority: 'Low' }, token1);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Task text is required');
        });

        it('should return only user2\'s tasks (GET /api/tasks)', async () => {
            // User 2 creates a task
            await Task.create({ text: 'Call client', user: user2._id });

            // User 1 fetches tasks (should only have the one they created)
            const res = await simulateHandler(getTasksHandler, 'GET', '/api/tasks', null, token1);
            expect(res.status).toBe(200);
            expect(res.body.tasks.length).toBe(1);
            expect(res.body.tasks[0].text).toBe(taskData.text);

            // User 2 fetches tasks (should have only the one they created)
            const res2 = await simulateHandler(getTasksHandler, 'GET', '/api/tasks', null, token2);
            expect(res2.status).toBe(200);
            expect(res2.body.tasks.length).toBe(1);
            expect(res2.body.tasks[0].text).toBe('Call client');
        });

        it('should fail task creation if unauthorized (401)', async () => {
            const res = await simulateHandler(createTaskHandler, 'POST', '/api/tasks', taskData, 'invalid');
            expect(res.status).toBe(401);
        });
    });
});