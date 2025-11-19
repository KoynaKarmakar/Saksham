// lib/models/Fund.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IFund extends Document {
    user: mongoose.Types.ObjectId;
    type: 'EmergencyFund' | 'PaidLeaveFund';
    currentAmount: number;
    goalAmount: number;
}

const FundSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['EmergencyFund', 'PaidLeaveFund'], required: true },
        currentAmount: { type: Number, default: 0 },
        goalAmount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Unique compound index
FundSchema.index({ user: 1, type: 1 }, { unique: true });

const Fund = mongoose.models.Fund || mongoose.model<IFund>('Fund', FundSchema);
export default Fund;