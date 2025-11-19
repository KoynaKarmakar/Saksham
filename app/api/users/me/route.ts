// app/api/users/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import { IUser } from '@/lib/models/User';

/**
 * GET handler to fetch the authenticated user's profile.
 * Endpoint: GET /api/users/me
 */
const getMeHandler: AuthenticatedHandler = async (req: NextRequest, user: IUser) => {
    return NextResponse.json({ user }, { status: 200 });
};

/**
 * PUT handler to update the authenticated user's profile fields.
 * Endpoint: PUT /api/users/me
 */
const updateProfileHandler: AuthenticatedHandler = async (req: NextRequest, user: IUser) => {
    const body = await req.json();

    const updatableFields = [
        'name', 'username', 'phone', 'tagline', 'profilePicture'
    ] as const;

    let hasUpdate = false;

    // 1. Handle simple fields
    updatableFields.forEach(field => {
        if (body[field] !== undefined) {
            (user as any)[field] = body[field];
            hasUpdate = true;
        }
    });

    // 2. Handle nested/array fields explicitly with markModified
    if (body.portfolio !== undefined) {
        // Use spread to merge new data into the existing nested object
        user.portfolio = { ...user.portfolio, ...body.portfolio };
        user.markModified('portfolio'); // FIX: Notify Mongoose of the change
        hasUpdate = true;
    }

    if (body.socialLinks !== undefined) {
        user.socialLinks = body.socialLinks;
        user.markModified('socialLinks'); // FIX: Notify Mongoose of the change
        hasUpdate = true;
    }

    if (!hasUpdate) {
        return NextResponse.json({ message: 'No valid fields provided for update' }, { status: 400 });
    }

    const updatedUser = await user.save();

    return NextResponse.json({ user: updatedUser }, { status: 200 });
};

export const GET = protect(getMeHandler);
export const PUT = protect(updateProfileHandler);