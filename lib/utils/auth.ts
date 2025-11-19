// lib/utils/auth.ts

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_must_not_be_used_in_production';

/**
 * Generates a JWT token for a user.
 */
export const generateToken = (id: string): string => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * Decodes a JWT token and returns the payload (user ID).
 */
export const decodeToken = (token: string): { id: string } | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        return decoded;
    } catch (error) {
        return null;
    }
};