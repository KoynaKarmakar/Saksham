// app/clients/page.tsx

'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '@/lib/api';
import ClientFormModal from '@/components/ClientFormModal';
import TransactionFormModal from '@/components/TransactionFormModal'; // NEW IMPORT

// Define the shape of data expected from the backend
interface BackendClient {
    _id: string;
    name: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    status: 'Active' | 'Inactive';
    projectsCount: number;
    totalBilled: number;
    lastContactDate: string;
}

interface FrontendClient {
    _id: string;
    name: string;
    contact: string;
    email: string;
    status: 'Active' | 'Inactive';
    projects: number;
    phone: string;
    billed: string;
    lastContact: string;
}

interface RecentInvoice {
    client: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Pending';
    name: string;
}

const DEADLINES = [
    { project: "Website Redesign", client: "Acme Corporation", date: "15/04/2023" },
    { project: "Mobile App Development", client: "Stark Enterprises", date: "10/04/2023" },
    { project: "Brand Identity", client: "Wayne Industries", date: "05/04/2023" },
];

const HISTORY = [
    { type: "Project Update", client: "Acme Corporation", detail: "Email", date: "15/03/2023" },
    { type: "Contract Discussion", client: "Globex Industries", detail: "Call", date: "12/03/2023" },
    { type: "Kickoff Session", client: "Stark Enterprises", detail: "Meeting", date: "10/03/2023" },
];

const FOLLOWUPS = [
    { action: "Send proposal", client: "Initech LLC", date: "20/03/2023" },
    { action: "Schedule review meeting", client: "Wayne Industries", date: "22/03/2023" },
    { action: "Contract renewal discussion", client: "Acme Corporation", date: "25/03/2023" },
];

const mapClientToFrontend = (client: BackendClient): FrontendClient => {
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return {
        _id: client._id,
        name: client.name,
        contact: client.contactName,
        email: client.contactEmail,
        status: client.status,
        projects: client.projectsCount,
        phone: client.contactPhone,
        billed: `₹${client.totalBilled.toLocaleString('en-IN')}`,
        lastContact: formatDate(client.lastContactDate),
    };
};

const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};


