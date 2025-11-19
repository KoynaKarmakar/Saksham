// app/api/events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Event from '@/lib/models/Event';
import mongoose from 'mongoose';

/**
 * GET handler to fetch all events for the user.
 * Endpoint: GET /api/events
 */
const getEventsHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    try {
        const userId = new mongoose.Types.ObjectId(user._id);
        const events = await Event.find({ user: userId }).sort({ date: 1 });

        return NextResponse.json({ events }, { status: 200 });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ message: 'Failed to fetch events' }, { status: 500 });
    }
};

/**
 * POST handler to create a new event.
 * Endpoint: POST /api/events
 */
const createEventHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const { title, date, description, type = 'Personal' } = await req.json();

    if (!title || !date) {
        return NextResponse.json({ message: 'Title and date are required' }, { status: 400 });
    }

    try {
        const newEvent = await Event.create({
            user: user._id,
            title,
            date: new Date(date), // Ensure date is parsed
            description,
            type,
        });

        // The returned event can be used to update local state
        return NextResponse.json({ event: newEvent }, { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ message: 'Failed to create event' }, { status: 500 });
    }
};

export const GET = protect(getEventsHandler);
export const POST = protect(createEventHandler);