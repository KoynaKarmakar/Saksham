// lib/models/Event.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    date: Date;
    type: 'ProjectDeadline' | 'NetworkEvent' | 'Personal';
    client?: mongoose.Types.ObjectId;
    isAllDay: boolean;
    location?: string;
}

const EventSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true },
        type: { type: String, enum: ['ProjectDeadline', 'NetworkEvent', 'Personal'], required: true },
        client: { type: Schema.Types.ObjectId, ref: 'Client' },
        isAllDay: { type: Boolean, default: false },
        location: { type: String },
    },
    { timestamps: true }
);

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export default Event;