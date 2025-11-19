'use client';
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '@/lib/api';

// Define the expected keys for the profile object for better type safety
type ProfileKey = "name" | "email" | "username" | "phone";

// Initial state structure matching the backend User model
interface SettingsState {
  profile: Record<ProfileKey, string>;
  security: {
    twofa: boolean;
    alerts: boolean;
    remember: boolean;
  };
  notify: {
    email: boolean;
    push: boolean;
    sms: boolean;
    weekly: boolean;
  };
  billing: {
    card: string;
    address: string;
    plan: string;
  };
}

// Initial placeholder state
const initialState: SettingsState = {
  profile: { name: "Loading...", email: "loading@example.com", username: "", phone: "" },
  security: { twofa: false, alerts: false, remember: false },
  notify: { email: false, push: false, sms: false, weekly: false },
  billing: { card: "**** **** **** 1234", address: "Loading...", plan: "Free" },
};

export default function SettingsPage() {
  const { user } = useAuth();

  const [settings, setSettings] = useState<SettingsState>(initialState);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Form Specific States
  const [editProfile, setEditProfile] = useState(false);
  const [editBilling, setEditBilling] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState({ old: "", newp: "", confirm: "" });

  // Message States
  const [profileMsg, setProfileMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [billingMsg, setBillingMsg] = useState("");
  const [securityMsg, setSecurityMsg] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");

  // --- Data Fetching: GET /api/users/me ---
  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      setLoading(true);
      setPageError(null);
      try {
        const { user: fetchedUser } = await apiFetch('/users/me', { method: 'GET' });

        setSettings({
          profile: {
            name: fetchedUser.name || '',
            email: fetchedUser.email || '',
            username: fetchedUser.username || '',
            phone: fetchedUser.phone || '',
          },
          security: {
            twofa: fetchedUser.twoFactorEnabled,
            alerts: fetchedUser.securityAlerts,
            remember: fetchedUser.rememberDevices,
          },
          notify: fetchedUser.notifications || initialState.notify,
          billing: {
            card: fetchedUser.billing?.card || initialState.billing.card,
            address: fetchedUser.billing?.address || '',
            plan: fetchedUser.billing?.plan || initialState.billing.plan,
          },
        });

      } catch (err) {
        setPageError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // Helper to display messages temporarily
  const setTempMessage = (setter: React.Dispatch<React.SetStateAction<string>>, message: string, isError: boolean = false) => {
    setter(message);
    setTimeout(() => setter(""), 3000);
  };

  // --- 1. Profile Update: PUT /api/users/me ---
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProfile(false);
    setProfileMsg("Saving...");

    const payload = {
      name: settings.profile.name,
      username: settings.profile.username,
      phone: settings.profile.phone,
    };

    try {
      await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setTempMessage(setProfileMsg, "Profile updated!");
    } catch (err: any) {
      setTempMessage(setProfileMsg, err.message || "Failed to update profile.", true);
      setEditProfile(true); // Re-enable editing on error
    }
  };

  // --- 2. Password Update: PUT /api/users/me/password ---
  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pass.old || !pass.newp || pass.newp !== pass.confirm) {
      setTempMessage(setPassMsg, "Passwords do not match or fields are empty.", true);
      return;
    }
    if (pass.newp.length < 6) {
      setTempMessage(setPassMsg, "New password must be at least 6 characters.", true);
      return;
    }

    setShowPass(false);
    setPassMsg("Changing password...");

    try {
      await apiFetch('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword: pass.old, newPassword: pass.newp }),
      });
      setTempMessage(setPassMsg, "Password updated!");
      setPass({ old: "", newp: "", confirm: "" });
    } catch (err: any) {
      setTempMessage(setPassMsg, err.message || "Failed to change password.", true);
      setShowPass(true); // Keep form open on error
    }
  };

  // --- 3. Security/Notifications Update: PUT /api/users/me/settings ---
  const handleSecurityUpdate = useCallback(async (key: keyof SettingsState['security'], value: boolean) => {
    setSecurityMsg("Saving...");
    const payload = { [key]: value };
    try {
      await apiFetch('/users/me/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setSettings(p => ({ ...p, security: { ...p.security, [key]: value } }));
      setTempMessage(setSecurityMsg, "Setting updated!");
    } catch (err: any) {
      setTempMessage(setSecurityMsg, "Failed to update security setting.", true);
    }
  }, []);

  const handleNotifyUpdate = useCallback(async (key: keyof SettingsState['notify'], value: boolean) => {
    setNotifyMsg("Saving...");
    const payload = { notifications: { [key]: value } };
    try {
      await apiFetch('/users/me/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setSettings(p => ({ ...p, notify: { ...p.notify, [key]: value } }));
      setTempMessage(setNotifyMsg, "Notification preference saved!");
    } catch (err: any) {
      setTempMessage(setNotifyMsg, "Failed to update notification setting.", true);
    }
  }, []);

  // --- 4. Billing Update: PUT /api/users/me/billing ---
  const handleBillingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditBilling(false);
    setBillingMsg("Saving...");

    const payload = {
      billing: {
        address: settings.billing.address,
        // Card update flow is complex and skipped for this API, address is enough
      }
    };

    try {
      await apiFetch('/users/me/billing', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setTempMessage(setBillingMsg, "Billing info updated!");
    } catch (err: any) {
      setTempMessage(setBillingMsg, err.message || "Failed to update billing info.", true);
      setEditBilling(true); // Re-enable editing on error
    }
  };

  // Reusable components (NO UI CHANGES)
  const Section = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-[#201c2c] rounded-xl px-0 pt-3 pb-6 mb-8 shadow-lg border border-[#29253b]">
      <div className="flex items-center text-lg font-bold pl-7 pb-4 pt-2" style={{ color: "#b773f8" }}>
        {icon} <span className="ml-2">{title}</span>
      </div>
      {children}
    </div>
  );
  const Switch = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: (v: boolean) => void, disabled?: boolean }) => (
    <button
      className={
        "w-11 h-6 rounded-full relative inline-block align-middle transition " +
        (disabled ? "opacity-60 pointer-events-none " : "") +
        (checked ? "bg-[#b773f8]" : "bg-[#393149]")
      }
      onClick={() => onChange(!checked)}
      type="button"
      aria-checked={checked}
      disabled={disabled}
    >
      <span
        className={
          "block w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform " +
          (checked ? "translate-x-[1.3rem] bg-[#b773f8]" : "")
        }
      />
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18141e] text-white flex items-center justify-center">
        Loading Settings...
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-[#18141e] text-red-400 flex items-center justify-center">
        Error: {pageError}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18141e] text-white px-0">
      <main className="max-w-1400px mx-auto w-full px-6 pb-16 pt-10">
        <h1 className="text-4xl font-extrabold mb-2">Settings</h1>
        <p className="text-gray-300 text-md mb-8">Manage your account, security, and preferences.</p>

        {/* --- Account Details --- */}
        <Section icon={<span>側</span>} title="Account Details">
          <form className="flex flex-col gap-0 px-7 py-1" onSubmit={handleProfileUpdate}>
            {(["name", "email", "username", "phone"] as ProfileKey[]).map((f, i) => (
              <div key={f} className={`flex flex-col border-b last:border-b-0 border-[#29253b] py-1 mb-0`}>
                <label className="text-xs text-gray-400 pt-3">{["Full Name", "Email", "Username", "Phone Number"][i]}</label>
                <input
                  className={"bg-transparent py-2 pl-1 text-white " + ((!editProfile || f === "email") ? "cursor-default pointer-events-none" : "border-b border-[#222]")}
                  value={settings.profile[f]}
                  disabled={!editProfile || f === "email"} // Email is read-only
                  onChange={e => setSettings(p => ({ ...p, profile: { ...p.profile, [f]: e.target.value } }))}
                  type={f === "email" ? "email" : f === "phone" ? "tel" : "text"}
                  required={f !== "phone"}
                />
              </div>
            ))}
            <div className="mt-4 flex items-center gap-4">
              {editProfile ? (
                <>
                  <button className="bg-[#b773f8] px-4 py-2 rounded font-semibold text-white" type="submit">Save</button>
                  <button className="bg-[#29253b] px-4 py-2 rounded font-semibold" type="button" onClick={() => {
                    setEditProfile(false); setSettings(initialState);
                  }}>Cancel</button>
                </>
              ) : (
                <button className="bg-[#b773f8] px-4 py-2 rounded font-semibold text-white" type="button" onClick={() => setEditProfile(true)}>Update Profile</button>
              )}
              {profileMsg && <span className={`text-sm ml-2 ${profileMsg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{profileMsg}</span>}
            </div>
          </form>
        </Section>

        {/* --- Security Settings --- */}
        <Section icon={<span>白</span>} title="Security Settings">
          <div className="flex flex-col gap-0 px-7">
            <div className="flex justify-between items-center py-3 border-b border-[#29253b]">
              <span>Enable Two-Factor Authentication</span>
              <Switch checked={settings.security.twofa} onChange={(v) => handleSecurityUpdate('twofa', v)} />
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#29253b]">
              <span>Change Password</span>
              <button className="bg-[#3c3154] px-4 py-2 rounded font-semibold text-white" onClick={() => setShowPass(s => !s)}>Change</button>
            </div>
            {showPass && (
              <form className="my-3 flex gap-2 flex-wrap" onSubmit={handleChangePass}>
                <input className="bg-[#18141e] px-2 py-2 rounded" placeholder="Old password" type="password" value={pass.old} onChange={e => setPass(p => ({ ...p, old: e.target.value }))} />
                <input className="bg-[#18141e] px-2 py-2 rounded" placeholder="New password" type="password" value={pass.newp} onChange={e => setPass(p => ({ ...p, newp: e.target.value }))} />
                <input className="bg-[#18141e] px-2 py-2 rounded" placeholder="Confirm password" type="password" value={pass.confirm} onChange={e => setPass(p => ({ ...p, confirm: e.target.value }))} />
                <button className="bg-[#b773f8] px-4 py-2 rounded font-semibold text-white" type="submit">Save</button>
                {passMsg && <span className={`text-sm ml-2 ${passMsg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{passMsg}</span>}
              </form>
            )}
            <div className="flex justify-between items-center py-3 border-b border-[#29253b]">
              <span>Login Alerts</span>
              <Switch checked={settings.security.alerts} onChange={v => handleSecurityUpdate('alerts', v)} />
            </div>
            <div className="flex justify-between items-center py-3">
              <span>Remember Devices</span>
              <Switch checked={settings.security.remember} onChange={v => handleSecurityUpdate('remember', v)} />
            </div>
            {securityMsg && <div className={`text-xs mt-3 ${securityMsg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{securityMsg}</div>}
          </div>
        </Section>

        {/* --- Notification Preferences --- */}
        <Section icon={<span>粕</span>} title="Notification Preferences">
          <div className="flex flex-col gap-0 px-7">
            {[
              ["Email Notifications", 'email'],
              ["Push Notifications", 'push'],
              ["SMS Notifications", 'sms'],
              ["Weekly Summary Emails", 'weekly']
            ].map(([label, key]) => (
              <div className="flex justify-between items-center py-3 border-b last:border-b-0 border-[#29253b]" key={key}>
                <span>{label}</span>
                <Switch checked={settings.notify[key as keyof SettingsState['notify']]} onChange={v => handleNotifyUpdate(key as keyof SettingsState['notify'], v)} />
              </div>
            ))}
            {notifyMsg && <div className={`text-xs mt-3 ${notifyMsg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{notifyMsg}</div>}
          </div>
        </Section>

        {/* --- Billing & Payments --- */}
        <Section icon={<span>諜</span>} title="Billing & Payments">
          <form className="flex flex-col gap-0 px-7" onSubmit={handleBillingUpdate}>
            <div className="flex flex-col border-b border-[#29253b] py-1">
              <label className="text-xs text-gray-400 pt-3">Payment Method</label>
              <input className="bg-transparent py-2 pl-1 text-white cursor-default pointer-events-none" value={settings.billing.card} disabled />
            </div>
            <div className="flex flex-col border-b border-[#29253b] py-1">
              <label className="text-xs text-gray-400 pt-3">Billing Address</label>
              <input
                className={"py-2 pl-1 bg-transparent text-white " + (!editBilling ? "cursor-default pointer-events-none" : "border-b border-[#222]")}
                value={settings.billing.address}
                disabled={!editBilling}
                onChange={e => setSettings(o => ({ ...o, billing: { ...o.billing, address: e.target.value } }))}
                required
              />
            </div>
            <div className="flex flex-col py-1">
              <label className="text-xs text-gray-400 pt-3">Subscription Plan</label>
              <input className="bg-transparent py-2 pl-1 text-white cursor-default pointer-events-none" value={settings.billing.plan} disabled />
            </div>
            <div className="mt-4 flex items-center gap-4">
              {editBilling ? (
                <>
                  <button className="bg-[#b773f8] px-4 py-2 rounded font-semibold text-white" type="submit">Save</button>
                  <button className="bg-[#29253b] px-4 py-2 rounded font-semibold" type="button" onClick={() => setEditBilling(false)}>Cancel</button>
                </>
              ) : (
                <button className="bg-[#b773f8] px-4 py-2 rounded font-semibold text-white" type="button" onClick={() => setEditBilling(true)}>Update Payment</button>
              )}
              {billingMsg && <span className={`text-sm ml-2 ${billingMsg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{billingMsg}</span>}
            </div>
          </form>
        </Section>
      </main>
    </div>
  );
}