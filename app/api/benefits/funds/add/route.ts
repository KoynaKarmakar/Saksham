// app/api/benefits/funds/add/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Fund from '@/lib/models/Fund';

/**
 * POST handler to add funds to a specific fund type.
 * Endpoint: POST /api/benefits/funds/add
 */
const addFundsHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const { type, amount } = await req.json();

    if (!type || !amount || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ message: 'Invalid fund type or amount.' }, { status: 400 });
    }

    const fundType = type as 'EmergencyFund' | 'PaidLeaveFund';
    if (!['EmergencyFund', 'PaidLeaveFund'].includes(fundType)) {
        return NextResponse.json({ message: 'Invalid fund type specified.' }, { status: 400 });
    }

    try {
        const result = await Fund.findOneAndUpdate(
            { user: user._id, type: fundType },
            {
                $inc: { currentAmount: amount },
                $setOnInsert: { goalAmount: fundType === 'EmergencyFund' ? 10000 : 5000 } // Initialize goal if not exists
            },
            { upsert: true, new: true, runValidators: true } // Create if not exists, return updated document
        );

        return NextResponse.json({ fund: result }, { status: 200 });
    } catch (error) {
        console.error('Error adding funds:', error);
        return NextResponse.json({ message: 'Failed to update fund balance.' }, { status: 500 });
    }
};

export const POST = protect(addFundsHandler);