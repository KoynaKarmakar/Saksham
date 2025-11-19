import Image from "next/image";
import Link from "next/link";


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#19151e] text-white items-center">
      {/* <header className="w-full p-6 flex items-center justify-between">
        <div className="flex items-center text-purple-400 font-bold text-2xl">Saksham</div>
        <Link href="/signup">
          <button className="bg-purple-600 px-5 py-2 rounded-xl font-semibold text-sm hover:bg-purple-500 cursor-pointer">
            Signup / Login
          </button>
        </Link>
      </header> */}

      <main className="flex-1 w-full flex flex-col items-center justify-center px-4">
        <h1 className="mt-12 text-5xl font-extrabold mb-2 text-center text-[#b773f8]">Empowering Gig Workers</h1>
        <h2 className="text-2xl text-gray-300 mb-2 text-center">for independent individuals</h2>
        <p className="mb-6 text-lg text-[#9f9aa7] text-center">Own Your Hustle, Secure Your Future, Thrive on Your Terms!</p>
        <button className="bg-[#b773f8] px-7 py-2 rounded-xl font-semibold text-lg mb-10 hover:bg-[#9566c6] text-black cursor-pointer">Register Now</button>
      
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-9 w-full max-w-5xl px-2">
          <FeatureCard title="Financial Management" desc="Track your income, expenses, and savings with real-time insights to help you plan and manage your finances efficiently." />
          <FeatureCard title="Benefits Navigator" desc="Explore and manage gig-related benefits such as insurance, wellness programs, and rewards tailored to your work profile." />
          <FeatureCard title="Rate Calculator" desc="Calculate fair rates for your services by comparing market averages, workload, & client budget to ensure fair compensation." />
          <FeatureCard title="Client Management" desc="Keep all client details organized, manage ongoing projects, track communication, and monitor payment history seamlessly." />
          <FeatureCard title="Networking Hub" desc="Connect with fellow gig workers, share experiences, find collaborations, and grow your professional network." />
          <FeatureCard title="Productivity Tools" desc="Access built-in utilities like task planners, timers, and reminders to boost productivity and stay on top of daily goals." />
        </div>
      </main>

      {/* <footer className="mt-16 w-full bg-[#b773f8] py-4 flex justify-between items-center px-8 mt-10 text-black">
        <div className="flex gap-4 text-sm">
          <a href="#" className="hover:underline">Quick Links</a>
          <a href="#" className="hover:underline">Legal</a>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>Created by</span>
          <span className="font-semibold">Saksham</span>
        </div>
      </footer> */}
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

