// components/ClientFormModal.tsx
'use client';
import React, { useState } from 'react';

interface ClientFormData {
    name: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
}

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClientFormData) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export default function ClientFormModal({ isOpen, onClose, onSubmit, loading, error }: ClientFormModalProps) {
    const [formData, setFormData] = useState<ClientFormData>({
        name: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        // Clear form after submission attempt
        setFormData({ name: '', contactName: '', contactEmail: '', contactPhone: '' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity">
            <div className="bg-[#1e1a2a] rounded-xl p-8 w-full max-w-lg shadow-2xl text-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#b773f8]">Add New Client</h2>
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
                        placeholder="Company Name (Required)"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-[#29253b] border border-[#29253b] focus:border-[#b773f8] outline-none"
                        required
                        disabled={loading}
                    />
                    <input
                        type="text"
                        name="contactName"
                        placeholder="Contact Person (Required)"
                        value={formData.contactName}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-[#29253b] border border-[#29253b] focus:border-[#b773f8] outline-none"
                        required
                        disabled={loading}
                    />
                    <input
                        type="email"
                        name="contactEmail"
                        placeholder="Contact Email (Required)"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-[#29253b] border border-[#29253b] focus:border-[#b773f8] outline-none"
                        required
                        disabled={loading}
                    />
                    <input
                        type="tel"
                        name="contactPhone"
                        placeholder="Contact Phone (Optional)"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-[#29253b] border border-[#29253b] focus:border-[#b773f8] outline-none"
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        className="bg-[#b773f8] py-3 rounded-lg font-bold text-black hover:bg-[#a65df6] transition disabled:bg-gray-500 mt-2"
                        disabled={loading}
                    >
                        {loading ? 'Adding Client...' : 'Save Client'}
                    </button>
                </form>
            </div>
        </div>
    );
}