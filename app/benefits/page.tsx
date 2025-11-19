// app/benefits/page.tsx

'use client';
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '@/lib/api';

const tabData = [
  { label: "Health Insurance", value: "health" },
  { label: "Retirement Options", value: "retirement" },
  { label: "Emergency Fund", value: "emergency" },
];

// Define Data Structures (Matching API Mock and Live Fund)
interface Plan {
  name: string;
  desc: string;
  price: string;
  rating: number;
  reviews: number;
}
interface RetirementOption {
  name: string;
  desc: string;
  amount: string;
}

interface FundBalance {
  _id?: string;
  type: 'EmergencyFund' | 'PaidLeaveFund';
  currentAmount: number;
  goalAmount: number;
}

interface BenefitsCatalog {
  plans: Array<Plan | RetirementOption>;
}

const formatCurrency = (amount: number): string => {
  return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};


export default function BenefitsPage() {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState("health");

  const [catalog, setCatalog] = useState<BenefitsCatalog | null>(null);
  const [fundBalances, setFundBalances] = useState<FundBalance[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---

  const fetchFundBalances = useCallback(async () => {
    try {
      const { funds } = await apiFetch('/benefits/funds', { method: 'GET' });
      setFundBalances(funds);
    } catch (err) {
      console.error("Failed to fetch fund balances:", err);
      setError("Failed to load fund balances.");
    }
  }, []);

  const fetchCatalogAndFunds = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    await Promise.allSettled([
      (async () => {
        try {
          const { catalog: fetchedCatalog } = await apiFetch('/network/catalog', { method: 'GET' });
          setCatalog(fetchedCatalog);
        } catch (err) {
          console.error("Failed to fetch catalog:", err);
          setError("Failed to load benefits catalog.");
        }
      })(),
      fetchFundBalances(), // Fetch funds
    ]);

    setLoading(false);
  }, [isLoggedIn, fetchFundBalances]);

  useEffect(() => {
    fetchCatalogAndFunds();
  }, [fetchCatalogAndFunds]);

  // --- Fund Contribution Handler ---

  const handleContribute = async (fundType: FundBalance['type']) => {
    const amountStr = prompt(`Enter amount to contribute to ${fundType === 'EmergencyFund' ? 'Emergency Fund' : 'Paid Leave Fund'}:`);
    const amount = amountStr ? parseFloat(amountStr) : NaN;

    if (isNaN(amount) || amount <= 0) {
      if (amountStr !== null && amountStr !== '') {
        alert("Please enter a valid positive amount.");
      }
      return;
    }

    setLoading(true);

    try {
      // POST to backend to add funds
      await apiFetch('/benefits/funds/add', {
        method: 'POST',
        body: JSON.stringify({ type: fundType, amount: amount }),
      });

      alert("Funds contributed successfully!");

      // Re-fetch funds to update UI with new balances
      await fetchFundBalances();

    } catch (err: any) {
      alert(`Contribution failed: ${err.message || "Server error."}`);
      console.error("Contribution error:", err);
    } finally {
      setLoading(false);
    }
  };


  // Filter and type assert data for specific sections
  const healthPlans = (catalog?.plans || []).filter(p => p.hasOwnProperty('price')) as Plan[];
  const retirementOptions = (catalog?.plans || []).filter(p => p.hasOwnProperty('amount')) as RetirementOption[];

  const emergencyFund = fundBalances?.find(f => f.type === 'EmergencyFund');
  const paidLeaveFund = fundBalances?.find(f => f.type === 'PaidLeaveFund');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#18141e] text-white px-0 items-center justify-center">
        Loading Benefits...
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="min-h-screen flex flex-col bg-[#18141e] text-red-400 px-0 items-center justify-center">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#18141e] text-white px-0">
      <main className="max-w-[1400px] mx-auto w-full px-6 pb-16">
        <div className="pt-10 pb-4 flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold">Benefits Navigator</h1>
          <p className="text-gray-300 mt-1 text-lg">
            Explore health insurance, retirement, and paid leave options.
          </p>
        </div>

        {/* Three Column Top Cards (Unchanged UI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-4">
          <BenefitCard
            icon=""
            title="Health Insurance"
            desc={`Find affordable health insurance plans designed for gig workers. We found ${healthPlans.length} options.`}
            highlight={`${healthPlans.length} plans recommended for you`}
            buttonText="Compare Plans"
          />
          <BenefitCard
            icon=""
            title="Retirement Planning"
            desc="Self-employed retirement options to secure your future."
            highlight={`${retirementOptions.length} self-employment options`}
            buttonText="Explore Options"
          />
          <BenefitCard
            icon=""
            title="Paid Leave Planning"
            desc="Plan and save for time off without losing income."
            highlight="Create a paid leave fund"
            buttonText="Start Planning"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#29253b] mt-10 mb-1">
          {tabData.map((t) => (
            <button
              key={t.value}
              className={`px-4 py-3 font-semibold text-sm transition-colors duration-200 ${tab === t.value
                  ? "text-[#b773f8] border-b-2 border-[#b773f8]"
                  : "text-gray-300"
                }`}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content - Pass fetched data to sections */}
        <div className="pt-4">
          {tab === "health" && <HealthInsuranceSection plans={healthPlans} />}
          {tab === "retirement" && <RetirementSection options={retirementOptions} />}
          {tab === "emergency" && <EmergencyFundSection
            emergencyFund={emergencyFund}
            paidLeaveFund={paidLeaveFund}
            handleContribute={handleContribute}
          />}
        </div>
      </main>
    </div>
  );
}

