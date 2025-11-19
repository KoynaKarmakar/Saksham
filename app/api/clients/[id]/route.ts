// app/api/clients/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Client from '@/lib/models/Client';
import mongoose from 'mongoose';

/**
 * DELETE handler to delete a single client.
 * Endpoint: DELETE /api/clients/:id
 */
const deleteClientHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    // Extract client ID from the request URL parameters
    const urlParts = req.url.split('/');
    const clientId = urlParts.pop();

    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
        return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
    }

    try {
        const result = await Client.findOneAndDelete({
            _id: clientId,
            user: user._id, // Ensure the user owns the client
        });

        if (!result) {
            return NextResponse.json({ message: 'Client not found or access denied' }, { status: 404 });
        }

        // 204 No Content for a successful deletion
        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json({ message: 'Server error during deletion' }, { status: 500 });
    }
};

export const DELETE = protect(deleteClientHandler);