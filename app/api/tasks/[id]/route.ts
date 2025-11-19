// app/api/tasks/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Task from '@/lib/models/Task';
import mongoose from 'mongoose';

/**
 * Helper to extract ID and ensure it's valid
 */
const getValidId = (req: NextRequest): string | null => {
    const urlParts = req.url.split('/');
    const id = urlParts[urlParts.length - 1];
    return id && mongoose.Types.ObjectId.isValid(id) ? id : null;
}

/**
 * PUT handler to update a task (text, done, priority, dueDate).
 * Endpoint: PUT /api/tasks/:id
 */
const updateTaskHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const taskId = getValidId(req);
    if (!taskId) {
        return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
    }

    const body = await req.json();

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, user: user._id },
            {
                text: body.text,
                done: body.done,
                priority: body.priority,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return NextResponse.json({ message: 'Task not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ task: updatedTask }, { status: 200 });
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ message: 'Server error during task update' }, { status: 500 });
    }
};

export const PUT = protect(updateTaskHandler);