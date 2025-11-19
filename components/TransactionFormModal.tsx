// components/TransactionFormModal.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api'; // Assuming lib/api.ts is available

// --- Hooks ---

interface ClientOption {
    _id: string;
    name: string;
}

/** Custom hook to fetch active clients for the transaction form. */
const useClientOptions = () => {
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            try {
                // Endpoint fetches all clients, we use the raw backend object here
                const { clients: fetchedClients } = await apiFetch('/clients', { method: 'GET' });
                const options = fetchedClients.map((c: any) => ({
                    _id: c._id,
                    name: c.name,
                }));
                setClients(options);
            } catch (error) {
                console.error("Failed to fetch clients for form:", error);
                setClients([]); // Fallback to empty list on error
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    return { clients, loading };
};

// --- Component ---

interface TransactionFormData {
    name: string;
    amount: string; // Use string for input handling
    type: 'income' | 'expense';
    category: string;
    date: string; // YYYY-MM-DD
    client: string; // Client ID
}

interface TransactionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TransactionFormData) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export default function TransactionFormModal({ isOpen, onClose, onSubmit, loading, error }: TransactionFormModalProps) {
    const { clients, loading: clientsLoading } = useClientOptions();

    const [formData, setFormData] = useState<TransactionFormData>({
        name: '',
        amount: '',
        type: 'income',
        category: 'Consulting',
        date: new Date().toISOString().substring(0, 10), // Default to today
        client: '',
    });

    const CATEGORIES = {
        income: ["Consulting", "Project Fee", "Bonus", "Other Income"],
        expense: ["Software", "Marketing", "Office Supplies", "Taxes", "Travel", "Other Expense"],
    };

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset category if type changes
        if (name === 'type') {
            const newType = value as 'income' | 'expense';
            setFormData(prev => ({
                ...prev,
                type: newType,
                category: newType === 'income' ? 'Consulting' : 'Software'
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity">
            <div className="bg-[#1e1a2a] rounded-xl p-8 w-full max-w-lg shadow-2xl text-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#b773f8]">Add New Transaction</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/50 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <input
                        type="text"
                        name="name"
                        placeholder="Description (e.g., Acme Project Payment)"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-[#29253b] border focus:border-[#b773f8] outline-none"
                        required
                        disabled={loading}
                    />

                    <div className='grid grid-cols-2 gap-4'>
                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount (₹)"
                            value={formData.amount}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            className="p-3 rounded-lg bg-[#29253b] border focus:border-[#b773f8] outline-none"
                            required
                            disabled={loading}
                        />
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="p-3 rounded-lg bg-[#29253b] border focus:border-[#b773f8] outline-none"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className='grid grid-cols-3 gap-4'>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="p-3 rounded-lg bg-[#29253b] border focus:border-[#b773f8] outline-none"
                            disabled={loading}
                        >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>

                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="p-3 rounded-lg bg-[#29253b] border focus:border-[#b773f8] outline-none"
                            disabled={loading}
                        >
                            {CATEGORIES[formData.type].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            name="client"
                            value={formData.client}
                            onChange={handleChange}
                            className="p-3 rounded-lg bg-[#29253b] border focus:border-[#b773f8] outline-none"
                            disabled={loading || clientsLoading}
                        >
                            <option value="">{clientsLoading ? 'Loading Clients...' : 'Select Client (Optional)'}</option>
                            {clients.map(client => (
                                <option key={client._id} value={client._id}>{client.name}</option>
                            ))}
                        </select>

                    </div>

                    <button
                        type="submit"
                        className="bg-[#b773f8] py-3 rounded-lg font-bold text-black hover:bg-[#a65df6] transition disabled:bg-gray-500 mt-2"
                        disabled={loading}
                    >
                        {loading ? 'Saving Transaction...' : 'Save Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
}