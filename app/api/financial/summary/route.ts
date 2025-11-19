// app/api/financial/summary/route.ts

import { NextResponse } from 'next/server';
import { protect } from '@/lib/middleware/auth';

// Mock data structure derived from the frontend page's needs
const MOCK_FINANCIAL_SUMMARY = {
    // Top Cards
    totalIncome: 18245.50,
    totalExpenses: 5386.27,
    netProfit: 12859.23,

    // Charts Data (Mapped to frontend chart component inputs)
    incomeExpensesData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        income: [3200, 4300, 3800, 4500, 4100, 4700],
        expenses: [1500, 2100, 1800, 2200, 2000, 2400],
    },
    expenseBreakdown: {
        labels: ['Software', 'Marketing', 'Office', 'Travel', 'Other'],
        data: [36, 25, 19, 13, 7],
    },
    incomeTrend: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [3200, 3500, 4100, 4200, 4550, 4900],
    },
    // Mock Transactions
    recentTransactions: [
        { name: "Website Design Project", date: "2023-03-15", amount: 1200.00, type: "income" },
        { name: "Software Subscription", date: "2023-03-12", amount: -49.99, type: "expense" },
        { name: "Logo Design", date: "2023-03-10", amount: 350.00, type: "income" },
        { name: "Office Supplies", date: "2023-03-08", amount: -85.75, type: "expense" },
        { name: "Consulting Fee", date: "2023-03-05", amount: 800.00, type: "income" },
    ],
    // Mock Tax Data
    tax: {
        estimatedDue: 3658.45,
        deductions: 1874.22,
        nextDue: "Apr 15, 2023",
    }
};

/**
 * GET handler to fetch mock financial summary data.
 * Endpoint: GET /api/financial/summary
 */
async function getFinancialSummaryHandler() {
    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json({ summary: MOCK_FINANCIAL_SUMMARY }, { status: 200 });
}

export const GET = protect(getFinancialSummaryHandler);