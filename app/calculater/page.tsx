'use client';
import React, { useState } from "react";

type Tab = 'hourly' | 'project';

export default function RateCalculatorPage() {
  const [tab, setTab] = useState<Tab>('hourly');

  return (
    <div className="min-h-screen bg-[#18141e] text-white px-0">
      <main className="max-w-[1400px] mx-auto w-full px-6 pb-16">
        {/* Header */}
        <div className="pt-10 pb-4 flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold">Rate Calculator</h1>
          <p className="text-gray-300 mt-1 text-lg">
            Calculate your ideal rates for hourly work or project-based gigs.
          </p>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-[#29253b] mt-7 mb-5">
          <button
            onClick={() => setTab('hourly')}
            className={`px-6 py-3 font-bold text-sm ${
              tab === 'hourly'
                ? 'text-[#b773f8] border-b-2 border-[#b773f8]'
                : 'text-gray-300'
            }`}
          >
            Hourly Rate
          </button>
          <button
            onClick={() => setTab('project')}
            className={`px-6 py-3 font-bold text-sm ${
              tab === 'project'
                ? 'text-[#b773f8] border-b-2 border-[#b773f8]'
                : 'text-gray-300'
            }`}
          >
            Project Rate
          </button>
        </div>
        {/* Calculators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-5">
          {tab === "hourly" ? <HourlyCalculator /> : <ProjectCalculator />}
        </div>

        {/* Rates by Field - This appears below */}
        <div className="mt-14">
          <RatesByField />
        </div>
      </main>
    </div>
  );
}

/* ---- Calculator Components Below ---- */

// HOURLY CALCULATOR
function HourlyCalculator() {
  const [salary, setSalary] = useState('');
  const [expenses, setExpenses] = useState('');
  const [vacation, setVacation] = useState('');
  const [profit, setProfit] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  function calcHourly(e: React.FormEvent) {
    e.preventDefault();
    const annual = parseFloat(salary);
    const expense = parseFloat(expenses);
    const vac = parseFloat(vacation) || 0;
    const pm = parseFloat(profit) || 0;
    if (!annual || !expense) { setErr('Please fill all required fields'); setResult(null); return; }
    const workingDays = 260 - (vac || 0);
    const workingHoursYear = workingDays * 8;
    const need = annual + expense;
    const gross = need / (1 - pm / 100);
    const rate = gross / workingHoursYear;
    setResult(rate);
    setErr('');
    setDetails({
      annual,
      expense,
      profit: pm,
      days: workingDays,
      hours: workingHoursYear,
      gross: Math.round(gross),
    });
  }

  function resetForm() {
    setSalary(''); setExpenses(''); setVacation(''); setProfit('');
    setResult(null); setDetails(null); setErr('');
  }

  return (
    <>
      <form className="bg-[#201c2c] rounded-xl p-7 shadow-lg flex flex-col gap-4" onSubmit={calcHourly}>
        <div className="font-bold text-lg mb-2">Hourly Rate Calculator</div>
        <div className="text-gray-400 text-sm mb-3">Calculate a sustainable hourly rate based on your financial goals</div>
        <label className="text-sm">Desired Annual Salary (₹)</label>
        <input className="mb-2 bg-[#18141e] rounded p-3 text-white" type="number" min="0" value={salary} onChange={e => setSalary(e.target.value)} required />
        <label className="text-sm">Annual Business Expenses (₹)</label>
        <input className="mb-2 bg-[#18141e] rounded p-3 text-white" type="number" min="0" value={expenses} onChange={e => setExpenses(e.target.value)} required />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm">Vacation Days/Year</label>
            <input className="bg-[#18141e] rounded p-3 text-white w-full" type="number" min="0" value={vacation} onChange={e => setVacation(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="text-sm">Profit Margin %</label>
            <input className="bg-[#18141e] rounded p-3 text-white w-full" type="number" min="0" value={profit} onChange={e => setProfit(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={resetForm} className="flex-1 bg-[#28223b] rounded-lg py-2 font-semibold text-white hover:bg-[#392955]">Reset</button>
          <button type="submit" className="flex-1 bg-[#b773f8] rounded-lg py-2 font-semibold text-white hover:bg-[#a65df6]">Calculate</button>
        </div>
      </form>
      <HourlyResults result={result} details={details} err={err} />
    </>
  );
}

type HourlyResultsProps = {
  result: number | null;
  details: any;
  err: string;
};
function HourlyResults({ result, details, err }: HourlyResultsProps){
  return (
    <div className="bg-[#201c2c] rounded-xl p-7 shadow-lg flex flex-col h-full">
      <div className="font-bold text-lg mb-2">Your Results</div>
      {!result && !err && (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-center">
          <div>
            <div className="w-14 h-14 mx-auto mb-2 bg-[#29253b] rounded-full flex items-center justify-center text-3xl">🧮</div>
            No Calculation Yet<br />
            <span className="text-gray-500 text-sm">Fill in the details and click Calculate to see your recommended hourly rate</span>
          </div>
        </div>
      )}
      {err && (
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="text-red-400 mt-3">{err}</div>
        </div>
      )}
      {result && (
        <>
          <div className="mb-5 mt-3">
            <div className="bg-[#b773f8] px-8 py-4 rounded-lg text-center">
              <div className="text-gray-200 font-semibold mb-1">Recommended Hourly Rate</div>
              <div className="text-4xl font-extrabold">₹{result.toFixed(2)} </div>
              <div className="text-sm mt-2">per hour</div>
            </div>
          </div>
          <div className="text-white/90 font-semibold mb-2">Rate Breakdown</div>
          <div className="text-sm grid grid-cols-2 gap-y-1 gap-x-3">
            <div>Desired Annual Salary:</div>
            <div>₹{details.annual}</div>
            <div>Annual Expenses:</div>
            <div>₹{details.expense}</div>
            <div>Profit Margin:</div>
            <div>{details.profit}%</div>
            <div>Working Days/Year:</div>
            <div>{details.days} days</div>
            <div>Working Hours/Year:</div>
            <div>{details.hours} hours</div>
          </div>
          <div className="text-xs text-gray-400 mt-4">
            This rate ensures you meet your annual income goal of ₹{details.annual} with ₹{details.expense} in expenses and {details.profit}% profit margin.
          </div>
          <button className="bg-[#29253b] rounded-lg py-3 font-semibold text-gray-200 mt-5 w-full hover:bg-[#413167] transition">Download Results</button>
        </>
      )}
    </div>
  );
}

// PROJECT CALCULATOR
function ProjectCalculator() {
  const [hourly, setHourly] = useState('');
  const [hours, setHours] = useState('');
  const [complexity, setComplexity] = useState('1');
  const [expenses, setExpenses] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [info, setInfo] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  function calcProject(e: React.FormEvent) {
    e.preventDefault();
    const base = parseFloat(hourly);
    const hrs = parseFloat(hours);
    const cplxNum = parseFloat(complexity);
    const extra = parseFloat(expenses) || 0;
    if (!base || !hrs) { setErr('Please fill all required fields'); setResult(null); return; }
    const fee = (base * hrs * cplxNum) + extra;
    setResult(fee);
    setErr('');
    setInfo({
      rate: base,
      hrs,
      cplx: cplxNum,
      extra,
    });
  }

  function reset() {
    setHourly(''); setHours(''); setComplexity('1'); setExpenses('');
    setResult(null); setInfo(null); setErr('');
  }

  return (
    <>
      <form className="bg-[#201c2c] rounded-xl p-7 shadow-lg flex flex-col gap-4" onSubmit={calcProject}>
        <div className="font-bold text-lg mb-2">Project Rate Calculator</div>
        <div className="text-gray-400 text-sm mb-3">Calculate a fair project rate based on time and complexity</div>
        <label className="text-sm">Your Base Hourly Rate (₹)</label>
        <input className="mb-2 bg-[#18141e] rounded p-3 text-white" type="number" min="0" value={hourly} onChange={e => setHourly(e.target.value)} required />
        <label className="text-sm">Estimated Project Hours</label>
        <input className="mb-2 bg-[#18141e] rounded p-3 text-white" type="number" min="1" value={hours} onChange={e => setHours(e.target.value)} required />
        <div className="mb-2">
          <label className="block text-sm mb-1">Project Complexity</label>
          <div className="flex gap-6 text-sm">
            <label><input type="radio" name="cplx" value="1" checked={complexity === "1"} onChange={e => setComplexity(e.target.value)} /> Standard (1x)</label>
            <label><input type="radio" name="cplx" value="1.25" checked={complexity === "1.25"} onChange={e => setComplexity(e.target.value)} /> Complex (1.25x)</label>
            <label><input type="radio" name="cplx" value="1.5" checked={complexity === "1.5"} onChange={e => setComplexity(e.target.value)} /> Highly Complex (1.5x)</label>
          </div>
        </div>
        <label className="text-sm">Additional Expenses (₹)</label>
        <input className="mb-2 bg-[#18141e] rounded p-3 text-white" type="number" min="0" value={expenses} onChange={e => setExpenses(e.target.value)} />
        <div className="text-xs text-gray-400 mb-2">Include any software, tools, or services for this project.</div>
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={reset} className="flex-1 bg-[#28223b] rounded-lg py-2 font-semibold text-white hover:bg-[#392955]">Reset</button>
          <button type="submit" className="flex-1 bg-[#b773f8] rounded-lg py-2 font-semibold text-white hover:bg-[#a65df6]">Calculate</button>
        </div>
      </form>
      <ProjectResults result={result} info={info} err={err} />
    </>
  );
}

type ProjectResultsProps = {
  result: number | null;
  info: any;
  err: string;
};
function ProjectResults({ result, info, err }: ProjectResultsProps) {
  return (
    <div className="bg-[#201c2c] rounded-xl p-7 shadow-lg flex flex-col h-full">
      <div className="font-bold text-lg mb-2">Your Results</div>
      {!result && !err && (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-center">
          <div>
            <div className="w-14 h-14 mx-auto mb-2 bg-[#29253b] rounded-full flex items-center justify-center text-3xl">🧮</div>
            No Calculation Yet<br />
            <span className="text-gray-500 text-sm">Fill in the details and click Calculate to see your recommended project rate</span>
          </div>
        </div>
      )}
      {err && (
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="text-red-400 mt-3">{err}</div>
        </div>
      )}
      {result && (
        <>
          <div className="mb-5 mt-3">
            <div className="bg-[#b773f8] px-8 py-4 rounded-lg text-center">
              <div className="text-gray-200 font-semibold mb-1">Recommended Project Rate</div>
              <div className="text-4xl font-extrabold">₹{result.toFixed(0)}</div>
              <div className="text-sm mt-2">flat fee</div>
            </div>
          </div>
          <div className="text-white/90 font-semibold mb-2">Rate Breakdown</div>
          <div className="text-sm grid grid-cols-2 gap-y-1 gap-x-3">
            <div>Base Hourly Rate:</div>
            <div>₹{info.rate}</div>
            <div>Estimated Hours:</div>
            <div>{info.hrs} hours</div>
            <div>Complexity Multiplier:</div>
            <div>{info.cplx}x</div>
            <div>Additional Expenses:</div>
            <div>₹{info.extra}</div>
          </div>
          <div className="text-xs text-gray-400 mt-4">
            This project rate is based on {info.hrs} hours at your hourly rate of ₹{info.rate}, adjusted for complexity and additional expenses.
          </div>
          <button className="bg-[#29253b] rounded-lg py-3 font-semibold text-gray-200 mt-5 w-full hover:bg-[#413167] transition">Download Results</button>
        </>
      )}
    </div>
  );
}

/* ---- Benchmarks Deck Below ---- */
function RatesByField() {
  const FIELDS = [
    {
      name: "Web Development",
      rates: [
        { label: "Beginner", range: "₹600–1,800" },
        { label: "Intermediate", range: "₹1,800–3,600" },
        { label: "Expert", range: "₹3,600–7,000+" },
      ],
    },
    {
      name: "Graphic Design",
      rates: [
        { label: "Beginner", range: "₹500–1,300" },
        { label: "Intermediate", range: "₹1,800–4,300" },
        { label: "Expert", range: "₹5,500–12,000+" },
      ],
    },
    {
      name: "Content Writing",
      rates: [
        { label: "Beginner", range: "₹400–900" },
        { label: "Intermediate", range: "₹1,000–2,500" },
        { label: "Expert", range: "₹2,500–6,000+" },
      ],
    },
    {
      name: "Digital Marketing",
      rates: [
        { label: "Beginner", range: "₹600–1,300" },
        { label: "Intermediate", range: "₹1,600–3,400" },
        { label: "Expert", range: "₹3,500–7,000+" },
      ],
    },
    {
      name: "Video Editing",
      rates: [
        { label: "Beginner", range: "₹600–1,700" },
        { label: "Intermediate", range: "₹1,800–3,800" },
        { label: "Expert", range: "₹3,900–8,500+" },
      ],
    },
    {
      name: "Virtual Assistant",
      rates: [
        { label: "Beginner", range: "₹400–1,000" },
        { label: "Intermediate", range: "₹1,100–2,000" },
        { label: "Expert", range: "₹2,100–3,500+" },
      ],
    },
  ];
  return (
    <div className="bg-[#201c2c] text-white rounded-xl shadow-lg p-7">
      <div className="text-xl font-bold">Common Hourly Rates by Field</div>
      <div className="text-gray-400 mb-5">
        Industry benchmarks to help you price your services competitively
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {FIELDS.map((field, idx) => (
          <div key={idx} className="bg-[#18141e] rounded-xl p-5 flex flex-col gap-2 border border-[#28223b]">
            <div className="font-semibold text-lg mb-1">{field.name}</div>
            {field.rates.map((rt, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className={i === 0 ? "text-gray-400" : i === 1 ? "text-[#b773f8]" : "font-bold"}>
                  {rt.label}
                </span>
                <span>{rt.range}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
