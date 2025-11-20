// app/api/transactions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Transaction from '@/lib/models/Transaction';
import mongoose from 'mongoose';

/**
 * GET handler to fetch all user transactions.
 * Endpoint: GET /api/transactions
 */
const getTransactionsHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    try {
        const transactions = await Transaction.find({ user: user._id })
            .sort({ date: -1, createdAt: -1 });

        return NextResponse.json({ transactions }, { status: 200 });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ message: 'Failed to fetch transactions' }, { status: 500 });
    }
};

/**
 * POST handler to create a new transaction (Income or Expense).
 * Endpoint: POST /api/transactions
 */
const createTransactionHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const { name, amount, type, category, date, client } = await req.json();

    if (!name || typeof amount !== 'number' || !type || !category || !date) {
        return NextResponse.json({ message: 'Missing required transaction fields' }, { status: 400 });
    }

    // Ensure amount is saved correctly (negative for expense)
    const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    try {
        const newTransaction = await Transaction.create({
            user: user._id,
            name,
            amount: finalAmount,
            type,
            category,
            date: new Date(date),
            // Only include client ID if provided
            client: client || undefined,
        });

        return NextResponse.json({ transaction: newTransaction }, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ message: 'Server error creating transaction' }, { status: 500 });
    }
};

export const GET = protect(getTransactionsHandler);
export const POST = protect(createTransactionHandler);