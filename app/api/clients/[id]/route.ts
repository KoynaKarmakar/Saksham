// app/api/clients/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Client from '@/lib/models/Client';
import mongoose from 'mongoose';

/**
 * Helper to extract ID and ensure it's valid
 */
const getValidId = (req: NextRequest): string | null => {
    const urlParts = req.url.split('/');
    const id = urlParts[urlParts.length - 1];
    return id && mongoose.Types.ObjectId.isValid(id) ? id : null;
}


/**
 * GET handler to fetch a single client by ID.
 * Endpoint: GET /api/clients/:id
 */
const getClientHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const clientId = getValidId(req);
    if (!clientId) {
        return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
    }

    try {
        const client = await Client.findOne({
            _id: clientId,
            user: user._id,
        });

        if (!client) {
            return NextResponse.json({ message: 'Client not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ client }, { status: 200 });
    } catch (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json({ message: 'Server error fetching client' }, { status: 500 });
    }
};


/**
 * PUT handler to update client details.
 * Endpoint: PUT /api/clients/:id
 */
const updateClientHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const clientId = getValidId(req);
    if (!clientId) {
        return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
    }

    const body = await req.json();

    try {
        const updatedClient = await Client.findOneAndUpdate(
            { _id: clientId, user: user._id },
            {
                name: body.name,
                contactName: body.contactName,
                contactEmail: body.contactEmail,
                contactPhone: body.contactPhone,
                status: body.status,
                // Note: projectsCount, totalBilled, and lastContactDate are typically updated by system events (transactions/invoicing)
            },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedClient) {
            return NextResponse.json({ message: 'Client not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ client: updatedClient }, { status: 200 });
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ message: 'Server error during update' }, { status: 500 });
    }
};

/**
 * DELETE handler to delete a single client.
 * Endpoint: DELETE /api/clients/:id (Retained from previous step)
 */
const deleteClientHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const clientId = getValidId(req);
    if (!clientId) {
        return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
    }

    try {
        const result = await Client.findOneAndDelete({
            _id: clientId,
            user: user._id,
        });

        if (!result) {
            return NextResponse.json({ message: 'Client not found or access denied' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json({ message: 'Server error during deletion' }, { status: 500 });
    }
};

// Handle all methods in this single file
export const GET = protect(getClientHandler);
export const PUT = protect(updateClientHandler);
export const DELETE = protect(deleteClientHandler);