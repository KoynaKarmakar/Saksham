// 'use client';
// import React from 'react';
// import { Bar, Pie, Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   PointElement,
//   LineElement,
//   Title,
// } from 'chart.js';

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   PointElement,
//   LineElement,
//   Title
// );



// export default function FinancialPage() {
//   return (
//     <div className="flex min-h-screen flex-col bg-[#18141e] text-white px-0">
//       <main className="max-w-[1400px] mx-auto w-full px-8 pb-16">
//         {/* Page Header */}
//         <div className="pt-10 pb-4 flex flex-col gap-2">
//           <h1 className="text-4xl font-extrabold">Financial Management</h1>
//           <p className="text-gray-300 mt-1 text-lg">Track your income, expenses, and manage your taxes.</p>
//         </div>

//         {/* Top Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
//           <Card
//             title="Total Income"
//             value="$18,245.50"
//             change="+12.5% from last month"
//             changeColor="text-green-400"
//           />
//           <Card
//             title="Total Expenses"
//             value="$5,386.27"
//             change="+8.2% from last month"
//             changeColor="text-red-400"
//           />
//           <Card
//             title="Net Profit"
//             value="$12,859.23"
//             change="+14.3% from last month"
//             changeColor="text-green-400"
//           />
//         </div>

//         {/* Filters and Add */}
//         <div className="flex flex-row gap-3 pt-7 pb-4">
//           <button className="bg-[#221c2e] px-4 py-2 rounded-lg text-white text-sm font-medium">Filter</button>
//           <button className="bg-[#221c2e] px-4 py-2 rounded-lg text-white text-sm font-medium">Export</button>
//           <button className="bg-[#b773f8] px-4 py-2 rounded-lg text-white text-sm font-semibold">+ Add Transaction</button>
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-7 pt-2">
//           <div className="bg-[#201c2c] rounded-xl p-7 shadow-lg">
//             <div className="flex justify-between pb-3">
//               <span className="font-bold text-lg text-white">Income & Expenses</span>
//               <button className="bg-[#221c2e] px-3 py-1 rounded-lg text-sm">Filter</button>
//             </div>
//             {/* Chart goes here */}
//             <IncomeExpensesBarChart />
//           </div>
//           <div className="bg-[#201c2c] rounded-xl p-7 shadow-lg">
//             <div className="flex justify-between pb-3">
//               <span className="font-bold text-lg text-white">Expense Breakdown</span>
//             </div>
//             {/* Pie chart goes here */}
//             <ExpensePieChart />
//           </div>
//         </div>

//         {/* Income Trend */}
//         <div className="bg-[#201c2c] rounded-xl p-7 mt-7 shadow-lg">
//           <span className="font-bold text-lg mb-2 block">Income Trend</span>
//           <IncomeTrendChart />
//         </div>

//         {/* Tax Estimation and Details */}
//         <div className="bg-[#201c2c] rounded-xl p-7 mt-7 shadow-lg">
//           <span className="font-bold text-lg mb-2 block">Tax Estimation</span>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
//             <TaxItem title="Estimated Tax Due" amount="$3,658.45" desc="Based on current income" />
//             <TaxItem title="Tax Deductions" amount="$1,874.22" desc="Potential savings found" />
//             <TaxItem title="Next Quarterly Due" amount="Apr 15, 2023" desc="45 days remaining" />
//           </div>
//           <button className="w-full bg-[#b773f8] mt-5 py-3 rounded-lg text-center text-white font-semibold">
//             Run Detailed Tax Analysis
//           </button>
//         </div>

//         {/* Recent Transactions */}
//         <div className="bg-[#201c2c] rounded-xl p-7 mt-7 shadow-lg">
//           <div className="flex justify-between items-center mb-3">
//             <span className="font-bold text-lg">Recent Transactions</span>
//             <button className="bg-[#221c2e] px-3 py-1 rounded-lg text-sm">View All</button>
//           </div>
//           <div className="flex flex-col gap-4">
//             <TransactionItem name="Website Design Project" date="Mar 15, 2023" value="+$1200.00" type="income" />
//             <TransactionItem name="Software Subscription" date="Mar 12, 2023" value="-$49.99" type="expense" />
//             <TransactionItem name="Logo Design" date="Mar 10, 2023" value="+$350.00" type="income" />
//             <TransactionItem name="Office Supplies" date="Mar 8, 2023" value="-$85.75" type="expense" />
//             <TransactionItem name="Consulting Fee" date="Mar 5, 2023" value="+$800.00" type="income" />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// // Reusable components for Cards, Tax Items, Transactions
// function Card({ title, value, change, changeColor }: any) {
//   return (
//     <div className="bg-[#201c2c] rounded-xl p-8 flex flex-col shadow-lg">
//       <span className="text-lg font-semibold text-gray-300 mb-1">{title}</span>
//       <span className="text-3xl font-extrabold mb-2 text-white">{value}</span>
//       <span className={`text-sm font-semibold ${changeColor}`}>{change}</span>
//     </div>
//   );
// }

