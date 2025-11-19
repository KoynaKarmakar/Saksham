'use client';

import React, { useRef, useState } from 'react';

export default function ProfilePage() {
  // --- Profile State ---
  const [editing, setEditing] = useState(false);
  const [pic, setPic] = useState('/avatar-placeholder.png'); // default avatar, replace with your default
  const [picFile, setPicFile] = useState<File | null>(null);
  const [name, setName] = useState('Emily Carter');
  const [tagline, setTagline] = useState('Stand-up comedian and improv artist with 7+ years of experience.');
  const [gigs, setGigs] = useState(75);
  const [rating, setRating] = useState(4.9);
  const [portfolio, setPortfolio] = useState({ title: "Live Comedy Show", url: "https://emilycartercomedy.com" });
  const [portfolioEdit, setPortfolioEdit] = useState(false);
  const [socials, setSocials] = useState([
    "https://emilycartercomedy.com",
    "https://instagram.com/emilycartercomedy"
  ]);
  const [newSocial, setNewSocial] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPicFile(file);
      const url = URL.createObjectURL(file);
      setPic(url);
    }
  }
  function handleEdit() { setEditing(true); }
  function handleSave() { setEditing(false); setPortfolioEdit(false);}
  function removeSocial(idx:number) {
    setSocials(s => s.filter((_,i)=>i!==idx));
  }
  function addSocial() {
    if (newSocial.trim()) {
      setSocials([...socials, newSocial.trim()]);
      setNewSocial("");
    }
  }

  // --- Render ---
  return (
    // FIX: Wrapped the entire content in a container setting the full page background
    <div className="min-h-screen bg-[#18141e] text-white pt-12"> 
      <main className="max-w-4xl mx-auto pt-16 px-5 pb-12 bg-[#18141e] rounded-xl shadow-lg">
        {/* Profile Card */}
        <div className="flex gap-5 items-center mb-4">
          {/* Avatar upload */}
          <div className="relative">
            <img
              src={pic}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#b773f8]"
            />
            <button
              className="absolute bottom-0 right-0 bg-[#2f2c38] p-2 rounded-full border-2 border-[#b773f8] shadow-md hover:bg-[#22215a] transition"
              onClick={()=>fileInput.current?.click()}
              title="Change picture"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="text-white w-5 h-5">
                <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm7 3a2 2 0 114 0 2 2 0 01-4 0zm-5 9a6 6 0 1111.996-.225V15a1 1 0 01-1 1H5a1 1 0 01-1-1v-1.225zm6-2.775a4 4 0 110-8 4 4 0 010 8z" />
              </svg>
            </button>
            {/* file input hidden */}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              ref={fileInput}
              onChange={handlePicChange}
            />
          </div>
          {/* Name/Details */}
          <div className="flex-1">
            {editing ? (
              <>
                <input
                  className="bg-[#18141e] border border-[#b773f8] p-2 rounded-lg w-full mb-2 text-xl font-bold text-white"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Name"
                />
                <textarea
                  className="bg-[#18141e] border border-[#29253b] p-2 rounded-lg w-full text-white text-sm"
                  value={tagline}
                  onChange={e=>setTagline(e.target.value)}
                  rows={2}
                  placeholder="Enter your tagline or bio"
                />
              </>
            ) : (
              <>
                <div className="text-2xl font-extrabold flex items-center gap-3">
                  {name}
                </div>
                <div className="text-gray-300">{tagline}</div>
              </>
            )}
          </div>
          {/* Edit/Save */}
          <div className="ml-1">
            {editing
              ? <button className="bg-[#b773f8] px-4 py-2 rounded-lg font-bold text-white hover:bg-[#a678db]" onClick={handleSave}>Save</button>
              : <button className="bg-[#2f2c38] px-4 py-2 rounded-lg border border-[#b773f8] text-white font-bold hover:bg-[#2d1e37]" onClick={handleEdit}>Edit</button>
            }
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 flex items-center bg-[#2f2c38] p-3 rounded-xl gap-3">
            <span className="text-[#b773f8] text-xl">🎁</span>
            <span className="font-semibold">{gigs} Gigs Completed</span>
          </div>
          <div className="flex-1 flex items-center bg-[#2f2c38] p-3 rounded-xl gap-3">
            <span className="text-yellow-400 text-xl">⭐</span>
            <span className="font-semibold">{rating} Rating</span>
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-[#2f2c38] rounded-xl p-4 mb-4">
          <div className="text-white font-bold mb-2">Portfolio</div>
          {editing && portfolioEdit ? (
            <div className="flex gap-2 items-end">
              <input
                className="bg-[#18141e] border border-[#b773f8] p-2 rounded-lg flex-1 text-white"
                value={portfolio.title}
                onChange={e=>setPortfolio(p=>({...p,title:e.target.value}))}
                placeholder="Portfolio title"
              />
              <input
                className="bg-[#18141e] border border-[#29253b] p-2 rounded-lg flex-1 text-white"
                value={portfolio.url}
                onChange={e=>setPortfolio(p=>({...p,url:e.target.value}))}
                placeholder="Portfolio link"
              />
              <button className="bg-[#b773f8] px-3 py-1 rounded-lg text-white" onClick={()=>setPortfolioEdit(false)}>Done</button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <a href={portfolio.url} className="text-[#b773f8] underline flex-1" target="_blank" rel="noopener noreferrer">{portfolio.title}</a>
              {editing ? (
                <button className="text-sm bg-[#29253b] border border-[#b773f8] px-3 py-1 rounded-lg text-white" onClick={()=>setPortfolioEdit(true)}>Edit</button>
              ) : (
                <a href={portfolio.url} target="_blank" rel="noopener noreferrer">
                  <button className="bg-[#353047] text-white font-semibold px-5 py-2 rounded-lg">View</button>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="bg-[#2f2c38] rounded-xl p-4">
          <div className="text-white font-bold mb-2">Social Links</div>
          {editing ? (
            <div>
              {socials.map((url,idx)=>(
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    className="bg-[#18141e] border border-[#29253b] p-2 rounded-lg flex-1 text-white"
                    value={url}
                    onChange={e=>{
                      const arr = socials.slice();
                      arr[idx] = e.target.value;
                      setSocials(arr);
                    }}
                  />
                  <button className="text-red-300 px-2 py-1 rounded-lg hover:bg-red-900" onClick={()=>removeSocial(idx)}>Delete</button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  className="bg-[#18141e] border border-[#b773f8] p-2 rounded-lg flex-1 text-white"
                  value={newSocial}
                  onChange={e=>setNewSocial(e.target.value)}
                  placeholder="Add new social link"
                />
                <button className="bg-[#b773f8] px-3 py-1 rounded-lg text-white" onClick={addSocial}>Add</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {socials.map((url,idx)=>(
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-[#b773f8] flex items-center gap-1 underline">
                  <span>🌐</span>{url}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}