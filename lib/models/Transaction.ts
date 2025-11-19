// lib/models/Transaction.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    user: mongoose.Types.ObjectId;
    client?: mongoose.Types.ObjectId;
    name: string;
    date: Date;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    isTaxDeductible: boolean;
    invoiceId?: mongoose.Types.ObjectId;
}

const TransactionSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        client: { type: Schema.Types.ObjectId, ref: 'Client' },
        name: { type: String, required: true },
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['income', 'expense'], required: true },
        category: { type: String, required: true },
        isTaxDeductible: { type: Boolean, default: false },
        invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    },
    { timestamps: true }
);

const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;