// function TaxItem({ title, amount, desc }: any) {
//   return (
//     <div>
//       <span className="text-md font-bold">{title}</span>
//       <div className="text-2xl font-semibold text-white">{amount}</div>
//       <div className="text-sm text-gray-400">{desc}</div>
//     </div>
//   );
// }

// function TransactionItem({ name, date, value, type }: any) {
//   return (
//     <div className="flex items-center justify-between">
//       <div>
//         <span className="font-semibold">{name}</span>
//         <span className="block text-xs text-gray-400">{date}</span>
//       </div>
//       <span className={`font-bold text-lg ${type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
//         {value}
//       </span>
//     </div>
//   );
// }

// // Bar chart for Income & Expenses
// function IncomeExpensesBarChart() {
//   const data = {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//     datasets: [
//       {
//         label: 'Income',
//         backgroundColor: '#b772f8',
//         data: [3200, 4300, 3800, 4500, 4100, 4700],
//         borderRadius: 6,
//         barThickness: 24,
//       },
//       {
//         label: 'Expenses',
//         backgroundColor: '#96e6b3',
//         data: [1500, 2100, 1800, 2200, 2000, 2400],
//         borderRadius: 6,
//         barThickness: 24,
//       },
//       {
//         label: 'Profit',
//         backgroundColor: '#ffe485',
//         data: [1700, 2200, 2000, 2300, 2100, 2300],
//         borderRadius: 6,
//         barThickness: 24,
//       },
//     ],
//   };
//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: true,
//         position: 'top' as const,
//         labels: { color: '#fff', font: { size: 14 } },
//       },
//     },
//     scales: {
//       x: { ticks: { color: '#aaa' }, grid: { color: '#392955' } },
//       y: { ticks: { color: '#aaa' }, grid: { color: '#392955' }, beginAtZero: true },
//     },
//   };
//   return <div className="h-60"><Bar data={data} options={options} /></div>;
// }

// // Expense Breakdown Pie Chart
// function ExpensePieChart() {
//   const data = {
//     labels: ['Software', 'Marketing', 'Office', 'Travel', 'Other'],
//     datasets: [
//       {
//         data: [36, 25, 19, 13, 7],
//         backgroundColor: ['#b773f8', '#96e6b3', '#ffc46b', '#629ad7', '#394152'],
//         borderColor: '#18141e',
//         borderWidth: 2,
//       },
//     ],
//   };
//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: true,
//         position: 'right' as const,
//         labels: { color: '#fff', font: { size: 13 } },
//       },
//     },
//   };
//   return <div className="h-52"><Pie data={data} options={options} /></div>;
// }

// // Income Trend Line/Area Chart
// function IncomeTrendChart() {
//   const data = {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//     datasets: [
//       {
//         label: 'Income',
//         fill: true,
//         data: [3200, 3500, 4100, 4200, 4550, 4900],
//         backgroundColor: 'rgba(183, 115, 248, 0.2)',
//         borderColor: '#b773f8',
//         tension: 0.4,
//       },
//     ],
//   };
//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: false },
//     },
//     scales: {
//       x: { ticks: { color: '#aaa' }, grid: { color: '#392955' } },
//       y: { ticks: { color: '#aaa' }, grid: { color: '#392955' }, beginAtZero: true },
//     },
//   };
//   return <div className="h-40"><Line data={data} options={options} /></div>;
// }







'use client';
import React from 'react';
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



