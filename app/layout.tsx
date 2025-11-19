
'use client';

import './globals.css';
import Link from 'next/link';
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
// 1. IMPORT usePathname
import { usePathname } from 'next/navigation';

function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  // State to control the visibility of the profile dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // 2. GET CURRENT PATHNAME
  const pathname = usePathname(); 

  // Helper function to determine the class based on the current path
  const getLinkClass = (href:string) => {
    // If the link's href matches the current pathname, apply the color.
    // Otherwise, use the default gray-300 color.
    const baseClasses = 'transition duration-150';
    const activeClass = 'text-[#b773f8] font-semibold underline decoration-[#b773f8]'; 
    const inactiveClass = 'text-gray-300 hover:text-white';
    
    return pathname === href ? `${baseClasses} ${activeClass}` : `${baseClasses} ${inactiveClass}`;
  };

  return (
    <nav className="flex items-center justify-between bg-[#19151e] px-8 py-3 text-white border-b border-gray-700">
      <div className="font-bold text-2xl text-[#b773f8]">
        <Link href={isLoggedIn ? "/home" : "/"}>Saksham</Link>
      </div>
      <div className="flex gap-9 text-gray-300">
        
        {/*
          --- START LOGGED IN CONTENT BLOCK ---
        */}
        {isLoggedIn ? (
          <React.Fragment>
            {/* 1. NAVIGATION LINKS */}
            <div className='mt-2 flex gap-9 text-mb'>
              {/* Apply getLinkClass to all navigation links */}
              <Link href="/home" className={getLinkClass("/home")}>Home</Link>
              <Link href="/financial" className={getLinkClass("/financial")}>Financial</Link>
              <Link href="/benefits" className={getLinkClass("/benefits")}>Benefits</Link>
              <Link href="/calculater" className={getLinkClass("/calculater")}>Calculater</Link>
              <Link href="/clients" className={getLinkClass("/clients")}>Clients</Link>
              <Link href="/network" className={getLinkClass("/network")}>Network</Link>
              <Link href="/productivity" className={getLinkClass("/productivity")}>Productivity</Link>
              <Link href="/settings" className={getLinkClass("/settings")}>Settings</Link>
            </div>

            {/* 2. PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg text-white bg-[#29253b] transition relative z-20 cursor-pointer hover:bg-[#201c2c]"
              >
                {/* Profile Info */}
                <div className='text-right'>
                    <span className='block text-sm font-semibold text-gray-200'>Gig Worker</span>
                    <span className='block text-xs text-gray-400'>Free Plan</span>
                </div>
                {/* Profile Circle */}
                <div className="w-8 h-8 rounded-full bg-[#b773f8]"></div>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#232027] rounded-xl shadow-2xl border border-[#29253b] z-30 overflow-hidden">
                  
                  {/* Header (Gig Worker / Free Plan) */}
                  {/* <div className="flex items-center gap-3 p-4 bg-[#201c2c] border-b border-[#29253b]">
                    <div className="w-8 h-8 rounded-full bg-[#b773f8]"></div>
                    <div>
                      <span className='block text-sm font-semibold'>Gig Worker</span>
                      <span className='block text-xs text-gray-400'>Free Plan</span>
                    </div>
                  </div> */}

                  {/* Menu Items */}
                  <div className="py-2">
                    {/* FIXED: Applied styling and closing logic directly to Link element */}
                    <Link 
                      href="/profile" 
                      onClick={() => setIsProfileOpen(false)} 
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-[#29253b] transition"
                    > 
                      {/* Icon for View Profile */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      View Profile
                    </Link>
                    
                    {/* Log Out Button (remains functional) */}
                    <button
                      onClick={() => {
                        logout(); // EXECUTES LOGOUT BEFORE REDIRECTING
                        window.location.href = "/";
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-[#29253b] transition"
                    >
                      {/* Icon for Log Out */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-2 0V4H5v12h10v-2a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zM16 8a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
              
              {/* Overlay to close dropdown when clicking outside */}
              {isProfileOpen && (
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
              )}
            </div>
          </React.Fragment>
        ) : (
          // LOGGED OUT: SHOW SIGNUP/LOGIN BUTTON
          <>
            <Link 
              href="/signup" 
              className="bg-[#b773f8] border border-gray-400 rounded-full px-4 py-2 text-gray-800 transition duration-300 hover:bg-[#a663e6]"
            >
                Signup/Login
            </Link>
          </>
        )}
        {/* --- END LOGGED IN CONTENT BLOCK --- */}

      </div>
    </nav>
    
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <AuthProvider>
      <html lang="en">
        <body>
          <Navbar />
          <main className="min-h-screen bg-gray-100">{children}</main>
          <footer className="mt-16 w-full bg-[#b773f8] py-4 flex justify-between items-center px-8 mt-10 text-black">
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:underline">Quick Links</a>
              <a href="#" className="hover:underline">Legal</a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>Created by</span>
              <span className="font-semibold">Saksham</span>
            </div>
          </footer>
        </body>
      </html>
    </AuthProvider>
  );
}