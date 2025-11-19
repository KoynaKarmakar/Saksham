// lib/models/Task.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    user: mongoose.Types.ObjectId;
    text: string;
    done: boolean;
    dueDate?: Date;
    priority: 'Low' | 'Medium' | 'High';
}

const TaskSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        done: { type: Boolean, default: false },
        dueDate: { type: Date },
        priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    },
    { timestamps: true }
);

const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
export default Task;