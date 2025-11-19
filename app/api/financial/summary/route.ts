// app/api/financial/summary/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Transaction from '@/lib/models/Transaction';
import mongoose from 'mongoose';

/**
 * Helper to get the start of the current year.
 */
const getStartOfYear = (date: Date) => {
    return new Date(date.getFullYear(), 0, 1);
};

// Define month labels for the chart axis
const MONTH_LABELS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * GET handler to fetch live financial summary data via aggregation.
 * Endpoint: GET /api/financial/summary
 */
const getFinancialSummaryHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const userId = new mongoose.Types.ObjectId(user._id);
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const startOfYear = getStartOfYear(now);

    try {
        // --- 1. Total Metrics Calculation (Unchanged) ---
        const totalMetrics = await Transaction.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [{ $gt: ["$amount", 0] }, "$amount", 0]
                        }
                    },
                    totalExpenses: {
                        $sum: {
                            $cond: [{ $lt: ["$amount", 0] }, "$amount", 0]
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalIncome: "$totalIncome",
                    totalExpenses: { $abs: "$totalExpenses" },
                    netProfit: { $add: ["$totalIncome", "$totalExpenses"] }
                }
            }
        ]);

        // --- 2. Expense Breakdown (Unchanged) ---
        const expenseBreakdown = await Transaction.aggregate([
            {
                $match: {
                    user: userId,
                    type: 'expense',
                    date: { $gte: startOfYear, $lte: now }
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalAmount: { $sum: { $abs: "$amount" } }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        const totalExpensesCurrentYear = expenseBreakdown.reduce((sum, item) => sum + item.totalAmount, 0);

        const expenseBreakdownChart = {
            labels: expenseBreakdown.map(b => b._id),
            data: expenseBreakdown.map(b =>
                totalExpensesCurrentYear > 0 ? Math.round((b.totalAmount / totalExpensesCurrentYear) * 100) : 0
            )
        };

        // --- 3. Monthly Trend Aggregation (NEW LIVE LOGIC) ---

        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    user: userId,
                    date: { $gte: startOfYear, $lte: now }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$date" } },
                    income: {
                        $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] }
                    },
                    expense: {
                        $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] }
                    },
                }
            },
            { $sort: { "_id.month": 1 } }
        ]);

        // Initialize arrays up to the current month
        const monthlyIncome = new Array(currentMonthIndex + 1).fill(0);
        const monthlyExpenses = new Array(currentMonthIndex + 1).fill(0);

        // Populate arrays with fetched data
        monthlyData.forEach(item => {
            const monthIndex = item._id.month - 1; // Mongo uses 1-12
            if (monthIndex <= currentMonthIndex) {
                monthlyIncome[monthIndex] = item.income;
                monthlyExpenses[monthIndex] = item.expense;
            }
        });

        const chartLabels = MONTH_LABELS.slice(0, currentMonthIndex + 1);

        // --- 4. Recent Transactions (Unchanged) ---
        const recentTransactions = await Transaction.find({ user: userId })
            .sort({ date: -1 })
            .limit(5);

        const recentTx = recentTransactions.map(tx => ({
            name: tx.name,
            date: tx.date.toISOString(),
            amount: Math.abs(tx.amount),
            type: tx.type,
        }));

        // --- Assemble Final Summary ---
        const summary = totalMetrics[0] || { totalIncome: 0, totalExpenses: 0, netProfit: 0 };

        const financialSummary = {
            totalIncome: summary.totalIncome,
            totalExpenses: summary.totalExpenses,
            netProfit: summary.netProfit,
            // LIVE CHART DATA
            incomeExpensesData: {
                labels: chartLabels,
                income: monthlyIncome,
                expenses: monthlyExpenses,
            },
            expenseBreakdown: expenseBreakdownChart,
            // LIVE INCOME TREND DATA
            incomeTrend: {
                labels: chartLabels,
                data: monthlyIncome, // Income trend is just the monthly income
            },
            recentTransactions: recentTx,
            tax: {
                estimatedDue: 3658.45,
                deductions: 1874.22,
                nextDue: "Apr 15, 2023",
            }
        };

        return NextResponse.json({ summary: financialSummary }, { status: 200 });

    } catch (error) {
        console.error('Error in financial summary aggregation:', error);
        return NextResponse.json({ message: 'Failed to calculate financial summary.' }, { status: 500 });
    }
};

export const GET = protect(getFinancialSummaryHandler);