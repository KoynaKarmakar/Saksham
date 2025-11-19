// app/api/clients/invoices/recent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Transaction from '@/lib/models/Transaction';
import mongoose from 'mongoose';

/**
 * GET handler to fetch the user's 3 most recent, paid (income) transactions
 * that are linked to a client.
 * Endpoint: GET /api/clients/invoices/recent
 */
const getRecentInvoicesHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        // Fetch recent transactions that are income and linked to a client
        const recentInvoices = await Transaction.find({
            user: userId,
            type: 'income',
            client: { $exists: true, $ne: null }
        })
            .sort({ date: -1 })
            .limit(3);

        // Convert documents to a plain structure for the response
        const formattedInvoices = recentInvoices.map(inv => ({
            client: inv.client?.toString(), // Client ID
            date: inv.date.toISOString(),
            amount: inv.amount,
            status: 'Paid', // Assuming all recorded income is 'Paid' for this list
            name: inv.name,
        }));

        return NextResponse.json({ invoices: formattedInvoices }, { status: 200 });
    } catch (error) {
        console.error('Error fetching recent invoices:', error);
        return NextResponse.json({ message: 'Failed to fetch recent invoices' }, { status: 500 });
    }
};

export const GET = protect(getRecentInvoicesHandler);