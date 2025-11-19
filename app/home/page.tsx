// app/home/page.tsx

'use client';
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function HomePage() {
  const { user } = useAuth();
  const userName = user?.name || 'Buddy'; // Use 'Buddy' as fallback

  return (
    <div className="flex min-h-screen flex-col bg-[#19151e] text-white items-center">
      <header className="w-full py-8 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-3 text-[#b773f8]">Hey, {userName}</h1>
        <p className="text-xl text-gray-400 mb-6 text-center max-w-2xl">Here’s your activity summary and tools to manage your gigs efficiently.</p>
        <button className="bg-purple-600 hover:bg-purple-700 px-8 py-2 rounded-xl font-bold mb-4 curosr-pointer">Settings</button>
      </header>
      <main className="flex flex-col items-center w-full px-2 pb-8">
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-9 w-full max-w-5xl px-2">
          <FeatureCard title="Financial Management" desc="Track your income, expenses, and savings with real-time insights to help you plan and manage your finances efficiently." />
          <FeatureCard title="Benefits Navigator" desc="Explore and manage gig-related benefits such as insurance, wellness programs, and rewards tailored to your work profile." />
          <FeatureCard title="Rate Calculator" desc="Calculate fair rates for your services by comparing market averages, workload, & client budget to ensure fair compensation." />
          <FeatureCard title="Client Management" desc="Keep all client details organized, manage ongoing projects, track communication, and monitor payment history seamlessly." />
          <FeatureCard title="Networking Hub" desc="Connect with fellow gig workers, share experiences, find collaborations, and grow your professional network." />
          <FeatureCard title="Productivity Tools" desc="Access built-in utilities like task planners, timers, and reminders to boost productivity and stay on top of daily goals." />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-[#161825] rounded-xl p-7 text-white shadow-lg border border-gray-800">
      <div className="font-bold text-lg mb-2 text-center" style={{ color: '#b773f8' }}>{title}</div>
      <div className="text-[#9f9aa7] text-mb text-center">{desc}</div>
    </div>
  );
}