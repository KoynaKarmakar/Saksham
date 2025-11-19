// test/task.event.test.ts

import { NextRequest, NextResponse } from 'next/server';
import User from '../lib/models/User';
import { generateToken } from '../lib/utils/auth';
// Import Handlers
import { GET as getTasksHandler, POST as createTaskHandler } from '../app/api/tasks/route';
import { PUT as updateTaskHandler, DELETE as deleteTaskHandler } from '../app/api/tasks/[id]/route';

import { GET as getEventsHandler, POST as createEventHandler } from '../app/api/events/route';
import { PUT as updateEventHandler, DELETE as deleteEventHandler } from '../app/api/events/[id]/route';


// Mock simulateHandler is assumed to be available

describe('Task and Event CRUD Endpoints (UX Enhancements)', () => {
    let userToken: string;
    let taskId: string;
    let eventId: string;
    const tomorrow = new Date(new Date().getTime() + 86400000).toISOString().substring(0, 10);
    const dayAfter = new Date(new Date().getTime() + 2 * 86400000).toISOString().substring(0, 10);

    beforeAll(async () => {
        const user = await User.create({ name: 'Task Event User', email: 'task-event@test.com', password: 'password' });
        userToken = generateToken(user._id.toString());
    });

    // --- Task Module Tests ---
    describe('Task CRUD', () => {
        // 1. POST /api/tasks
        it('should create a task (201)', async () => {
            const taskData = { text: 'Initial Task for Editing', priority: 'Low', dueDate: tomorrow };
            const res = await simulateHandler(createTaskHandler, 'POST', '/api/tasks', taskData, userToken);
            expect(res.status).toBe(201);
            taskId = res.body.task._id;
        });

        // 2. PUT /api/tasks/:id (UX Enhancement Test)
        it('should update text, priority, and mark done (200)', async () => {
            const update = {
                text: 'Updated Task Text',
                done: true,
                priority: 'High',
                dueDate: dayAfter
            };
            const res = await simulateHandler(updateTaskHandler, 'PUT', `/api/tasks/${taskId}`, update, userToken);
            expect(res.status).toBe(200);
            expect(res.body.task.text).toBe(update.text);
            expect(res.body.task.done).toBe(true);
            expect(res.body.task.priority).toBe('High');
            expect(res.body.task.dueDate).toContain(dayAfter);
        });

        // 3. DELETE /api/tasks/:id
        it('should delete the task (204)', async () => {
            const res = await simulateHandler(deleteTaskHandler, 'DELETE', `/api/tasks/${taskId}`, null, userToken);
            expect(res.status).toBe(204);
        });
    });

    // --- Event Module Tests ---
    describe('Event CRUD', () => {
        // 1. POST /api/events
        it('should create an event (201)', async () => {
            const eventData = { title: 'Initial Event for Editing', date: tomorrow, type: 'ProjectDeadline' };
            const res = await simulateHandler(createEventHandler, 'POST', '/api/events', eventData, userToken);
            expect(res.status).toBe(201);
            eventId = res.body.event._id;
        });

        // 2. PUT /api/events/:id (UX Enhancement Test)
        it('should update event title, type, and date (200)', async () => {
            const update = {
                title: 'New Title After Edit',
                date: dayAfter,
                type: 'NetworkEvent',
                description: 'Updated Description'
            };
            const res = await simulateHandler(updateEventHandler, 'PUT', `/api/events/${eventId}`, update, userToken);
            expect(res.status).toBe(200);
            expect(res.body.event.title).toBe(update.title);
            expect(res.body.event.type).toBe('NetworkEvent');
            expect(res.body.event.description).toBe(update.description);
        });

        // 3. DELETE /api/events/:id (UX Enhancement Test)
        it('should delete the event (204)', async () => {
            const res = await simulateHandler(deleteEventHandler, 'DELETE', `/api/events/${eventId}`, null, userToken);
            expect(res.status).toBe(204);
            const listRes = await simulateHandler(getEventsHandler, 'GET', '/api/events', null, userToken);
            expect(listRes.body.events.length).toBe(0);
        });
    });
});