export default function FinancialPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#18141e] text-white px-0">
      <main className="max-w-[1400px] mx-auto w-full px-8 pb-16">
        {/* Page Header */}
        <div className="pt-10 pb-4 flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold">Financial Management</h1>
          <p className="text-gray-300 mt-1 text-lg">Track your income, expenses, and manage your taxes.</p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
          <Card
            title="Total Income"
            value="₹18,245.50" // Updated to ₹
            change="+12.5% from last month"
            changeColor="text-green-400"
          />
          <Card
            title="Total Expenses"
            value="₹5,386.27" // Updated to ₹
            change="+8.2% from last month"
            changeColor="text-red-400"
          />
          <Card
            title="Net Profit"
            value="₹12,859.23" // Updated to ₹
            change="+14.3% from last month"
            changeColor="text-green-400"
          />
        </div>

        {/* Filters and Add */}
        <div className="flex flex-row gap-3 pt-7 pb-4">
          <button className="bg-[#221c2e] px-4 py-2 rounded-lg text-white text-sm font-medium">Filter</button>
          <button className="bg-[#221c2e] px-4 py-2 rounded-lg text-white text-sm font-medium">Export</button>
          <button className="bg-[#b773f8] px-4 py-2 rounded-lg text-white text-sm font-semibold">+ Add Transaction</button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 pt-2">
          <div className="bg-[#201c2c] rounded-xl p-7 shadow-lg">
            <div className="flex justify-between pb-3">
              <span className="font-bold text-lg text-white">Income & Expenses</span>
              <button className="bg-[#221c2e] px-3 py-1 rounded-lg text-sm">Filter</button>
            </div>
            {/* Chart goes here */}
            <IncomeExpensesBarChart />
          </div>
          <div className="bg-[#201c2c] rounded-xl p-7 shadow-lg">
            <div className="flex justify-between pb-3">
              <span className="font-bold text-lg text-white">Expense Breakdown</span>
            </div>
            {/* Pie chart goes here */}
            <ExpensePieChart />
          </div>
        </div>

        {/* Income Trend */}
        <div className="bg-[#201c2c] rounded-xl p-7 mt-7 shadow-lg">
          <span className="font-bold text-lg mb-2 block">Income Trend</span>
          <IncomeTrendChart />
        </div>

        {/* Tax Estimation and Details */}
        <div className="bg-[#201c2c] rounded-xl p-7 mt-7 shadow-lg">
          <span className="font-bold text-lg mb-2 block">Tax Estimation</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <TaxItem title="Estimated Tax Due" amount="₹3,658.45" desc="Based on current income" /> {/* Updated to ₹ */}
            <TaxItem title="Tax Deductions" amount="₹1,874.22" desc="Potential savings found" /> {/* Updated to ₹ */}
            <TaxItem title="Next Quarterly Due" amount="Apr 15, 2023" desc="45 days remaining" />
          </div>
          <button className="w-full bg-[#b773f8] mt-5 py-3 rounded-lg text-center text-white font-semibold">
            Run Detailed Tax Analysis
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#201c2c] rounded-xl p-7 mt-7 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-lg">Recent Transactions</span>
            <button className="bg-[#221c2e] px-3 py-1 rounded-lg text-sm">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            <TransactionItem name="Website Design Project" date="Mar 15, 2023" value="+₹1200.00" type="income" /> {/* Updated to ₹ */}
            <TransactionItem name="Software Subscription" date="Mar 12, 2023" value="-₹49.99" type="expense" /> {/* Updated to ₹ */}
            <TransactionItem name="Logo Design" date="Mar 10, 2023" value="+₹350.00" type="income" /> {/* Updated to ₹ */}
            <TransactionItem name="Office Supplies" date="Mar 8, 2023" value="-₹85.75" type="expense" /> {/* Updated to ₹ */}
            <TransactionItem name="Consulting Fee" date="Mar 5, 2023" value="+₹800.00" type="income" /> {/* Updated to ₹ */}
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable components for Cards, Tax Items, Transactions
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

// Bar chart for Income & Expenses
function IncomeExpensesBarChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        backgroundColor: '#b772f8',
        data: [3200, 4300, 3800, 4500, 4100, 4700],
        borderRadius: 6,
        barThickness: 24,
      },
      {
        label: 'Expenses',
        backgroundColor: '#96e6b3',
        data: [1500, 2100, 1800, 2200, 2000, 2400],
        borderRadius: 6,
        barThickness: 24,
      },
      {
        label: 'Profit',
        backgroundColor: '#ffe485',
        data: [1700, 2200, 2000, 2300, 2100, 2300],
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };
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
  return <div className="h-60"><Bar data={data} options={options} /></div>;
}

// Expense Breakdown Pie Chart
function ExpensePieChart() {
  const data = {
    labels: ['Software', 'Marketing', 'Office', 'Travel', 'Other'],
    datasets: [
      {
        data: [36, 25, 19, 13, 7],
        backgroundColor: ['#b773f8', '#96e6b3', '#ffc46b', '#629ad7', '#394152'],
        borderColor: '#18141e',
        borderWidth: 2,
      },
    ],
  };
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
  return <div className="h-52"><Pie data={data} options={options} /></div>;
}

// Income Trend Line/Area Chart
function IncomeTrendChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        fill: true,
        data: [3200, 3500, 4100, 4200, 4550, 4900],
        backgroundColor: 'rgba(183, 115, 248, 0.2)',
        borderColor: '#b773f8',
        tension: 0.4,
      },
    ],
  };
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
  return <div className="h-40"><Line data={data} options={options} /></div>;
}