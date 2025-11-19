// test/financial.benefit.test.ts

import { NextRequest, NextResponse } from 'next/server';
import User from '../lib/models/User';
import Transaction from '../lib/models/Transaction';
import { generateToken } from '../lib/utils/auth';
// Import Handlers
import { GET as getSummaryHandler } from '../app/api/financial/summary/route';
// FIX: Correctly importing the POST handler for /api/transactions
import { POST as addTransactionHandler } from '../app/api/transactions/route';
import { POST as addFundsHandler } from '../app/api/benefits/funds/add/route';

// FIX: Import simulateHandler from jest.setup.ts
import { simulateHandler } from '../jest.setup';

describe('Financial and Benefit Aggregation Endpoints', () => {
    let userToken: string;
    let userId: string;

    // Dates for current year testing
    const currentYear = new Date().getFullYear();

    beforeAll(async () => {
        const user = await User.create({ name: 'Financial User', email: 'financial-test@example.com', password: 'password' });
        userToken = generateToken(user._id.toString());
        userId = user._id.toString();

        // Seed Transactions: Total Income 2300, Total Expenses 400
        await Transaction.create([
            { user: userId, name: 'Jan Income', date: `${currentYear}-01-20`, amount: 1000, type: 'income', category: 'Consulting' },
            { user: userId, name: 'Feb Expense', date: `${currentYear}-02-10`, amount: -200, type: 'expense', category: 'Software' },
            { user: userId, name: 'Mar Income', date: `${currentYear}-03-15`, amount: 500, type: 'income', category: 'Project Fee' },
            { user: userId, name: 'Mar Expense', date: `${currentYear}-03-01`, amount: -100, type: 'expense', category: 'Software' },
        ]);
        // Add transactions that will be tested via POST
        await simulateHandler(addTransactionHandler, 'POST', '/api/transactions', { name: 'Apr Income', amount: 800, type: 'income', category: 'Consulting', date: `${currentYear}-04-01` }, userToken);
        await simulateHandler(addTransactionHandler, 'POST', '/api/transactions', { name: 'Apr Expense', amount: 50, type: 'expense', category: 'Marketing', date: `${currentYear}-04-10` }, userToken);
    });

    // --- 1. GET /api/financial/summary (Live Aggregation) ---
    describe('GET /api/financial/summary', () => {
        it('should calculate correct total metrics and trends from transactions (200)', async () => {
            const res = await simulateHandler(getSummaryHandler, 'GET', '/api/financial/summary', null, userToken);
            expect(res.status).toBe(200);

            // Total Income: 1000 (Jan) + 500 (Mar) + 800 (Apr) = 2300
            // Total Expenses: 200 (Feb) + 100 (Mar) + 50 (Apr) = 350

            expect(res.body.summary.totalIncome).toBeCloseTo(2300);
            expect(res.body.summary.totalExpenses).toBeCloseTo(350);
            expect(res.body.summary.netProfit).toBeCloseTo(1950);
        });

        it('should calculate correct expense breakdown percentages (Live)', async () => {
            const res = await simulateHandler(getSummaryHandler, 'GET', '/api/financial/summary', null, userToken);
            const breakdown = res.body.summary.expenseBreakdown;

            // Total Expenses YTD: 350
            // Software: 200 (Feb) + 100 (Mar) = 300 (85.7%)
            // Marketing: 50 (Apr) = 50 (14.3%)

            const softwareIndex = breakdown.labels.indexOf('Software');
            const marketingIndex = breakdown.labels.indexOf('Marketing');

            expect(breakdown.data[softwareIndex]).toBe(86);
            expect(breakdown.data[marketingIndex]).toBe(14);
        });
    });

    // --- 2. POST /api/benefits/funds/add (Live Fund Persistence) ---
    describe('POST /api/benefits/funds/add', () => {
        it('should successfully add funds and update balance (200)', async () => {
            // First contribution
            const res = await simulateHandler(addFundsHandler, 'POST', '/api/benefits/funds/add', { type: 'EmergencyFund', amount: 500 }, userToken);
            expect(res.status).toBe(200);
            expect(res.body.fund.currentAmount).toBe(500);

            // Second contribution
            const res2 = await simulateHandler(addFundsHandler, 'POST', '/api/benefits/funds/add', { type: 'EmergencyFund', amount: 200 }, userToken);
            expect(res2.status).toBe(200);
            expect(res2.body.fund.currentAmount).toBe(700);
        });

        it('should fail with invalid amount (400)', async () => {
            const res = await simulateHandler(addFundsHandler, 'POST', '/api/benefits/funds/add', { type: 'EmergencyFund', amount: -100 }, userToken);
            expect(res.status).toBe(400);
        });
    });
});