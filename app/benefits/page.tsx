'use client';
import React, { useState } from "react";

const tabData = [
  { label: "Health Insurance", value: "health" },
  { label: "Retirement Options", value: "retirement" },
  { label: "Emergency Fund", value: "emergency" },
];

export default function BenefitsPage() {
  const [tab, setTab] = useState("health");

  return (
    <div className="flex min-h-screen flex-col bg-[#18141e] text-white px-0">
      <main className="max-w-[1400px] mx-auto w-full px-6 pb-16">
        <div className="pt-10 pb-4 flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold">Benefits Navigator</h1>
          <p className="text-gray-300 mt-1 text-lg">
            Explore health insurance, retirement, and paid leave options.
          </p>
        </div>

        {/* Three Column Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-4">
          <BenefitCard
            icon=""
            title="Health Insurance"
            desc="Find affordable health insurance plans designed for gig workers."
            highlight="5 plans recommended for you"
            buttonText="Compare Plans"
          />
          <BenefitCard
            icon=""
            title="Retirement Planning"
            desc="Self-employed retirement options to secure your future."
            highlight="SEP IRA and Solo 401(k) options"
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
              className={`px-4 py-3 font-semibold text-sm transition-colors duration-200 ${
                tab === t.value
                  ? "text-[#b773f8] border-b-2 border-[#b773f8]"
                  : "text-gray-300"
              }`}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          {tab === "health" && <HealthInsuranceSection />}
          {tab === "retirement" && <RetirementSection />}
          {tab === "emergency" && <EmergencyFundSection />}
        </div>
      </main>
    </div>
  );
}

/* --- Components Below --- */

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


function HealthInsuranceSection() {
  // Dummy plans as array
  const plans = [
    {
      name: "Basic Health Plan",
      desc: "Basic coverage for essential health needs",
      price: "₹250/month",
      rating: 4.2,
      reviews: 128,
    },
    {
      name: "Standard Health Plan",
      desc: "Comprehensive coverage with dental options",
      price: "₹350/month",
      rating: 4.5,
      reviews: 128,
    },
    {
      name: "Premium Health Plan",
      desc: "Full coverage including vision and specialists",
      price: "₹450/month",
      rating: 4.8,
      reviews: 128,
    },
  ];

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-bold text-lg">Recommended Insurance Plans</span>
        <button className="bg-[#221c2e] text-white px-4 py-2 rounded-md text-sm font-medium">
          Filter Options
        </button>
      </div>
      <div className="flex flex-col gap-5 w-full">
        {plans.map((plan, i) => (
          <div
            key={i}
            className="bg-[#28223b] rounded-xl px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold text-lg">{plan.name}</div>
              <div className="text-gray-300 text-sm mb-2">{plan.desc}</div>
              <div className="text-yellow-300 flex items-center gap-1 text-sm">
                {plan.rating}
                <span>★</span>
                <span className="text-gray-400">({plan.reviews} reviews)</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-[#b773f8] font-bold text-md">{plan.price}</div>
              <button className="bg-[#b773f8] text-black rounded-md px-4 py-2 text-sm font-semibold">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <button className="bg-[#b773f8] px-7 py-2 rounded-lg font-semibold text-black flex items-center gap-2">
          Browse All Plans <span>→</span>
        </button>
      </div>
    </div>
  );
}

function RetirementSection() {
  const options = [
    {
      name: "Solo 401(k)",
      desc: "High contribution limits, good for high earners",
      amount: "₹66,000/year",
    },
    {
      name: "SEP IRA",
      desc: "Simple to set up, flexible contributions",
      amount: "25% of net income",
    },
    {
      name: "Traditional/Roth IRA",
      desc: "Lower limits but easy to start",
      amount: "₹6,500/year",
    },
  ];
  return (
    <div>
      <div className="bg-[#28223b] rounded-xl px-6 py-4 mb-4">
        <div className="flex items-center gap-2 mb-1 text-lg text-[#b773f8] font-bold">
          Why gig workers need retirement plans
        </div>
        <div className="text-gray-300 text-sm">
          Without employer-sponsored plans, it's essential to set up your own retirement savings strategy.
        </div>
      </div>
      {options.map((r, idx) => (
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
      ))}
      <div className="flex justify-center mt-4">
        <button className="bg-[#b773f8] px-7 py-2 rounded-lg font-semibold text-white w-full">Talk to a Retirement Specialist</button>
      </div>
    </div>
  );
}

function EmergencyFundSection() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#28223b] rounded-xl px-6 py-6 flex flex-col">
          <span className="text-lg font-bold mb-3">Emergency Fund</span>
          <span className="text-2xl font-extrabold mb-1">₹3,500</span>
          <span className="text-gray-400 text-sm mb-2">of ₹10,000 goal</span>
          <div className="h-3 w-full rounded bg-[#392955] mb-2">
            <div className="h-3 rounded bg-[#b773f8]" style={{width: "35%"}} />
          </div>
          <span className="text-[#b773f8] self-end font-bold">35%</span>
          <button className="bg-[#b773f8] mt-4 py-2 rounded-md text-white">Add Funds</button>
        </div>
        <div className="bg-[#28223b] rounded-xl px-6 py-6 flex flex-col">
          <span className="text-lg font-bold mb-3">Paid Leave Fund</span>
          <span className="text-2xl font-extrabold mb-1">₹1,200</span>
          <span className="text-gray-400 text-sm mb-2">of ₹5,000 goal</span>
          <div className="h-3 w-full rounded bg-[#392955] mb-2">
            <div className="h-3 rounded bg-[#b773f8]" style={{width: "24%"}} />
          </div>
          <span className="text-[#b773f8] self-end font-bold">24%</span>
          <button className="bg-[#b773f8] mt-4 py-2 rounded-md text-white">Add Funds</button>
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