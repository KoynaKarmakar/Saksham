// lib/models/Client.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    status: 'Active' | 'Inactive';
    projectsCount: number;
    totalBilled: number;
    lastContactDate?: Date;
}

const ClientSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true },
        contactName: { type: String, required: true, trim: true },
        contactEmail: { type: String, required: true, trim: true },
        contactPhone: { type: String },
        status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
        projectsCount: { type: Number, default: 0 },
        totalBilled: { type: Number, default: 0 },
        lastContactDate: { type: Date },
    },
    { timestamps: true }
);

const Client = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
export default Client;