// test/auth.test.ts

import { NextRequest, NextResponse } from 'next/server';
import User from '../lib/models/User';
import { generateToken } from '../lib/utils/auth';
// Import Handlers
import { POST as signupHandler } from '../app/api/auth/signup/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { GET as getMeHandler, PUT as updateProfileHandler } from '../app/api/users/me/route';
// Mock simulateHandler is assumed to be available

describe('Auth & User API Endpoints (Profile & Settings)', () => {
    const testUser = {
        name: 'Test User',
        email: 'test-auth@example.com',
        password: 'password123',
    };
    let authToken: string;

    beforeAll(async () => {
        const res = await simulateHandler(signupHandler, 'POST', '/api/auth/signup', testUser);
        authToken = res.body.token;
    });

    // --- PUT /api/users/me (Profile Update) ---
    describe('PUT /api/users/me', () => {
        const updateData = {
            tagline: 'Gig worker testing portfolio update.',
            portfolio: { title: 'Live Work', url: 'http://live.com' },
            socialLinks: ['https://linkedin.com/test'],
            name: 'Updated Name',
        };

        it('should update complex and simple profile fields (200)', async () => {
            const res = await simulateHandler(updateProfileHandler, 'PUT', '/api/users/me', updateData, authToken);
            expect(res.status).toBe(200);
            expect(res.body.user.name).toBe(updateData.name);
            expect(res.body.user.tagline).toBe(updateData.tagline);
            expect(res.body.user.portfolio.title).toBe(updateData.portfolio.title);
            expect(res.body.user.socialLinks).toContain('https://linkedin.com/test');
        });

        it('should fail if unauthorized (401)', async () => {
            const res = await simulateHandler(updateProfileHandler, 'PUT', '/api/users/me', { name: 'Fail' }, 'invalid_token');
            expect(res.status).toBe(401);
        });
    });

    // --- PUT /api/users/me/settings (Security & Notifications) ---
    // Note: Requires the handler in app/api/users/me/settings/route.ts
    // describe('PUT /api/users/me/settings', () => {
    //     it('should update security settings (200)', async () => {
    //         const settingsRes = await simulateHandler(updateSettingsHandler, 'PUT', '/api/users/me/settings', { twoFactorEnabled: true, notifications: { push: false } }, authToken);
    //         expect(settingsRes.status).toBe(200);
    //         expect(settingsRes.body.user.twoFactorEnabled).toBe(true);
    //         expect(settingsRes.body.user.notifications.push).toBe(false);
    //     });
    // });
});