'use client';
import React, { useState } from "react";

// Define the expected keys for the profile object for better type safety
type ProfileKey = "name" | "email" | "username" | "phone";

export default function SettingsPage() {
  // Profile
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    username: "johndoe123",
    phone: "+1 234 567 890"
  });
  const [editProfile, setEditProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  // Security
  const [twofa, setTwofa] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState({ old: "", newp: "", confirm: "" });
  const [sec, setSec] = useState({
    alerts: false,
    remember: false
  });
  const [passMsg, setPassMsg] = useState("");
  // Notifications
  const [notify, setNotify] = useState({
    email: false,
    push: false,
    sms: false,
    weekly: false
  });
  // Billing
  const [billing, setBilling] = useState({
    card: "**** **** **** 1234",
    address: "123 Main Street, City, Country",
    plan: "Premium - ₹799/month" // Currency is now Rupees
  });
  const [editBilling, setEditBilling] = useState(false);
  const [billingMsg, setBillingMsg] = useState("");

  function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setEditProfile(false);
    setProfileMsg("Profile updated!");
    setTimeout(() => setProfileMsg(""), 1500);
  }

  function handleChangePass(e: React.FormEvent) {
    e.preventDefault();
    if (!pass.old || !pass.newp || pass.newp !== pass.confirm) {
      setPassMsg("Passwords do not match or empty.");
      return;
    }
    setShowPass(false);
    setPassMsg("Password updated!");
    setTimeout(() => setPassMsg(""), 1500);
    setPass({ old:"", newp:"", confirm:"" });
  }

  function handleBillingUpdate(e: React.FormEvent) {
    e.preventDefault();
    setEditBilling(false);
    setBillingMsg("Payment info updated!");
    setTimeout(() => setBillingMsg(""), 1500);
  }

  // FIXED: Added explicit types for props
  const Section = ({icon, title, children}: {icon: React.ReactNode, title: string, children: React.ReactNode}) => (
    <div className="bg-[#201c2c] rounded-xl px-0 pt-3 pb-6 mb-8 shadow-lg border border-[#29253b]">
      <div className="flex items-center text-lg font-bold pl-7 pb-4 pt-2" style={{color: "#b773f8"}}>
        {icon} <span className="ml-2">{title}</span>
      </div>
      {children}
    </div>
  );

  // FIXED: Added explicit types for props
  const Switch = ({ checked, onChange, disabled=false }: {checked: boolean, onChange: (v: boolean) => void, disabled?: boolean}) => (
    <button
      className={
        "w-11 h-6 rounded-full relative inline-block align-middle transition " +
        (disabled ? "opacity-60 pointer-events-none " : "") +
        (checked ? "bg-[#b773f8]" : "bg-[#393149]")
      }
      onClick={()=>onChange(!checked)}
      type="button"
      aria-checked={checked}
    >
      <span
        className={
          "block w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform " +
          (checked ? "translate-x-[1.3rem] bg-[#b773f8]" : "")
        }
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#18141e] text-white px-0">
      <main className="max-w-1400px mx-auto w-full px-6 pb-16 pt-10">
        <h1 className="text-4xl font-extrabold mb-2">Settings</h1>
        <p className="text-gray-300 text-md mb-8">Manage your account, security, and preferences.</p>

        {/* --- Account Details --- */}
        <Section icon={<span>👤</span>} title="Account Details">
          <form className="flex flex-col gap-0 px-7 py-1" onSubmit={handleProfileUpdate}>
            {/* FIX: Explicitly cast 'f' as ProfileKey array to satisfy TypeScript */}
            {(["name", "email", "username", "phone"] as ProfileKey[]).map((f, i) => (
              <div key={f} className={`flex flex-col border-b last:border-b-0 border-[#29253b] py-1 mb-0`}>
                <label className="text-xs text-gray-400 pt-3">{["Full Name","Email","Username","Phone Number"][i]}</label>
                <input
                  className={"bg-transparent py-2 pl-1 text-white " + (!editProfile ? "cursor-default pointer-events-none" : "border-b border-[#222]" )}
                  value={profile[f]}
                  disabled={!editProfile}
                  onChange={e => setProfile(p => ({ ...p, [f]: e.target.value }))}
                  type={f==="email" ? "email" : f==="phone" ? "tel" : "text"}
                  required
                />
              </div>
            ))}
            <div className="mt-4 flex items-center gap-4">
              {editProfile ? (
                <>
                  <button className="bg-[#b773f8] px-4 py-2 rounded font-semibold text-white" type="submit">Save</button>
                  <button className="bg-[#29253b] px-4 py-2 rounded font-semibold" type="button" onClick={()=>{
                    setEditProfile(false);}}>Cancel</button>
                </>
              ) : (
                <button className="bg-[#b773f8] px-4 py-2 rounded font-semibold text-white" type="button" onClick={()=>setEditProfile(true)}>Update Profile</button>
              )}
              {profileMsg && <span className="text-green-400 text-sm">{profileMsg}</span>}
            </div>
          </form>
        </Section>

        {/* --- Security Settings --- */}
        <Section icon={<span>🔒</span>} title="Security Settings">
          <div className="flex flex-col gap-0 px-7">
            <div className="flex justify-between items-center py-3 border-b border-[#29253b]">
              <span>Enable Two-Factor Authentication</span>
              <Switch checked={twofa} onChange={setTwofa}/>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#29253b]">
              <span>Change Password</span>
              <button className="bg-[#3c3154] px-4 py-2 rounded font-semibold text-white" onClick={()=>setShowPass(s=>!s)}>Change</button>
            </div>
            {showPass && (
              <form className="my-3 flex gap-2 flex-wrap" onSubmit={handleChangePass}>
                <input className="bg-[#18141e] px-2 py-2 rounded" placeholder="Old password" type="password" value={pass.old} onChange={e=>setPass(p=>({...p,old:e.target.value}))}/>
                <input className="bg-[#18141e] px-2 py-2 rounded" placeholder="New password" type="password" value={pass.newp} onChange={e=>setPass(p=>({...p,newp:e.target.value}))}/>
                <input className="bg-[#18141e] px-2 py-2 rounded" placeholder="Confirm password" type="password" value={pass.confirm} onChange={e=>setPass(p=>({...p,confirm:e.target.value}))}/>
                <button className="bg-[#b773f8] px-4 py-2 rounded font-semibold text-white" type="submit">Save</button>
                {passMsg && <span className="text-green-400 text-sm ml-2">{passMsg}</span>}
              </form>
            )}
            <div className="flex justify-between items-center py-3 border-b border-[#29253b]">
              <span>Login Alerts</span>
              <Switch checked={sec.alerts} onChange={v=>setSec(o=>({...o,alerts:v}))}/>
            </div>
            <div className="flex justify-between items-center py-3">
              <span>Remember Devices</span>
              <Switch checked={sec.remember} onChange={v=>setSec(o=>({...o,remember:v}))}/>
            </div>
          </div>
        </Section>

        {/* --- Notification Preferences --- */}
        <Section icon={<span>🔔</span>} title="Notification Preferences">
          <div className="flex flex-col gap-0 px-7">
            {[
              ["Email Notifications",'email'],
              ["Push Notifications",'push'],
              ["SMS Notifications",'sms'],
              ["Weekly Summary Emails",'weekly']
            ].map(([label, key])=>(
              <div className="flex justify-between items-center py-3 border-b last:border-b-0 border-[#29253b]" key={key}>
                <span>{label}</span>
                {/* Fixed casting in previous step */}
                <Switch checked={notify[key as keyof typeof notify]} onChange={v=>setNotify(o=>({...o,[key]:v}))}/>
              </div>
            ))}
          </div>
        </Section>

        {/* --- Billing & Payments --- */}
        <Section icon={<span>💳</span>} title="Billing & Payments">
          <form className="flex flex-col gap-0 px-7" onSubmit={handleBillingUpdate}>
            <div className="flex flex-col border-b border-[#29253b] py-1">
              <label className="text-xs text-gray-400 pt-3">Payment Method</label>
              <input className="bg-transparent py-2 pl-1 text-white cursor-default pointer-events-none" value={billing.card} disabled />
            </div>
            <div className="flex flex-col border-b border-[#29253b] py-1">
              <label className="text-xs text-gray-400 pt-3">Billing Address</label>
              <input
                className={"py-2 pl-1 bg-transparent text-white " + (!editBilling ? "cursor-default pointer-events-none" : "border-b border-[#222]")}
                value={billing.address}
                disabled={!editBilling}
                onChange={e=>setBilling(o=>({...o,address:e.target.value}))}
                required
              />
            </div>
            <div className="flex flex-col py-1">
              <label className="text-xs text-gray-400 pt-3">Subscription Plan</label>
              <input className="bg-transparent py-2 pl-1 text-white cursor-default pointer-events-none" value={billing.plan} disabled />
            </div>
            <div className="mt-4 flex items-center gap-4">
              {editBilling ? (
                <>
                  <button className="bg-[#b773f8] px-4 py-2 rounded font-semibold text-white" type="submit">Save</button>
                  <button className="bg-[#29253b] px-4 py-2 rounded font-semibold" type="button" onClick={()=>setEditBilling(false)}>Cancel</button>
                </>
              ) : (
                <button className="bg-[#b773f8] px-4 py-2 rounded font-semibold text-white" type="button" onClick={()=>setEditBilling(true)}>Update Payment</button>
              )}
              {billingMsg && <span className="text-green-400 text-sm">{billingMsg}</span>}
            </div>
          </form>
        </Section>
      </main>
    </div>
  );
}