export default function ClientsPage() {
    const { isLoggedIn } = useAuth();

    const [clients, setClients] = useState<FrontendClient[]>([]);
    const [invoices, setInvoices] = useState<RecentInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState<'all' | 'active' | 'inactive'>('all');
    const [widgetTab, setWidgetTab] = useState<'invoices' | 'deadlines'>('invoices');
    const [commTab, setCommTab] = useState<'history' | 'followups'>('history');
    const [expandIdx, setExpandIdx] = useState<number | null>(null);

    // Client Modals State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Invoice Modal State (NEW)
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedClientIdForInvoice, setSelectedClientIdForInvoice] = useState<string | undefined>(undefined);

    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchClients = useCallback(async () => {
        if (!isLoggedIn) return;

        setLoading(true);
        setError(null);

        try {
            const [clientsRes, invoicesRes] = await Promise.allSettled([
                apiFetch('/clients', { method: 'GET' }),
                apiFetch('/clients/invoices/recent', { method: 'GET' }),
            ]);

            let fetchedClientsRaw: BackendClient[] = [];

            if (clientsRes.status === 'fulfilled') {
                fetchedClientsRaw = clientsRes.value.clients;
                const formattedClients = fetchedClientsRaw.map(mapClientToFrontend);
                setClients(formattedClients);
            }

            if (invoicesRes.status === 'fulfilled') {
                const clientNameMap = new Map<string, string>(
                    fetchedClientsRaw.map(c => [c._id.toString(), c.name])
                );

                const formattedInvoices: RecentInvoice[] = invoicesRes.value.invoices.map((inv: any) => ({
                    ...inv,
                    client: clientNameMap.get(inv.client) || 'Unknown Client',
                    date: new Date(inv.date).toLocaleDateString('en-GB'),
                    amount: Math.abs(inv.amount),
                }));

                setInvoices(formattedInvoices);
            }

        } catch (err) {
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleAddClientSubmit = async (formData: any) => {
        setModalLoading(true);
        setModalError(null);
        try {
            const { client: newClient } = await apiFetch('/clients', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            setClients(prev => [...prev, mapClientToFrontend(newClient)]);
            setIsModalOpen(false);
            await fetchClients();
        } catch (err: any) {
            setModalError(err.message || "An unknown error occurred.");
        } finally {
            setModalLoading(false);
        }
    };

    // New Handler for recording invoice
    const handleAddInvoiceSubmit = async (formData: any) => {
        setModalLoading(true);
        setModalError(null);
        try {
            // Prepare payload: Ensure amount is float and type is income if adding invoice
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
            };

            await apiFetch('/transactions', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            setIsInvoiceModalOpen(false);
            await fetchClients(); // Refresh list to update client totals
        } catch (err: any) {
            setModalError(err.message || "Failed to record invoice.");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteClient = async (clientId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this client?")) {
            return;
        }
        setIsDeleting(clientId);
        setError(null);
        try {
            await apiFetch(`/clients/${clientId}`, { method: 'DELETE' });
            setClients(prev => prev.filter(c => c._id !== clientId));
            setExpandIdx(null);
            await fetchClients();
        } catch (err: any) {
            setError(err.message || "Failed to delete client.");
        } finally {
            setIsDeleting(null);
        }
    };

    const activeClients = clients.filter(c => c.status === 'Active').length;
    const totalBilledValue = clients.reduce((sum, c) => {
        const num = parseFloat(c.billed.replace(/[₹,]/g, '')) || 0;
        return sum + num;
    }, 0);
    const activeProjects = clients.reduce((sum, c) => sum + (c.status === 'Active' ? c.projects : 0), 0);

    const stats = [
        { label: "Active Clients", value: activeClients, sub: "+2 from last month" },
        { label: "Total Billed", value: `₹${totalBilledValue.toLocaleString('en-IN')}`, sub: "+₹5,800 from last month" },
        { label: "Active Projects", value: activeProjects, sub: "+3 from last month" },
    ];

    const filtered = clients.filter(c =>
        (statusTab === 'all' || c.status.toLowerCase() === statusTab) &&
        (c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.contact.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#18141e] text-white flex items-center justify-center">
                Loading Client List...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#18141e] text-white px-0">

            <ClientFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddClientSubmit}
                loading={modalLoading}
                error={modalError}
            />

            {/* NEW: Invoice Modal */}
            <TransactionFormModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                onSubmit={handleAddInvoiceSubmit}
                loading={modalLoading}
                error={modalError}
                defaultClient={selectedClientIdForInvoice}
            />

            <main className="max-w-[1400px] mx-auto w-full px-7 pb-10">
                {error && <div className="p-3 my-4 text-sm text-red-400 bg-red-900/50 rounded-lg w-full text-center">{error}</div>}

                <div className="pt-10 pb-1 flex flex-col gap-2">
                    <h1 className="text-4xl font-extrabold">Client Management</h1>
                    <p className="text-gray-300 text-lg mb-5">Track, manage, and maintain your client relationships.</p>
                    <div className="flex items-center gap-4 w-full mb-2">
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="rounded-lg py-2 px-4 bg-[#221c2e] text-white font-medium w-[320px] border-2 border-transparent focus:border-[#b773f8] transition outline-none"
                            placeholder="Search clients..."
                        />
                        <div className="flex-1 flex justify-end items-center gap-3">
                            <button className="bg-[#221c2e] px-4 py-2 rounded-md text-white font-semibold text-sm">Filter</button>
                            <button className="bg-[#221c2e] px-4 py-2 rounded-md text-white font-semibold text-sm">Export</button>
                            <button
                                className="bg-[#b773f8] px-4 py-2 rounded-md text-white font-bold text-sm flex items-center gap-2"
                                onClick={() => { setIsModalOpen(true); setModalError(null); }}
                                disabled={loading}
                            >
                                <span>+</span> Add Client
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-5 mt-2">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-[#1e1a2a] rounded-xl p-7 shadow flex flex-col">
                            <span className="text-lg text-[#b773f8] font-semibold mb-1">{s.label}</span>
                            <span className="text-3xl font-extrabold mb-1">{s.value}</span>
                            <span className="text-sm text-green-400">{s.sub}</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 mt-2 mb-0">
                    {["all", "active", "inactive"].map(key => (
                        <button
                            key={key}
                            className={"px-5 py-2 font-bold text-sm rounded-t transition " +
                                (statusTab === key
                                    ? "text-white bg-[#29253b]"
                                    : "text-gray-300")}
                            onClick={() => setStatusTab(key as any)}
                        >
                            {key === "all" ? "All Clients" : key.slice(0, 1).toUpperCase() + key.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="bg-[#1e1a2a] rounded-b-xl shadow-lg">
                    <div className="gap-0 grid grid-cols-12 font-semibold text-gray-300 px-7 pt-5 pb-2 text-sm" style={{ background: "#29253b", borderTopLeftRadius: "0.75rem", borderTopRightRadius: "0.75rem" }}>
                        <span className="col-span-4">Name</span>
                        <span className="col-span-3">Contact</span>
                        <span className="col-span-2">Status</span>
                        <span className="col-span-1 text-right">Projects</span>
                        <span className="col-span-2"></span>
                    </div>
                    {filtered.length === 0 ? (
                        <div className="text-center p-6 text-gray-400 italic">No clients found matching criteria.</div>
                    ) : (
                        filtered.map((c, i) => (
                            <React.Fragment key={c._id}>
                                <div
                                    className={`gap-0 grid grid-cols-12 items-center text-md border-b border-[#28223b] px-7 py-3 text-white last:border-b-0 transition ${isDeleting === c._id ? 'opacity-50' : 'hover:bg-[#221c2e]'}`}
                                >
                                    <span className="col-span-4">{c.name} {isDeleting === c._id && `(Deleting...)`}</span>
                                    <span className="col-span-3">
                                        <span className="block font-bold">{c.contact}</span>
                                        <span className="block text-xs text-gray-400">{c.email}</span>
                                    </span>
                                    <span className="col-span-2">
                                        {c.status === "Active" ? (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-4 py-1 rounded-xl">Active</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-1 rounded-xl">Inactive</span>
                                        )}
                                    </span>
                                    <span className="col-span-1 text-right">{c.projects}</span>
                                    <span className="col-span-2 flex justify-end">
                                        <button
                                            className="px-2 text-2xl opacity-70 hover:opacity-100"
                                            onClick={() => setExpandIdx(expandIdx === i ? null : i)}
                                            disabled={!!isDeleting}
                                        >⋯</button>
                                    </span>
                                </div>
                                {expandIdx === i && (
                                    <div className="w-full bg-[#221c2e] p-0">
                                        <div className="w-full px-12 pb-5 pt-8 flex flex-col md:flex-row gap-10 border-b border-[#28223b]">
                                            <div className="flex-1 min-w-[400px]">
                                                <div className="font-bold text-lg mb-3">Client Details</div>
                                                <table className="w-full text-sm">
                                                    <tbody>
                                                        <tr><td className="py-1 text-gray-400">Company:</td><td className="py-1">{c.name}</td></tr>
                                                        <tr><td className="py-1 text-gray-400">Contact:</td><td className="py-1">{c.contact}</td></tr>
                                                        <tr><td className="py-1 text-gray-400">Email:</td><td className="py-1">{c.email}</td></tr>
                                                        <tr><td className="py-1 text-gray-400">Phone:</td><td className="py-1">{c.phone}</td></tr>
                                                        <tr><td className="py-1 text-gray-400">Status:</td><td className="py-1">{c.status}</td></tr>
                                                    </tbody>
                                                </table>
                                                <div className="flex gap-3 mt-6">
                                                    <button className="flex items-center px-5 py-2 rounded-md bg-[#b773f8] text-white font-semibold gap-2"><span>✉️</span>Contact</button>
                                                    <button
                                                        className="flex items-center px-5 py-2 rounded-md bg-red-700 text-white font-semibold gap-2 transition hover:bg-red-800"
                                                        onClick={() => handleDeleteClient(c._id)}
                                                        disabled={isDeleting === c._id}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-[400px]">
                                                <div className="font-bold text-lg mb-3">Financial Summary</div>
                                                <table className="w-full text-sm">
                                                    <tbody>
                                                        <tr><td className="py-1 text-gray-400">Total Billed:</td><td className="py-1">{c.billed}</td></tr>
                                                        <tr><td className="py-1 text-gray-400">Active Projects:</td><td className="py-1">{c.projects}</td></tr>
                                                        <tr><td className="py-1 text-gray-400">Last Contact:</td><td className="py-1">{c.lastContact}</td></tr>
                                                    </tbody>
                                                </table>
                                                <div className="flex gap-3 mt-6">
                                                    {/* Record Invoice Button */}
                                                    <button 
                                                        className="flex items-center px-5 py-2 rounded-md bg-green-600 text-white font-semibold gap-2 transition hover:bg-green-700"
                                                        onClick={() => {
                                                            setSelectedClientIdForInvoice(c._id);
                                                            setModalError(null);
                                                            setIsInvoiceModalOpen(true);
                                                        }}
                                                    >
                                                        <span>💰</span> Record Invoice
                                                    </button>
                                                    <button className="flex items-center px-5 py-2 rounded-md bg-[#29253b] text-white font-semibold gap-2 border border-[#3c3154]"><span>📄</span>View Invoices</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </div>
                
                {/* ... Widgets Section (Unchanged) ... */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* ... (Keep the widgets code as is) ... */}
                     <div className="bg-[#1e1a2a] rounded-xl p-0 shadow-lg">
                        <div className="flex gap-1 border-b border-[#29253b]">
                        <button
                            className={`flex-1 py-3 px-5 font-medium text-sm ${widgetTab === 'invoices' ? 'text-[#b773f8] border-b-2 border-[#b773f8]' : 'text-gray-300'}`}
                            onClick={() => setWidgetTab('invoices')}
                        >
                            Recent Invoices
                        </button>
                        <button
                            className={`flex-1 py-3 px-5 font-medium text-sm ${widgetTab === 'deadlines' ? 'text-[#b773f8] border-b-2 border-[#b773f8]' : 'text-gray-300'}`}
                            onClick={() => setWidgetTab('deadlines')}
                        >
                            Upcoming Deadlines
                        </button>
                        </div>
                        <div className="py-5 px-6">
                        {widgetTab === 'invoices' ? (
                            invoices.length === 0 ? (
                            <div className="text-center p-3 text-gray-400 italic">No recent paid invoices found.</div>
                            ) : (
                            invoices.map((inv, i) => (
                                <div key={i} className="flex justify-between py-2 border-b border-[#29253b] last:border-b-0">
                                <div>
                                    <div className="font-semibold">{inv.name}</div>
                                    <div className="text-xs text-gray-400">{inv.client} - {inv.date}</div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`font-bold text-lg text-green-400`}>{formatCurrency(inv.amount)}</span>
                                    <span className={`text-xs ${inv.status === "Paid" ? "text-green-400" : "text-yellow-400"}`}>{inv.status}</span>
                                </div>
                                </div>
                            ))
                            )
                        ) : (
                            DEADLINES.map((d, i) => (
                            <div key={i} className="flex justify-between py-2 border-b border-[#29253b] last:border-b-0">
                                <div>
                                <div className="font-semibold">{d.project}</div>
                                <div className="text-xs text-gray-400">{d.client}</div>
                                </div>
                                <span className="text-yellow-400 font-bold">{d.date}</span>
                            </div>
                            ))
                        )}
                        </div>
                    </div>

                     <div className="bg-[#1e1a2a] rounded-xl p-0 shadow-lg">
                        <div className="flex gap-1 border-b border-[#29253b]">
                        <button
                            className={`flex-1 py-3 px-5 font-medium text-sm ${commTab === 'history' ? 'text-[#b773f8] border-b-2 border-[#b773f8]' : 'text-gray-300'}`}
                            onClick={() => setCommTab('history')}
                        >
                            Communication History
                        </button>
                        <button
                            className={`flex-1 py-3 px-5 font-medium text-sm ${commTab === 'followups' ? 'text-[#b773f8] border-b-2 border-[#b773f8]' : 'text-gray-300'}`}
                            onClick={() => setCommTab('followups')}
                        >
                            Follow-ups
                        </button>
                        </div>
                        <div className="py-5 px-6">
                        {commTab === 'history' ? (
                            HISTORY.map((history, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-[#29253b] last:border-b-0">
                                <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-[#b773f8] text-white text-lg rounded-full w-7 h-7 flex items-center justify-center">✉️</span>
                                    <span className="font-semibold">{history.type}</span>
                                </div>
                                <div className="text-xs text-gray-400">{history.client} - {history.detail} - {history.date}</div>
                                </div>
                            </div>
                            ))
                        ) : (
                            FOLLOWUPS.map((f, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-[#29253b] last:border-b-0">
                                <div>
                                <div className="font-semibold">{f.action}</div>
                                <div className="text-xs text-gray-400">{f.client}</div>
                                </div>
                                <span className="text-yellow-400 font-bold">{f.date}</span>
                            </div>
                            ))
                        )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}