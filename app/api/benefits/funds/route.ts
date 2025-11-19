// app/api/benefits/funds/route.ts

import { NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Fund from '@/lib/models/Fund';
import mongoose from 'mongoose';

/**
 * GET handler to fetch the user's Emergency and Paid Leave funds.
 * Endpoint: GET /api/benefits/funds
 */
const getFundsHandler: AuthenticatedHandler = async (req, user) => {
    try {
        const funds = await Fund.find({ user: user._id });

        // Ensure both fund types are returned, initializing to 0 if missing (with default goals)
        const emergencyFund = funds.find(f => f.type === 'EmergencyFund')?.toObject() || {
            type: 'EmergencyFund',
            currentAmount: 0,
            goalAmount: 10000,
            user: user._id,
        };
        const paidLeaveFund = funds.find(f => f.type === 'PaidLeaveFund')?.toObject() || {
            type: 'PaidLeaveFund',
            currentAmount: 0,
            goalAmount: 5000,
            user: user._id,
        };

        return NextResponse.json({ funds: [emergencyFund, paidLeaveFund] }, { status: 200 });
    } catch (error) {
        console.error('Error fetching funds:', error);
        return NextResponse.json({ message: 'Failed to fetch funds' }, { status: 500 });
    }
};

export const GET = protect(getFundsHandler);