// Reusable components (Unchanged UI)
type BenefitCardProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  highlight: string;
  buttonText: string;
};

function BenefitCard({ icon, title, desc, highlight, buttonText }: BenefitCardProps) {
  return (
    <div className="bg-[#201c2c] rounded-xl p-7 shadow-lg flex flex-col gap-4">
      <div className="font-bold text-lg flex items-center gap-2 text-[#b773f8]">{icon} {title}</div>
      <p className="text-gray-300 text-sm">{desc}</p>
      <div className="py-1 px-3 bg-[#2b243a] text-[#b773f8] text-sm rounded font-bold w-max mb-2">{highlight}</div>
      <button className="bg-[#b773f8] p-2 rounded-md text-white font-semibold hover:bg-[#a65df6]">{buttonText}</button>
    </div>
  );
}


function HealthInsuranceSection({ plans }: { plans: Plan[] }) {
  // ... (unchanged)
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-bold text-lg">Recommended Insurance Plans</span>
        <button className="bg-[#221c2e] text-white px-4 py-2 rounded-md text-sm font-medium">
          Filter Options
        </button>
      </div>
      <div className="flex flex-col gap-5 w-full">
        {plans.length === 0 ? (
          <div className="text-gray-400 italic mt-4">No health plans found in the catalog.</div>
        ) : (
          plans.map((plan, i) => (
            <div
              key={i}
              className="bg-[#28223b] rounded-xl px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold text-lg">{plan.name}</div>
                <div className="text-gray-300 text-sm mb-2">{plan.desc || 'No description provided.'}</div>
                <div className="text-yellow-300 flex items-center gap-1 text-sm">
                  {plan.rating}
                  <span>★</span>
                  <span className="text-gray-400">({plan.reviews || 'N/A'} reviews)</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-[#b773f8] font-bold text-md">{plan.price}</div>
                <button className="bg-[#b773f8] text-black rounded-md px-4 py-2 text-sm font-semibold">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {plans.length > 0 && (
        <div className="flex justify-center mt-6">
          <button className="bg-[#b773f8] px-7 py-2 rounded-lg font-semibold text-black flex items-center gap-2">
            Browse All Plans <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}

function RetirementSection({ options }: { options: RetirementOption[] }) {
  // ... (unchanged)
  const content = (
    <div>
      <div className="bg-[#28223b] rounded-xl px-6 py-4 mb-4">
        <div className="flex items-center gap-2 mb-1 text-lg text-[#b773f8] font-bold">
          Why gig workers need retirement plans
        </div>
        <div className="text-gray-300 text-sm">
          Without employer-sponsored plans, it's essential to set up your own retirement savings strategy.
        </div>
      </div>

      {options.length === 0 ? (
        <div className="text-gray-400 italic mt-4">No retirement options found in the catalog.</div>
      ) : (
        options.map((r, idx) => (
          <div key={idx} className="bg-[#28223b] rounded-xl px-6 py-4 mb-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-lg mb-1">{r.name}</div>
              <div className="text-gray-300 text-sm">{r.desc}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-[#b773f8] font-bold">{r.amount}</div>
              <button className="bg-[#b773f8] text-white rounded-md px-4 py-2 text-sm font-semibold">
                Learn More
              </button>
            </div>
          </div>
        ))
      )}

      <div className="flex justify-center mt-4">
        <button className="bg-[#b773f8] px-7 py-2 rounded-lg font-semibold text-white w-full">Talk to a Retirement Specialist</button>
      </div>
    </div>
  );
  return content;
}

// Updated component signature
function EmergencyFundSection({ emergencyFund, paidLeaveFund, handleContribute }: {
  emergencyFund: FundBalance | undefined;
  paidLeaveFund: FundBalance | undefined;
  handleContribute: (type: FundBalance['type']) => void;
}) {
  const eFund = emergencyFund || { currentAmount: 0, goalAmount: 10000 };
  const pFund = paidLeaveFund || { currentAmount: 0, goalAmount: 5000 };

  const ePercent = Math.min(100, (eFund.currentAmount / eFund.goalAmount) * 100);
  const pPercent = Math.min(100, (pFund.currentAmount / pFund.goalAmount) * 100);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#28223b] rounded-xl px-6 py-6 flex flex-col">
          <span className="text-lg font-bold mb-3">Emergency Fund</span>
          <span className="text-2xl font-extrabold mb-1">{formatCurrency(eFund.currentAmount)}</span>
          <span className="text-gray-400 text-sm mb-2">of {formatCurrency(eFund.goalAmount)} goal</span>
          <div className="h-3 w-full rounded bg-[#392955] mb-2">
            <div className="h-3 rounded bg-[#b773f8]" style={{ width: `${ePercent}%` }} />
          </div>
          <span className="text-[#b773f8] self-end font-bold">{Math.round(ePercent)}%</span>
          <button
            className="bg-[#b773f8] mt-4 py-2 rounded-md text-white"
            onClick={() => handleContribute('EmergencyFund')}
          >
            Add Funds
          </button>
        </div>
        <div className="bg-[#28223b] rounded-xl px-6 py-6 flex flex-col">
          <span className="text-lg font-bold mb-3">Paid Leave Fund</span>
          <span className="text-2xl font-extrabold mb-1">{formatCurrency(pFund.currentAmount)}</span>
          <span className="text-gray-400 text-sm mb-2">of {formatCurrency(pFund.goalAmount)} goal</span>
          <div className="h-3 w-full rounded bg-[#392955] mb-2">
            <div className="h-3 rounded bg-[#b773f8]" style={{ width: `${pPercent}%` }} />
          </div>
          <span className="text-[#b773f8] self-end font-bold">{Math.round(pPercent)}%</span>
          <button
            className="bg-[#b773f8] mt-4 py-2 rounded-md text-white"
            onClick={() => handleContribute('PaidLeaveFund')}
          >
            Add Funds
          </button>
        </div>
      </div>
      {/* Calculator */}
      <div className="mt-6 bg-[#28223b] rounded-xl px-6 py-6">
        <div className="font-bold mb-2">Emergency Fund Calculator</div>
        <div className="text-gray-300 text-sm mb-3">
          Our calculator helps you determine how much to save based on your monthly expenses.
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <div className="flex-1">
            <label className="block text-sm mb-1 text-gray-400">Monthly Expenses</label>
            <div className="bg-[#18141e] py-2 px-4 rounded text-white">₹3,000</div>
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1 text-gray-400">Months of Coverage</label>
            <div className="bg-[#18141e] py-2 px-4 rounded text-white">3 months</div>
          </div>
        </div>
        <button className="w-full bg-[#b773f8] mt-4 py-3 rounded-lg text-white font-semibold">
          Calculate Needs
        </button>
      </div>
    </div>
  );
}