// app/api/clients/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Client from '@/lib/models/Client';
import mongoose from 'mongoose'; // FIX: Import Mongoose for safe ObjectId use

/**
 * GET handler to fetch all clients for the user.
 * Endpoint: GET /api/clients
 */
const getClientsHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    try {
        // FIX: Explicitly convert user ID to ObjectId for safer querying
        const userId = new mongoose.Types.ObjectId(user._id);
        const clients = await Client.find({ user: userId }).sort({ name: 1 });
        return NextResponse.json({ clients }, { status: 200 });
    } catch (error) {
        // FIX: Improved error response for debugging (Error 2)
        console.error('Error fetching clients:', (error as Error).message);
        return NextResponse.json({ message: `Failed to fetch clients: ${(error as Error).message}` }, { status: 500 });
    }
};

/**
 * POST handler to create a new client.
 * Endpoint: POST /api/clients
 */
const createClientHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const { name, contactName, contactEmail, contactPhone, status } = await req.json();

    if (!name || !contactName || !contactEmail) {
        return NextResponse.json({ message: 'Missing required client fields (name, contactName, contactEmail)' }, { status: 400 });
    }

    try {
        const newClient = await Client.create({
            user: user._id,
            name,
            contactName,
            contactEmail,
            contactPhone,
            status: status || 'Active',
        });
        return NextResponse.json({ client: newClient }, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', (error as Error).message);
        return NextResponse.json({ message: `Failed to create client: ${(error as Error).message}` }, { status: 500 });
    }
};

export const GET = protect(getClientsHandler);
export const POST = protect(createClientHandler);