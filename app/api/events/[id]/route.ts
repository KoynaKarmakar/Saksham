// app/api/events/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Event from '@/lib/models/Event';
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
 * GET handler to fetch a single event by ID.
 * Endpoint: GET /api/events/:id
 */
const getEventHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const eventId = getValidId(req);
    if (!eventId) {
        return NextResponse.json({ message: 'Invalid event ID' }, { status: 400 });
    }

    try {
        const event = await Event.findOne({
            _id: eventId,
            user: user._id,
        });

        if (!event) {
            return NextResponse.json({ message: 'Event not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ event }, { status: 200 });
    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json({ message: 'Server error fetching event' }, { status: 500 });
    }
};

/**
 * PUT handler to update event details.
 * Endpoint: PUT /api/events/:id
 */
const updateEventHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const eventId = getValidId(req);
    if (!eventId) {
        return NextResponse.json({ message: 'Invalid event ID' }, { status: 400 });
    }

    const body = await req.json();

    try {
        const updatedEvent = await Event.findOneAndUpdate(
            { _id: eventId, user: user._id },
            {
                title: body.title,
                date: body.date ? new Date(body.date) : undefined,
                description: body.description,
                type: body.type,
                location: body.location,
                isAllDay: body.isAllDay,
                client: body.client,
            },
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return NextResponse.json({ message: 'Event not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ event: updatedEvent }, { status: 200 });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ message: 'Server error during event update' }, { status: 500 });
    }
};


/**
 * DELETE handler to delete a single event. (Original logic retained)
 * Endpoint: DELETE /api/events/:id 
 */
const deleteEventHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const eventId = getValidId(req);
    if (!eventId) {
        return NextResponse.json({ message: 'Invalid event ID' }, { status: 400 });
    }

    try {
        const result = await Event.findOneAndDelete({
            _id: eventId,
            user: user._id,
        });

        if (!result) {
            return NextResponse.json({ message: 'Event not found or access denied' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ message: 'Server error during deletion' }, { status: 500 });
    }
};


export const GET = protect(getEventHandler);
export const PUT = protect(updateEventHandler);
export const DELETE = protect(deleteEventHandler);