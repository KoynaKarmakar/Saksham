// app/api/users/me/settings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import { IUser } from '@/lib/models/User';

/**
 * PUT handler to update security and notification settings.
 * Endpoint: PUT /api/users/me/settings
 */
const updateSettingsHandler: AuthenticatedHandler = async (req: NextRequest, user: IUser) => {
    const body = await req.json();
    let hasUpdate = false;

    // Security fields
    if (body.twoFactorEnabled !== undefined) { user.twoFactorEnabled = body.twoFactorEnabled; hasUpdate = true; }
    if (body.securityAlerts !== undefined) { user.securityAlerts = body.securityAlerts; hasUpdate = true; }
    if (body.rememberDevices !== undefined) { user.rememberDevices = body.rememberDevices; hasUpdate = true; }

    // Notification fields
    if (body.notifications !== undefined) {
        if (body.notifications.email !== undefined) { user.notifications.email = body.notifications.email; hasUpdate = true; }
        if (body.notifications.push !== undefined) { user.notifications.push = body.notifications.push; hasUpdate = true; }
        if (body.notifications.sms !== undefined) { user.notifications.sms = body.notifications.sms; hasUpdate = true; }
        if (body.notifications.weekly !== undefined) { user.notifications.weekly = body.notifications.weekly; hasUpdate = true; }
    }

    if (!hasUpdate) {
        return NextResponse.json({ message: 'No valid settings fields provided for update' }, { status: 400 });
    }

    const updatedUser = await user.save();
    return NextResponse.json({ user: updatedUser }, { status: 200 });
};

export const PUT = protect(updateSettingsHandler);