// test/client.test.ts

import { NextRequest, NextResponse } from 'next/server';
import User from '../lib/models/User';
import { generateToken } from '../lib/utils/auth';
// Import Handlers
import { POST as createClientHandler, GET as getClientsListHandler } from '../app/api/clients/route';
import { GET as getClientHandler, PUT as updateClientHandler, DELETE as deleteClientHandler } from '../app/api/clients/[id]/route';

// Mock simulateHandler is assumed to be available

describe('Client CRUD Endpoints', () => {
    let user1: any;
    let token1: string;
    let client1Id: string;

    beforeAll(async () => {
        user1 = await User.create({ name: 'Client User 1', email: 'client1@test.com', password: 'password' });
        token1 = generateToken(user1._id.toString());
    });

    // --- 1. POST /api/clients (Create) ---
    it('should successfully create a client (201)', async () => {
        const clientData = {
            name: 'Acme Corp',
            contactName: 'Wile E.',
            contactEmail: 'wile@acme.com',
            contactPhone: '111-222-3333',
            status: 'Active',
        };
        const res = await simulateHandler(createClientHandler, 'POST', '/api/clients', clientData, token1);
        expect(res.status).toBe(201);
        expect(res.body.client.name).toBe('Acme Corp');
        expect(res.body.client.user.toString()).toBe(user1._id.toString());
        client1Id = res.body.client._id;
    });

    // --- 2. GET /api/clients/:id (Read Single) ---
    it('should fetch the client by ID (200)', async () => {
        const res = await simulateHandler(getClientHandler, 'GET', `/api/clients/${client1Id}`, null, token1);
        expect(res.status).toBe(200);
        expect(res.body.client._id).toBe(client1Id);
    });

    // --- 3. PUT /api/clients/:id (Update) ---
    it('should allow updating all editable fields (200) - UX Enhancement Test', async () => {
        const update = {
            name: 'Acme Corp Updated',
            status: 'Inactive',
            contactName: 'New Contact',
            contactPhone: '555-555-5555',
        };
        const res = await simulateHandler(updateClientHandler, 'PUT', `/api/clients/${client1Id}`, update, token1);
        expect(res.status).toBe(200);
        expect(res.body.client.name).toBe(update.name);
        expect(res.body.client.status).toBe(update.status);
        expect(res.body.client.contactName).toBe(update.contactName);
        expect(res.body.client.contactPhone).toBe(update.contactPhone);
    });

    it('should return 404 for unauthorized PUT attempt', async () => {
        const user2 = await User.create({ name: 'Client User 2', email: 'client2@test.com', password: 'password' });
        const token2 = generateToken(user2._id.toString());
        const update = { name: 'Unauthorized Update' };
        const res = await simulateHandler(updateClientHandler, 'PUT', `/api/clients/${client1Id}`, update, token2);
        expect(res.status).toBe(404);
    });

    // --- 4. DELETE /api/clients/:id (Delete) ---
    it('should successfully delete the client (204)', async () => {
        const res = await simulateHandler(deleteClientHandler, 'DELETE', `/api/clients/${client1Id}`, null, token1);
        expect(res.status).toBe(204);

        // Verify client is gone
        const verifyRes = await simulateHandler(getClientHandler, 'GET', `/api/clients/${client1Id}`, null, token1);
        expect(verifyRes.status).toBe(404);
    });
});