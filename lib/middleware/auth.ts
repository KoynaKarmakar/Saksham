// lib/middleware/auth.ts

import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '../utils/auth';
import dbConnect from '../db';
import User, { IUser } from '../models/User';

// Define the handler type with an injected user object
export type AuthenticatedHandler = (req: NextRequest, user: IUser) => Promise<NextResponse>;

/**
 * Middleware wrapper to secure Next.js Route Handlers.
 * Checks for JWT in the Authorization header and fetches the user object.
 */
export const protect = (handler: AuthenticatedHandler) => {
    return async (req: NextRequest): Promise<NextResponse> => {
        let token;

        // 1. Get token from Authorization header (Bearer token)
        const authHeader = req.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return NextResponse.json({ message: 'Not authorized, no token' }, { status: 401 });
        }

        try {
            await dbConnect(); // Connect to DB

            // 2. Decode and verify token
            const decoded = decodeToken(token);

            if (!decoded || !decoded.id) {
                return NextResponse.json({ message: 'Not authorized, token failed' }, { status: 401 });
            }

            // 3. Find user by ID (exclude password field)
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            // 4. Attach user and execute the protected handler
            return handler(req, user);

        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: 'Not authorized, token failed' }, { status: 401 });
        }
    };
};

/**
 * Simple wrapper for non-authenticated public routes (e.g., login/signup)
 * Ensures DB connection and provides basic error handling.
 */
export const apiHandler = (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest): Promise<NextResponse> => {
        try {
            await dbConnect();
            return handler(req);
        } catch (error) {
            console.error('API Handler Error:', error);
            // Default 500 error for unhandled exceptions
            return NextResponse.json({ message: 'Server error' }, { status: 500 });
        }
    };
};