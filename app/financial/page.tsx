// app/financial/page.tsx

'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { apiFetch } from '@/lib/api';
import { useAuth } from '../context/AuthContext';
import TransactionFormModal from '@/components/TransactionFormModal'; // Assuming placement here

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

// Define complex data structures for the fetched summary
interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeExpensesData: {
    labels: string[];
    income: number[];
    expenses: number[];
  };
  expenseBreakdown: {
    labels: string[];
    data: number[];
  };
  incomeTrend: {
    labels: string[];
    data: number[];
  };
  recentTransactions: {
    name: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
  }[];
  tax: {
    estimatedDue: number;
    deductions: number;
    nextDue: string;
  };
}

const formatCurrency = (amount: number): string => {
  return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function FinancialPage() {
  const { isLoggedIn } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state (NEW)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // --- Data Fetching: GET /api/financial/summary (made callable) ---
  const fetchSummary = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError(null);
    try {
      const { summary: fetchedSummary } = await apiFetch('/financial/summary', { method: 'GET' });
      setSummary(fetchedSummary);
    } catch (err) {
      console.error("Failed to fetch financial summary:", err);
      setError("Failed to load financial data.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // --- Transaction Submission Handler: POST /api/transactions (NEW) ---
  const handleAddTransactionSubmit = async (formData: any) => {
    setModalLoading(true);
    setModalError(null);

    const isIncome = formData.type === 'income';
    const rawAmount = parseFloat(formData.amount);

    try {
      const payload = {
        name: formData.name,
        amount: isIncome ? rawAmount : -rawAmount, // Amount is positive for income, negative for expense in the DB model
        type: formData.type,
        category: formData.category,
        date: formData.date,
        // Only include client ID if selected
        client: formData.client || undefined,
      };

      // POST to backend
      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Success: Close modal, refresh dashboard data
      setIsModalOpen(false);
      // Re-fetch the summary data to reflect the new transaction instantly
      await fetchSummary();

    } catch (err: any) {
      setModalError(err.message || "An unknown error occurred while recording the transaction.");
    } finally {
      setModalLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#18141e] text-white px-0 items-center justify-center">
        Loading Financial Dashboard...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen flex flex-col bg-[#18141e] text-red-400 px-0 items-center justify-center">
        Error loading data: {error}
      </div>
    );
  }

  // Map fetched data to chart props (unchanged)
  const incomeExpensesChartData = {
    labels: summary.incomeExpensesData.labels,
    datasets: [
      {
        label: 'Income',
        backgroundColor: '#b772f8',
        data: summary.incomeExpensesData.income,
        borderRadius: 6,
        barThickness: 24,
      },
      {
        label: 'Expenses',
        backgroundColor: '#96e6b3',
        data: summary.incomeExpensesData.expenses,
        borderRadius: 6,
        barThickness: 24,
      },
      {
        label: 'Profit',
        backgroundColor: '#ffe485',
        data: summary.incomeExpensesData.income.map((inc, i) => inc - summary.incomeExpensesData.expenses[i]),
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };

  const expensePieChartData = {
    labels: summary.expenseBreakdown.labels,
    datasets: [
      {
        data: summary.expenseBreakdown.data,
        backgroundColor: ['#b773f8', '#96e6b3', '#ffc46b', '#629ad7', '#394152'],
        borderColor: '#18141e',
        borderWidth: 2,
      },
    ],
  };

  const incomeTrendChartData = {
    labels: summary.incomeTrend.labels,
    datasets: [
      {
        label: 'Income',
        fill: true,
        data: summary.incomeTrend.data,
        backgroundColor: 'rgba(183, 115, 248, 0.2)',
        borderColor: '#b773f8',
        tension: 0.4,
      },
    ],
  };

  // --- Render Components (kept local for charting needs) ---

  const IncomeExpensesBarChart = () => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: { color: '#fff', font: { size: 14 } },
        },
      },
      scales: {
        x: { ticks: { color: '#aaa' }, grid: { color: '#392955' } },
        y: { ticks: { color: '#aaa' }, grid: { color: '#392955' }, beginAtZero: true },
      },
    };
    return <div className="h-60"><Bar data={incomeExpensesChartData} options={options} /></div>;
  }

  const ExpensePieChart = () => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right' as const,
          labels: { color: '#fff', font: { size: 13 } },
        },
      },
    };
    return <div className="h-52"><Pie data={expensePieChartData} options={options} /></div>;
  }

  const IncomeTrendChart = () => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: '#aaa' }, grid: { color: '#392955' } },
        y: { ticks: { color: '#aaa' }, grid: { color: '#392955' }, beginAtZero: true },
      },
    };
    return <div className="h-40"><Line data={incomeTrendChartData} options={options} /></div>;
  }


  return (
    <div className="flex min-h-screen flex-col bg-[#18141e] text-white px-0">

      {/* Transaction Modal Integration (NEW) */}
      <TransactionFormModal
        // NOTE: User must ensure TransactionFormModal is accessible (e.g., placed in components/)
        // @ts-ignore: Assume component is imported correctly by user
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransactionSubmit}
        loading={modalLoading}
        error={modalError}
      />

      <main className="max-w-[1400px] mx-auto w-full px-8 pb-16">
        {/* Page Header */}
        <div className="pt-10 pb-4 flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold">Financial Management</h1>
          <p className="text-gray-300 mt-1 text-lg">Track your income, expenses, and manage your taxes.</p>
        </div>

        {/* Top Cards (Live Data) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
          <Card
            title="Total Income"
            value={formatCurrency(summary.totalIncome)}
            change="+12.5% from last month"
            changeColor="text-green-400"
          />
          <Card
            title="Total Expenses"
            value={formatCurrency(summary.totalExpenses)}
            change="+8.2% from last month"
            changeColor="text-red-400"
          />
          <Card
            title="Net Profit"
            value={formatCurrency(summary.netProfit)}
            change="+14.3% from last month"
            changeColor="text-green-400"
          />
        </div>

        {/* Filters and Add */}
        <div className="flex flex-row gap-3 pt-7 pb-4">
          <button className="bg-[#221c2e] px-4 py-2 rounded-lg text-white text-sm font-medium">Filter</button>
          <button className="bg-[#221c2e] px-4 py-2 rounded-lg text-white text-sm font-medium">Export</button>
          {/* Updated button to open modal */}
          <button
            className="bg-[#b773f8] px-4 py-2 rounded-lg text-white text-sm font-semibold"
            onClick={() => { setIsModalOpen(true); setModalError(null); }}
            disabled={loading}
          >
            + Add Transaction
          </button>
        </div>

        {/* Charts Section (Live Data) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 pt-2">
          <div className="bg-[#201c2c] rounded-xl p-7 shadow-lg">
            <div className="flex justify-between pb-3">
              <span className="font-bold text-lg text-white">Income & Expenses</span>
              <button className="bg-[#221c2e] px-3 py-1 rounded-lg text-sm">Filter</button>
            </div>
            <IncomeExpensesBarChart />
          </div>
          <div className="bg-[#201c2c] rounded-xl p-7 shadow-lg">
            <div className="flex justify-between pb-3">
              <span className="font-bold text-lg text-white">Expense Breakdown</span>
            </div>
            <ExpensePieChart />
          </div>
        </div>

        {/* Income Trend (Live Data) */}
        <div className="bg-[#201c2c] rounded-xl p-7 mt-7 shadow-lg">
          <span className="font-bold text-lg mb-2 block">Income Trend</span>
          <IncomeTrendChart />
        </div>

        {/* Tax Estimation and Details (Live Data) */}
        <div className="bg-[#201c2c] rounded-xl p-7 mt-7 shadow-lg">
          <span className="font-bold text-lg mb-2 block">Tax Estimation</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <TaxItem title="Estimated Tax Due" amount={formatCurrency(summary.tax.estimatedDue)} desc="Based on current income" />
            <TaxItem title="Tax Deductions" amount={formatCurrency(summary.tax.deductions)} desc="Potential savings found" />
            <TaxItem title="Next Quarterly Due" amount={summary.tax.nextDue} desc="45 days remaining" />
          </div>
          <button className="w-full bg-[#b773f8] mt-5 py-3 rounded-lg text-center text-white font-semibold">
            Run Detailed Tax Analysis
          </button>
        </div>

        {/* Recent Transactions (Live Data) */}
        <div className="bg-[#201c2c] rounded-xl p-7 mt-7 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-lg">Recent Transactions</span>
            <button className="bg-[#221c2e] px-3 py-1 rounded-lg text-sm">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            {summary.recentTransactions.map((tx, index) => (
              <TransactionItem
                key={index}
                name={tx.name}
                date={new Date(tx.date).toLocaleDateString('en-GB')}
                value={`${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}`}
                type={tx.type}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable components for Cards, Tax Items, Transactions (unchanged)
function Card({ title, value, change, changeColor }: any) {
  return (
    <div className="bg-[#201c2c] rounded-xl p-8 flex flex-col shadow-lg">
      <span className="text-lg font-semibold text-gray-300 mb-1">{title}</span>
      <span className="text-3xl font-extrabold mb-2 text-white">{value}</span>
      <span className={`text-sm font-semibold ${changeColor}`}>{change}</span>
    </div>
  );
}

function TaxItem({ title, amount, desc }: any) {
  return (
    <div>
      <span className="text-md font-bold">{title}</span>
      <div className="text-2xl font-semibold text-white">{amount}</div>
      <div className="text-sm text-gray-400">{desc}</div>
    </div>
  );
}

function TransactionItem({ name, date, value, type }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="font-semibold">{name}</span>
        <span className="block text-xs text-gray-400">{date}</span>
      </div>
      <span className={`font-bold text-lg ${type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
        {value}
      </span>
    </div>
  );
}