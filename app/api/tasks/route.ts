// app/api/tasks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';
import Task from '@/lib/models/Task';

/**
 * GET handler to fetch all tasks for the user.
 * Endpoint: GET /api/tasks
 */
const getTasksHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    try {
        const tasks = await Task.find({ user: user._id }).sort({ createdAt: -1 });
        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ message: 'Failed to fetch tasks' }, { status: 500 });
    }
};

/**
 * POST handler to create a new task.
 * Endpoint: POST /api/tasks
 */
const createTaskHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    const { text, dueDate, priority } = await req.json();

    if (!text) {
        return NextResponse.json({ message: 'Task text is required' }, { status: 400 });
    }

    try {
        const newTask = await Task.create({
            user: user._id,
            text,
            dueDate,
            priority,
        });
        return NextResponse.json({ task: newTask }, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ message: 'Failed to create task' }, { status: 500 });
    }
};

export const GET = protect(getTasksHandler);
export const POST = protect(createTaskHandler);